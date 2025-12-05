import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Valid patient ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const result = await db
      .select({
        id: patients.id,
        userId: patients.userId,
        nationalId: patients.nationalId,
        fullName: patients.fullName,
        age: patients.age,
        gender: patients.gender,
        phone: patients.phone,
        email: patients.email,
        weightCurrent: patients.weightCurrent,
        height: patients.height,
        bmi: patients.bmi,
        bodyFatPercentage: patients.bodyFatPercentage,
        metabolismRate: patients.metabolismRate,
        medicalConditions: patients.medicalConditions,
        allergies: patients.allergies,
        emergencyContact: patients.emergencyContact,
        profilePhoto: patients.profilePhoto,
        status: patients.status,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(patients)
      .leftJoin(user, eq(patients.userId, user.id))
      .where(
        and(
          eq(patients.id, parseInt(id)),
          eq(patients.userId, authenticatedUser.id)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('GET patient error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Valid patient ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    const existingPatient = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, parseInt(id)),
          eq(patients.userId, authenticatedUser.id)
        )
      )
      .limit(1);

    if (existingPatient.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const allowedFields = [
      'fullName',
      'age',
      'gender',
      'phone',
      'email',
      'weightCurrent',
      'height',
      'bmi',
      'bodyFatPercentage',
      'metabolismRate',
      'medicalConditions',
      'allergies',
      'emergencyContact',
      'profilePhoto',
      'status'
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid email format',
            code: 'INVALID_EMAIL'
          },
          { status: 400 }
        );
      }
      updates.email = updates.email.toLowerCase();
    }

    const currentWeight = updates.weightCurrent ?? existingPatient[0].weightCurrent;
    const currentHeight = updates.height ?? existingPatient[0].height;

    if (('weightCurrent' in updates || 'height' in updates) && currentWeight && currentHeight) {
      const heightInMeters = currentHeight;
      updates.bmi = parseFloat((currentWeight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(patients)
      .set(updates)
      .where(
        and(
          eq(patients.id, parseInt(id)),
          eq(patients.userId, authenticatedUser.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update patient',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated[0],
      message: 'Patient updated successfully'
    });

  } catch (error) {
    console.error('PUT patient error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Valid patient ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const existingPatient = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, parseInt(id)),
          eq(patients.userId, authenticatedUser.id)
        )
      )
      .limit(1);

    if (existingPatient.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const updated = await db
      .update(patients)
      .set({
        status: 'inactive',
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(patients.id, parseInt(id)),
          eq(patients.userId, authenticatedUser.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete patient',
          code: 'DELETE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated[0],
      message: 'Patient deleted successfully'
    });

  } catch (error) {
    console.error('DELETE patient error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}