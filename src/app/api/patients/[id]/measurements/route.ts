import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patientMeasurements, patients } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const patientId = params.patientId;
    if (!patientId || isNaN(parseInt(patientId))) {
      return NextResponse.json(
        { success: false, error: 'Valid patient ID is required', code: 'INVALID_PATIENT_ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Verify patient exists and belongs to user
    const patient = await db.select()
      .from(patients)
      .where(eq(patients.id, parseInt(patientId)))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found', code: 'PATIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (patient[0].userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Get measurements sorted by most recent first
    const measurements = await db.select()
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, parseInt(patientId)))
      .orderBy(desc(patientMeasurements.measuredAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCount = await db.select()
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, parseInt(patientId)));

    return NextResponse.json({
      success: true,
      data: measurements,
      total: totalCount.length
    }, { status: 200 });

  } catch (error) {
    console.error('GET measurements error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const patientId = params.patientId;
    if (!patientId || isNaN(parseInt(patientId))) {
      return NextResponse.json(
        { success: false, error: 'Valid patient ID is required', code: 'INVALID_PATIENT_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if patientId provided in body
    if ('patientId' in body || 'patient_id' in body) {
      return NextResponse.json(
        { success: false, error: 'Patient ID cannot be provided in request body', code: 'PATIENT_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const {
      weight,
      chest,
      waist,
      hips,
      arms,
      thighs,
      bodyFat,
      muscleMass,
      notes,
      measuredAt
    } = body;

    // Verify patient exists and belongs to user
    const patient = await db.select()
      .from(patients)
      .where(eq(patients.id, parseInt(patientId)))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found', code: 'PATIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (patient[0].userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Validate at least one measurement field is provided
    const hasMeasurement = weight !== undefined || 
                          chest !== undefined || 
                          waist !== undefined || 
                          hips !== undefined || 
                          arms !== undefined || 
                          thighs !== undefined || 
                          bodyFat !== undefined || 
                          muscleMass !== undefined;

    if (!hasMeasurement) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one measurement field is required (weight, chest, waist, hips, arms, thighs, bodyFat, or muscleMass)', 
          code: 'NO_MEASUREMENTS_PROVIDED' 
        },
        { status: 400 }
      );
    }

    // Validate numeric fields if provided
    const numericFields = { weight, chest, waist, hips, arms, thighs, bodyFat, muscleMass };
    for (const [field, value] of Object.entries(numericFields)) {
      if (value !== undefined && value !== null) {
        if (typeof value !== 'number' || isNaN(value) || value < 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: `${field} must be a valid positive number`, 
              code: 'INVALID_MEASUREMENT_VALUE' 
            },
            { status: 400 }
          );
        }
      }
    }

    // Auto-generate timestamps
    const now = new Date().toISOString();
    const measurementDate = measuredAt || now;

    // Validate measuredAt format if provided
    if (measuredAt) {
      const date = new Date(measuredAt);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid measuredAt date format', code: 'INVALID_DATE_FORMAT' },
          { status: 400 }
        );
      }
    }

    // Create measurement record
    const newMeasurement = await db.insert(patientMeasurements)
      .values({
        patientId: parseInt(patientId),
        weight: weight !== undefined ? weight : null,
        chest: chest !== undefined ? chest : null,
        waist: waist !== undefined ? waist : null,
        hips: hips !== undefined ? hips : null,
        arms: arms !== undefined ? arms : null,
        thighs: thighs !== undefined ? thighs : null,
        bodyFat: bodyFat !== undefined ? bodyFat : null,
        muscleMass: muscleMass !== undefined ? muscleMass : null,
        notes: notes ? notes.trim() : null,
        measuredAt: measurementDate,
        createdAt: now
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newMeasurement[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST measurement error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}