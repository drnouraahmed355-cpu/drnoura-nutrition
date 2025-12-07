import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, patientMeasurements } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify role is patient
    if (user.role !== 'patient') {
      return NextResponse.json(
        { 
          error: 'Access denied. Only patients can access their measurements.',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Find patient by userId
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { 
          error: 'Patient record not found',
          code: 'PATIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const patientId = patient[0].id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get measurements with pagination
    const measurements = await db
      .select()
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, patientId))
      .orderBy(desc(patientMeasurements.measuredAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select()
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, patientId));

    const total = totalResult.length;

    return NextResponse.json(
      {
        success: true,
        data: measurements,
        total: total
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}