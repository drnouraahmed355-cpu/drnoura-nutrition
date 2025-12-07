import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate and authorize admin
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 2. Validate patientId
    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json(
        { 
          error: 'Patient ID is required',
          code: 'MISSING_PATIENT_ID'
        },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(patientId))) {
      return NextResponse.json(
        { 
          error: 'Valid patient ID is required',
          code: 'INVALID_PATIENT_ID'
        },
        { status: 400 }
      );
    }

    // 3. Find patient by id
    const patient = await db.select()
      .from(patients)
      .where(eq(patients.id, parseInt(patientId)))
      .limit(1);

    // 4. Return 404 if patient not found
    if (patient.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientRecord = patient[0];

    // 5. Check if patient already has userId (account exists)
    if (patientRecord.userId) {
      // 6. Return 400 if account already exists
      return NextResponse.json(
        { 
          error: 'Patient already has an account',
          code: 'ACCOUNT_ALREADY_EXISTS'
        },
        { status: 400 }
      );
    }

    // 7. Generate random password
    const plainPassword = generatePassword();

    // 8. Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 9. Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 10. Insert into user table
    const newUser = await db.insert(user).values({
      id: userId,
      name: patientRecord.fullName,
      email: patientRecord.email || `patient_${patientRecord.nationalId}@temp.local`,
      role: 'patient',
      passwordNeedsChange: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 11. Generate account ID
    const accountId = `account_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 12. Insert into account table
    await db.insert(account).values({
      id: accountId,
      accountId: patientRecord.nationalId,
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 13. Update patients table with userId
    await db.update(patients)
      .set({
        userId: userId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(patients.id, parseInt(patientId)))
      .returning();

    // 14. Return success with credentials
    return NextResponse.json(
      {
        success: true,
        data: {
          patientId: parseInt(patientId),
          userId: userId,
          credentials: {
            username: patientRecord.nationalId,
            password: plainPassword,
          },
        },
        message: 'Patient account created successfully. Please save the credentials.',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}