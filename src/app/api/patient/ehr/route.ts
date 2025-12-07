import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  patients, 
  patientMeasurements, 
  dietPlans, 
  medications, 
  appointments, 
  visitRecords, 
  progressPhotos, 
  weeklyProgress 
} from '@/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Verify role is patient
    if (user.role !== 'patient') {
      return NextResponse.json({ 
        error: 'Access denied. Patient role required',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Find patient record
    const patientRecord = await db.select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (patientRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Patient record not found',
        code: 'PATIENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const patient = patientRecord[0];
    const patientId = patient.id;

    // Get latest 10 measurements
    const measurements = await db.select()
      .from(patientMeasurements)
      .where(eq(patientMeasurements.patientId, patientId))
      .orderBy(desc(patientMeasurements.measuredAt))
      .limit(10);

    // Get all active diet plans
    const activeDietPlans = await db.select()
      .from(dietPlans)
      .where(
        and(
          eq(dietPlans.patientId, patientId),
          eq(dietPlans.status, 'active')
        )
      )
      .orderBy(desc(dietPlans.startDate));

    // Get all active medications
    const activeMedications = await db.select()
      .from(medications)
      .where(
        and(
          eq(medications.patientId, patientId),
          eq(medications.status, 'active')
        )
      )
      .orderBy(desc(medications.startDate));

    // Get upcoming appointments
    const today = new Date().toISOString().split('T')[0];
    const upcomingAppointments = await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.patientId, patientId),
          eq(appointments.status, 'scheduled'),
          gte(appointments.appointmentDate, today)
        )
      )
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);

    // Get latest 5 visit records
    const visits = await db.select()
      .from(visitRecords)
      .where(eq(visitRecords.patientId, patientId))
      .orderBy(desc(visitRecords.visitDate))
      .limit(5);

    // Get latest 10 progress photos
    const photos = await db.select()
      .from(progressPhotos)
      .where(eq(progressPhotos.patientId, patientId))
      .orderBy(desc(progressPhotos.takenAt))
      .limit(10);

    // Get latest 5 weekly progress
    const weeklyProgressRecords = await db.select()
      .from(weeklyProgress)
      .where(eq(weeklyProgress.patientId, patientId))
      .orderBy(desc(weeklyProgress.weekNumber))
      .limit(5);

    // Return complete EHR
    return NextResponse.json({
      success: true,
      data: {
        patient,
        measurements,
        dietPlans: activeDietPlans,
        medications: activeMedications,
        appointments: upcomingAppointments,
        visitRecords: visits,
        progressPhotos: photos,
        weeklyProgress: weeklyProgressRecords
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}