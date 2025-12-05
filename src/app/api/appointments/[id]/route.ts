import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, patients, staff } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const appointmentId = parseInt(id);

    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        staffId: appointments.staffId,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        durationMinutes: appointments.durationMinutes,
        type: appointments.type,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        patientName: patients.fullName,
        staffName: staff.fullName,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('GET appointment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const appointmentId = parseInt(id);

    const body = await request.json();
    const {
      appointmentDate,
      appointmentTime,
      durationMinutes,
      type,
      status,
      notes,
      staffId,
    } = body;

    // Validate type if provided
    if (type && !['initial', 'follow-up', 'consultation'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid appointment type. Must be: initial, follow-up, or consultation',
          code: 'INVALID_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be: scheduled, completed, cancelled, or no-show',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Validate staffId exists if provided
    if (staffId !== undefined) {
      if (staffId !== null) {
        const staffExists = await db
          .select({ id: staff.id })
          .from(staff)
          .where(eq(staff.id, parseInt(staffId)))
          .limit(1);

        if (staffExists.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Staff member not found', code: 'STAFF_NOT_FOUND' },
            { status: 400 }
          );
        }
      }
    }

    // Check if appointment exists
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (appointmentDate !== undefined) updateData.appointmentDate = appointmentDate;
    if (appointmentTime !== undefined) updateData.appointmentTime = appointmentTime;
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (staffId !== undefined) updateData.staffId = staffId;

    // Update appointment
    const updated = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, appointmentId))
      .returning();

    // Get updated appointment with patient and staff details
    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        staffId: appointments.staffId,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        durationMinutes: appointments.durationMinutes,
        type: appointments.type,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        patientName: patients.fullName,
        staffName: staff.fullName,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    console.error('PUT appointment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const appointmentId = parseInt(id);

    // Check if appointment exists
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Set status to cancelled instead of deleting
    const cancelled = await db
      .update(appointments)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: cancelled[0],
    });
  } catch (error) {
    console.error('DELETE appointment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}