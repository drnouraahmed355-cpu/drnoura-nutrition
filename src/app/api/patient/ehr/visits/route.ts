import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, visitRecords } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and verify role
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user has patient role
    if (user.role !== 'patient') {
      return NextResponse.json(
        { 
          error: 'Forbidden: Patient role required',
          code: 'FORBIDDEN_ROLE'
        },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Find patient record for authenticated user
    const patientRecord = await db.select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (patientRecord.length === 0) {
      return NextResponse.json(
        { 
          error: 'Patient record not found',
          code: 'PATIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const patient = patientRecord[0];

    // Get total count of visit records for this patient
    const totalResult = await db.select({ 
      count: sql<number>`count(*)` 
    })
      .from(visitRecords)
      .where(eq(visitRecords.patientId, patient.id));

    const total = Number(totalResult[0]?.count ?? 0);

    // Get visit records for the patient, ordered by visitDate DESC (most recent first)
    const visits = await db.select()
      .from(visitRecords)
      .where(eq(visitRecords.patientId, patient.id))
      .orderBy(desc(visitRecords.visitDate))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: visits,
      total
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/patient/ehr/visits error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}