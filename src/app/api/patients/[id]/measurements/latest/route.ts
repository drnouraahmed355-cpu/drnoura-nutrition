import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patientMeasurements } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    // Validate patientId
    if (!patientId || isNaN(parseInt(patientId))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid patient ID is required',
          code: 'INVALID_PATIENT_ID',
        },
        { status: 400 }
      );
    }

    // Query latest measurement for the patient
    const latestMeasurement = await db
      .select()
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, parseInt(patientId)))
      .orderBy(desc(patientMeasurements.measuredAt))
      .limit(1);

    // Check if measurement exists
    if (latestMeasurement.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No measurements found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: latestMeasurement[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET latest measurement error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}