import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, user, account } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          success: false,
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const patientRecord = await db.select({
        patient: patients,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      })
        .from(patients)
        .leftJoin(user, eq(patients.userId, user.id))
        .where(eq(patients.id, parseInt(id)))
        .limit(1);

      if (patientRecord.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: 'Patient not found' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          ...patientRecord[0].patient,
          user: patientRecord[0].user
        }
      });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query = db.select({
      patient: patients,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }
    })
      .from(patients)
      .leftJoin(user, eq(patients.userId, user.id));

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(patients.fullName, `%${search}%`),
          like(patients.nationalId, `%${search}%`),
          like(patients.email, `%${search}%`),
          like(patients.phone, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(patients.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(patients.createdAt))
      .limit(limit)
      .offset(offset);

    let countQuery = db.select({ count: patients.id }).from(patients);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalResult = await countQuery;
    const total = totalResult.length;

    return NextResponse.json({
      success: true,
      data: results.map(r => ({
        ...r.patient,
        user: r.user
      })),
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        success: false,
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { 
      nationalId, 
      fullName, 
      email,
      age,
      gender,
      phone,
      weightCurrent,
      height,
      bmi,
      bodyFatPercentage,
      metabolismRate,
      medicalConditions,
      allergies,
      emergencyContact,
      profilePhoto,
      status
    } = body;

    if (!nationalId || !fullName || !email) {
      return NextResponse.json({ 
        success: false,
        error: 'Required fields are missing: nationalId, fullName, email',
        code: 'MISSING_REQUIRED_FIELDS' 
      }, { status: 400 });
    }

    if (!/^\d{14}$/.test(nationalId)) {
      return NextResponse.json({ 
        success: false,
        error: 'National ID must be exactly 14 digits',
        code: 'INVALID_NATIONAL_ID' 
      }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL' 
      }, { status: 400 });
    }

    const existingPatient = await db.select()
      .from(patients)
      .where(eq(patients.nationalId, nationalId))
      .limit(1);

    if (existingPatient.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Patient with this national ID already exists',
        code: 'DUPLICATE_NATIONAL_ID' 
      }, { status: 409 });
    }

    const existingEmail = await db.select()
      .from(patients)
      .where(eq(patients.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Patient with this email already exists',
        code: 'DUPLICATE_EMAIL' 
      }, { status: 409 });
    }

    const existingUserEmail = await db.select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (existingUserEmail.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Email already in use',
        code: 'DUPLICATE_EMAIL' 
      }, { status: 409 });
    }

    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(user).values({
      id: userId,
      name: fullName,
      email: email.toLowerCase(),
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(account).values({
      id: accountId,
      accountId: email.toLowerCase(),
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    let calculatedBmi = bmi;
    if (weightCurrent && height && !bmi) {
      const heightInMeters = height / 100;
      calculatedBmi = weightCurrent / (heightInMeters * heightInMeters);
      calculatedBmi = Math.round(calculatedBmi * 100) / 100;
    }

    const newPatient = await db.insert(patients).values({
      userId: userId,
      nationalId: nationalId.trim(),
      fullName: fullName.trim(),
      age: age || null,
      gender: gender?.trim() || null,
      phone: phone?.trim() || null,
      email: email.toLowerCase().trim(),
      weightCurrent: weightCurrent || null,
      height: height || null,
      bmi: calculatedBmi || null,
      bodyFatPercentage: bodyFatPercentage || null,
      metabolismRate: metabolismRate || null,
      medicalConditions: medicalConditions || null,
      allergies: allergies || null,
      emergencyContact: emergencyContact?.trim() || null,
      profilePhoto: profilePhoto?.trim() || null,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json({
      success: true,
      data: newPatient[0],
      credentials: {
        email: email.toLowerCase(),
        password: plainPassword
      },
      message: 'Patient created successfully. Please save the credentials.'
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false,
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body || 'nationalId' in body || 'id' in body) {
      return NextResponse.json({ 
        success: false,
        error: "Cannot update userId, nationalId, or id fields",
        code: "FORBIDDEN_FIELD_UPDATE" 
      }, { status: 400 });
    }

    const existingPatient = await db.select()
      .from(patients)
      .where(eq(patients.id, parseInt(id)))
      .limit(1);

    if (existingPatient.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Patient not found' 
      }, { status: 404 });
    }

    const { 
      fullName,
      age,
      gender,
      phone,
      email,
      weightCurrent,
      height,
      bmi,
      bodyFatPercentage,
      metabolismRate,
      medicalConditions,
      allergies,
      emergencyContact,
      profilePhoto,
      status
    } = body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ 
          success: false,
          error: 'Invalid email format',
          code: 'INVALID_EMAIL' 
        }, { status: 400 });
      }

      const existingEmail = await db.select()
        .from(patients)
        .where(and(
          eq(patients.email, email),
          eq(patients.id, parseInt(id))
        ))
        .limit(1);

      if (existingEmail.length === 0) {
        const duplicateEmail = await db.select()
          .from(patients)
          .where(eq(patients.email, email))
          .limit(1);

        if (duplicateEmail.length > 0) {
          return NextResponse.json({ 
            success: false,
            error: 'Email already in use by another patient',
            code: 'DUPLICATE_EMAIL' 
          }, { status: 409 });
        }
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (age !== undefined) updates.age = age;
    if (gender !== undefined) updates.gender = gender?.trim();
    if (phone !== undefined) updates.phone = phone?.trim();
    if (email !== undefined) updates.email = email.toLowerCase().trim();
    if (weightCurrent !== undefined) updates.weightCurrent = weightCurrent;
    if (height !== undefined) updates.height = height;
    if (bodyFatPercentage !== undefined) updates.bodyFatPercentage = bodyFatPercentage;
    if (metabolismRate !== undefined) updates.metabolismRate = metabolismRate;
    if (medicalConditions !== undefined) updates.medicalConditions = medicalConditions;
    if (allergies !== undefined) updates.allergies = allergies;
    if (emergencyContact !== undefined) updates.emergencyContact = emergencyContact?.trim();
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto?.trim();
    if (status !== undefined) updates.status = status;

    const currentWeight = weightCurrent !== undefined ? weightCurrent : existingPatient[0].weightCurrent;
    const currentHeight = height !== undefined ? height : existingPatient[0].height;

    if (bmi !== undefined) {
      updates.bmi = bmi;
    } else if (currentWeight && currentHeight) {
      const heightInMeters = currentHeight / 100;
      const calculatedBmi = currentWeight / (heightInMeters * heightInMeters);
      updates.bmi = Math.round(calculatedBmi * 100) / 100;
    }

    const updatedPatient = await db.update(patients)
      .set(updates)
      .where(eq(patients.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedPatient[0],
      message: 'Patient updated successfully'
    });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false,
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const existingPatient = await db.select()
      .from(patients)
      .where(eq(patients.id, parseInt(id)))
      .limit(1);

    if (existingPatient.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Patient not found' 
      }, { status: 404 });
    }

    const deletedPatient = await db.update(patients)
      .set({
        status: 'inactive',
        updatedAt: new Date().toISOString()
      })
      .where(eq(patients.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: deletedPatient[0],
      message: 'Patient soft deleted successfully (status set to inactive)'
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}