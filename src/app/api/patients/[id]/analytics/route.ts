import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, patientMeasurements, weeklyProgress, visitRecords, dietPlans } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { patientId } = await params;

    if (!patientId || isNaN(parseInt(patientId))) {
      return NextResponse.json(
        { success: false, error: 'Valid patient ID is required', code: 'INVALID_PATIENT_ID' },
        { status: 400 }
      );
    }

    const patientIdInt = parseInt(patientId);

    // Get patient details
    const patient = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientIdInt), eq(patients.userId, user.id)))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found', code: 'PATIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get weight history (last 12 measurements)
    const weightHistory = await db
      .select({
        date: patientMeasurements.measuredAt,
        weight: patientMeasurements.weight,
      })
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, patientIdInt))
      .orderBy(desc(patientMeasurements.measuredAt))
      .limit(12);

    // Reverse to show chronological order
    const weightHistoryChronological = weightHistory.reverse();

    // Get body measurements trend (last 12 measurements)
    const measurementsTrend = await db
      .select({
        date: patientMeasurements.measuredAt,
        chest: patientMeasurements.chest,
        waist: patientMeasurements.waist,
        hips: patientMeasurements.hips,
      })
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, patientIdInt))
      .orderBy(desc(patientMeasurements.measuredAt))
      .limit(12);

    // Reverse to show chronological order
    const measurementsTrendChronological = measurementsTrend.reverse();

    // Get all measurements for weight change calculation
    const allMeasurements = await db
      .select({
        weight: patientMeasurements.weight,
        measuredAt: patientMeasurements.measuredAt,
      })
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, patientIdInt))
      .orderBy(patientMeasurements.measuredAt);

    // Calculate total weight change
    let totalWeightChange = 0;
    if (allMeasurements.length >= 2) {
      const firstWeight = allMeasurements[0].weight;
      const latestWeight = allMeasurements[allMeasurements.length - 1].weight;
      if (firstWeight && latestWeight) {
        totalWeightChange = firstWeight - latestWeight;
      }
    }

    // Get weekly progress summary
    const weeklyProgressData = await db
      .select({
        complianceRate: weeklyProgress.complianceRate,
      })
      .from(weeklyProgress)
      .where(eq(weeklyProgress.patientId, patientIdInt));

    // Calculate average compliance
    let averageCompliance = 0;
    if (weeklyProgressData.length > 0) {
      const totalCompliance = weeklyProgressData.reduce(
        (sum, record) => sum + (record.complianceRate || 0),
        0
      );
      averageCompliance = Math.round(totalCompliance / weeklyProgressData.length);
    }

    const totalWeeks = weeklyProgressData.length;

    // Get visit statistics
    const visitRecordsData = await db
      .select({
        visitDate: visitRecords.visitDate,
      })
      .from(visitRecords)
      .where(eq(visitRecords.patientId, patientIdInt))
      .orderBy(desc(visitRecords.visitDate));

    const totalVisits = visitRecordsData.length;
    const latestVisitDate = visitRecordsData.length > 0 ? visitRecordsData[0].visitDate : null;

    // Get diet plan statistics
    const allDietPlans = await db
      .select({
        status: dietPlans.status,
      })
      .from(dietPlans)
      .where(eq(dietPlans.patientId, patientIdInt));

    const activePlans = allDietPlans.filter(plan => plan.status === 'active').length;
    const totalPlans = allDietPlans.length;

    // Prepare response
    const analyticsData = {
      patient: patient[0],
      weightHistory: weightHistoryChronological.map(record => ({
        date: record.date,
        weight: record.weight,
      })),
      measurementsTrend: measurementsTrendChronological.map(record => ({
        date: record.date,
        chest: record.chest,
        waist: record.waist,
        hips: record.hips,
      })),
      weeklyProgressSummary: {
        totalWeightChange,
        averageCompliance,
        totalWeeks,
      },
      visitStats: {
        totalVisits,
        latestVisitDate,
      },
      dietPlanStats: {
        activePlans,
        totalPlans,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: analyticsData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET patient analytics error:', error);
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