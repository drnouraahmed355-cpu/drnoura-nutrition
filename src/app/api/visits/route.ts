import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { visitRecords, patients, appointments } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Security check: reject if userId provided in body
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

    const {
      patientId,
      appointmentId,
      visitDate,
      weight,
      bloodPressure,
      notes,
      progressAssessment,
      nextVisitDate
    } = body;

    // Validate required fields
    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient ID is required',
          code: 'MISSING_PATIENT_ID'
        },
        { status: 400 }
      );
    }

    if (!visitDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Visit date is required',
          code: 'MISSING_VISIT_DATE'
        },
        { status: 400 }
      );
    }

    // Validate patientId is a valid integer
    const parsedPatientId = parseInt(patientId);
    if (isNaN(parsedPatientId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid patient ID',
          code: 'INVALID_PATIENT_ID'
        },
        { status: 400 }
      );
    }

    // Verify patient exists and belongs to authenticated user
    const patient = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, parsedPatientId), eq(patients.userId, user.id)))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // If appointmentId provided, validate it exists and belongs to this patient
    if (appointmentId) {
      const parsedAppointmentId = parseInt(appointmentId);
      if (isNaN(parsedAppointmentId)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid appointment ID',
            code: 'INVALID_APPOINTMENT_ID'
          },
          { status: 400 }
        );
      }

      const appointment = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, parsedAppointmentId), eq(appointments.patientId, parsedPatientId)))
        .limit(1);

      if (appointment.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Appointment not found',
            code: 'APPOINTMENT_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      // Update appointment status to completed
      await db
        .update(appointments)
        .set({
          status: 'completed',
          updatedAt: new Date().toISOString()
        })
        .where(eq(appointments.id, parsedAppointmentId));
    }

    // Create visit record
    const newVisitRecord = await db
      .insert(visitRecords)
      .values({
        patientId: parsedPatientId,
        appointmentId: appointmentId ? parseInt(appointmentId) : null,
        visitDate: visitDate.trim(),
        weight: weight ? parseFloat(weight) : null,
        bloodPressure: bloodPressure ? bloodPressure.trim() : null,
        notes: notes ? notes.trim() : null,
        progressAssessment: progressAssessment ? progressAssessment.trim() : null,
        nextVisitDate: nextVisitDate ? nextVisitDate.trim() : null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newVisitRecord[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db
      .select({
        id: visitRecords.id,
        patientId: visitRecords.patientId,
        appointmentId: visitRecords.appointmentId,
        visitDate: visitRecords.visitDate,
        weight: visitRecords.weight,
        bloodPressure: visitRecords.bloodPressure,
        notes: visitRecords.notes,
        progressAssessment: visitRecords.progressAssessment,
        nextVisitDate: visitRecords.nextVisitDate,
        createdAt: visitRecords.createdAt,
        patientFullName: patients.fullName
      })
      .from(visitRecords)
      .innerJoin(patients, eq(visitRecords.patientId, patients.id))
      .where(eq(patients.userId, user.id))
      .orderBy(desc(visitRecords.visitDate))
      .$dynamic();

    // Filter by patientId if provided
    if (patientId) {
      const parsedPatientId = parseInt(patientId);
      if (isNaN(parsedPatientId)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid patient ID',
            code: 'INVALID_PATIENT_ID'
          },
          { status: 400 }
        );
      }

      // Verify patient belongs to authenticated user
      const patient = await db
        .select()
        .from(patients)
        .where(and(eq(patients.id, parsedPatientId), eq(patients.userId, user.id)))
        .limit(1);

      if (patient.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Patient not found',
            code: 'PATIENT_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      query = db
        .select({
          id: visitRecords.id,
          patientId: visitRecords.patientId,
          appointmentId: visitRecords.appointmentId,
          visitDate: visitRecords.visitDate,
          weight: visitRecords.weight,
          bloodPressure: visitRecords.bloodPressure,
          notes: visitRecords.notes,
          progressAssessment: visitRecords.progressAssessment,
          nextVisitDate: visitRecords.nextVisitDate,
          createdAt: visitRecords.createdAt,
          patientFullName: patients.fullName
        })
        .from(visitRecords)
        .innerJoin(patients, eq(visitRecords.patientId, patients.id))
        .where(and(eq(patients.userId, user.id), eq(visitRecords.patientId, parsedPatientId)))
        .orderBy(desc(visitRecords.visitDate))
        .$dynamic();
    }

    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    let countQuery = db
      .select({ count: visitRecords.id })
      .from(visitRecords)
      .innerJoin(patients, eq(visitRecords.patientId, patients.id))
      .where(eq(patients.userId, user.id))
      .$dynamic();

    if (patientId) {
      const parsedPatientId = parseInt(patientId);
      countQuery = db
        .select({ count: visitRecords.id })
        .from(visitRecords)
        .innerJoin(patients, eq(visitRecords.patientId, patients.id))
        .where(and(eq(patients.userId, user.id), eq(visitRecords.patientId, parsedPatientId)))
        .$dynamic();
    }

    const countResult = await countQuery;
    const total = countResult.length;

    return NextResponse.json(
      {
        success: true,
        data: results,
        total
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}