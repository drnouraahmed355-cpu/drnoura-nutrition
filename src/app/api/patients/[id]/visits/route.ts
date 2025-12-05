import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { visitRecords, appointments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const patientIdInt = parseInt(patientId);

    const visits = await db
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
        appointment: {
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          type: appointments.type,
          status: appointments.status,
          durationMinutes: appointments.durationMinutes,
        },
      })
      .from(visitRecords)
      .leftJoin(appointments, eq(visitRecords.appointmentId, appointments.id))
      .where(eq(visitRecords.patientId, patientIdInt))
      .orderBy(desc(visitRecords.visitDate))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: visitRecords.id })
      .from(visitRecords)
      .where(eq(visitRecords.patientId, patientIdInt));

    const total = totalResult.length;

    const formattedVisits = visits.map((visit) => ({
      id: visit.id,
      patientId: visit.patientId,
      appointmentId: visit.appointmentId,
      visitDate: visit.visitDate,
      weight: visit.weight,
      bloodPressure: visit.bloodPressure,
      notes: visit.notes,
      progressAssessment: visit.progressAssessment,
      nextVisitDate: visit.nextVisitDate,
      createdAt: visit.createdAt,
      ...(visit.appointment.id && {
        appointment: {
          id: visit.appointment.id,
          appointmentDate: visit.appointment.appointmentDate,
          appointmentTime: visit.appointment.appointmentTime,
          type: visit.appointment.type,
          status: visit.appointment.status,
          durationMinutes: visit.appointment.durationMinutes,
        },
      }),
    }));

    return NextResponse.json({
      success: true,
      data: formattedVisits,
      total,
    });
  } catch (error) {
    console.error('GET visit history error:', error);
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