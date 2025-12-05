import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid patient ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const patientId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { newPassword, currentPassword } = body;

    // Validate new password
    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password is required',
          code: 'MISSING_NEW_PASSWORD',
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters long',
          code: 'PASSWORD_TOO_SHORT',
        },
        { status: 400 }
      );
    }

    // Find patient by ID to get userId
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
          code: 'PATIENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const userId = patient[0].userId;

    // Find account record by userId where providerId='credential'
    const userAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential')
        )
      )
      .limit(1);

    if (userAccount.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found for this patient',
          code: 'ACCOUNT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Optional: Validate current password if provided
    if (currentPassword && userAccount[0].password) {
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        userAccount[0].password
      );

      if (!isValidPassword) {
        return NextResponse.json(
          {
            success: false,
            error: 'Current password is incorrect',
            code: 'INVALID_CURRENT_PASSWORD',
          },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update account password
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccount[0].id));

    return NextResponse.json(
      {
        success: true,
        message: 'Password updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/patients/[id]/change-password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}