import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weeklyProgress, patients } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = parseInt(params.patientId);
    
    if (!patientId || isNaN(patientId)) {
      return NextResponse.json({
        success: false,
        error: 'Valid patient ID is required',
        code: 'INVALID_PATIENT_ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { weekNumber, startDate, endDate, weightChange, complianceRate, notes } = body;

    // Validate required fields
    if (!weekNumber) {
      return NextResponse.json({
        success: false,
        error: 'Week number is required',
        code: 'MISSING_WEEK_NUMBER'
      }, { status: 400 });
    }

    if (!startDate) {
      return NextResponse.json({
        success: false,
        error: 'Start date is required',
        code: 'MISSING_START_DATE'
      }, { status: 400 });
    }

    if (!endDate) {
      return NextResponse.json({
        success: false,
        error: 'End date is required',
        code: 'MISSING_END_DATE'
      }, { status: 400 });
    }

    // Validate complianceRate if provided
    if (complianceRate !== undefined && complianceRate !== null) {
      const rate = parseInt(complianceRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return NextResponse.json({
          success: false,
          error: 'Compliance rate must be between 0 and 100',
          code: 'INVALID_COMPLIANCE_RATE'
        }, { status: 400 });
      }
    }

    // Validate patient exists
    const patient = await db.select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      }, { status: 404 });
    }

    // Create weekly progress record
    const newProgress = await db.insert(weeklyProgress)
      .values({
        patientId,
        weekNumber: parseInt(weekNumber),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        weightChange: weightChange !== undefined ? parseFloat(weightChange) : null,
        complianceRate: complianceRate !== undefined ? parseInt(complianceRate) : null,
        notes: notes ? notes.trim() : null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newProgress[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST weekly progress error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = parseInt(params.patientId);
    
    if (!patientId || isNaN(patientId)) {
      return NextResponse.json({
        success: false,
        error: 'Valid patient ID is required',
        code: 'INVALID_PATIENT_ID'
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get weekly progress records for patient
    const progressRecords = await db.select()
      .from(weeklyProgress)
      .where(eq(weeklyProgress.patientId, patientId))
      .orderBy(desc(weeklyProgress.weekNumber))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalRecords = await db.select()
      .from(weeklyProgress)
      .where(eq(weeklyProgress.patientId, patientId));

    return NextResponse.json({
      success: true,
      data: progressRecords,
      total: totalRecords.length
    }, { status: 200 });

  } catch (error) {
    console.error('GET weekly progress error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}