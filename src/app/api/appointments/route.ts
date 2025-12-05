import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, patients, staff } from '@/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_APPOINTMENT_TYPES = ['initial', 'follow-up', 'consultation'];
const VALID_STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'];

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ 
      success: false,
      error: 'Authentication required' 
    }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        success: false,
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { 
      patientId, 
      staffId, 
      appointmentDate, 
      appointmentTime, 
      type, 
      status, 
      durationMinutes,
      notes 
    } = body;

    // Validate required fields
    if (!patientId) {
      return NextResponse.json({ 
        success: false,
        error: "Patient ID is required",
        code: "MISSING_PATIENT_ID" 
      }, { status: 400 });
    }

    if (!appointmentDate) {
      return NextResponse.json({ 
        success: false,
        error: "Appointment date is required",
        code: "MISSING_APPOINTMENT_DATE" 
      }, { status: 400 });
    }

    if (!appointmentTime) {
      return NextResponse.json({ 
        success: false,
        error: "Appointment time is required",
        code: "MISSING_APPOINTMENT_TIME" 
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ 
        success: false,
        error: "Appointment type is required",
        code: "MISSING_TYPE" 
      }, { status: 400 });
    }

    // Validate type
    if (!VALID_APPOINTMENT_TYPES.includes(type)) {
      return NextResponse.json({ 
        success: false,
        error: `Invalid appointment type. Must be one of: ${VALID_APPOINTMENT_TYPES.join(', ')}`,
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate patientId exists and belongs to user
    const patientExists = await db.select()
      .from(patients)
      .where(and(
        eq(patients.id, parseInt(patientId)),
        eq(patients.userId, user.id)
      ))
      .limit(1);

    if (patientExists.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: "Patient not found or access denied",
        code: "PATIENT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate staffId exists and belongs to user if provided
    if (staffId) {
      const staffExists = await db.select()
        .from(staff)
        .where(and(
          eq(staff.id, parseInt(staffId)),
          eq(staff.userId, user.id)
        ))
        .limit(1);

      if (staffExists.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: "Staff not found or access denied",
          code: "STAFF_NOT_FOUND" 
        }, { status: 404 });
      }
    }

    const now = new Date().toISOString();
    
    const newAppointment = await db.insert(appointments)
      .values({
        patientId: parseInt(patientId),
        staffId: staffId ? parseInt(staffId) : null,
        appointmentDate: appointmentDate.trim(),
        appointmentTime: appointmentTime.trim(),
        type: type.trim(),
        status: status ? status.trim() : 'scheduled',
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : 30,
        notes: notes ? notes.trim() : null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json({ 
      success: true,
      data: newAppointment[0] 
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ 
      success: false,
      error: 'Authentication required' 
    }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const patientIdParam = searchParams.get('patientId');
    const staffIdParam = searchParams.get('staffId');
    const statusParam = searchParams.get('status');
    const dateParam = searchParams.get('date');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Build where conditions
    const conditions = [];

    // Filter by patientId if provided
    if (patientIdParam) {
      const patientId = parseInt(patientIdParam);
      if (isNaN(patientId)) {
        return NextResponse.json({ 
          success: false,
          error: "Invalid patient ID",
          code: "INVALID_PATIENT_ID" 
        }, { status: 400 });
      }
      
      // Verify patient belongs to user
      const patientExists = await db.select()
        .from(patients)
        .where(and(
          eq(patients.id, patientId),
          eq(patients.userId, user.id)
        ))
        .limit(1);

      if (patientExists.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: "Patient not found or access denied",
          code: "PATIENT_NOT_FOUND" 
        }, { status: 404 });
      }

      conditions.push(eq(appointments.patientId, patientId));
    }

    // Filter by staffId if provided
    if (staffIdParam) {
      const staffId = parseInt(staffIdParam);
      if (isNaN(staffId)) {
        return NextResponse.json({ 
          success: false,
          error: "Invalid staff ID",
          code: "INVALID_STAFF_ID" 
        }, { status: 400 });
      }

      // Verify staff belongs to user
      const staffExists = await db.select()
        .from(staff)
        .where(and(
          eq(staff.id, staffId),
          eq(staff.userId, user.id)
        ))
        .limit(1);

      if (staffExists.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: "Staff not found or access denied",
          code: "STAFF_NOT_FOUND" 
        }, { status: 404 });
      }

      conditions.push(eq(appointments.staffId, staffId));
    }

    // Filter by status if provided
    if (statusParam) {
      if (!VALID_STATUSES.includes(statusParam)) {
        return NextResponse.json({ 
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      conditions.push(eq(appointments.status, statusParam));
    }

    // Filter by specific date if provided
    if (dateParam) {
      conditions.push(eq(appointments.appointmentDate, dateParam));
    }

    // Filter by date range if provided
    if (startDateParam) {
      conditions.push(gte(appointments.appointmentDate, startDateParam));
    }
    if (endDateParam) {
      conditions.push(lte(appointments.appointmentDate, endDateParam));
    }

    // Get all user's patients to filter appointments
    const userPatients = await db.select({ id: patients.id })
      .from(patients)
      .where(eq(patients.userId, user.id));

    const patientIds = userPatients.map(p => p.id);

    if (patientIds.length === 0) {
      return NextResponse.json({ 
        success: true,
        data: [],
        total: 0 
      }, { status: 200 });
    }

    // Build query with joins
    let query = db.select({
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
      patientFullName: patients.fullName,
      staffFullName: staff.fullName
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(staff, eq(appointments.staffId, staff.id));

    // Apply user scope by patient ownership
    const patientOwnershipCondition = eq(patients.userId, user.id);
    
    if (conditions.length > 0) {
      query = query.where(and(patientOwnershipCondition, ...conditions));
    } else {
      query = query.where(patientOwnershipCondition);
    }

    // Apply sorting
    query = query.orderBy(
      asc(appointments.appointmentDate),
      asc(appointments.appointmentTime)
    );

    // Get total count for pagination
    const countQuery = await db.select({
      id: appointments.id
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .where(conditions.length > 0 
      ? and(patientOwnershipCondition, ...conditions)
      : patientOwnershipCondition
    );

    const total = countQuery.length;

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json({ 
      success: true,
      data: results,
      total 
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ 
      success: false,
      error: 'Authentication required' 
    }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false,
        error: "Valid appointment ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        success: false,
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if appointment exists and belongs to user's patient
    const existingAppointment = await db.select({
      appointment: appointments,
      patient: patients
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .where(eq(appointments.id, parseInt(id)))
    .limit(1);

    if (existingAppointment.length === 0 || existingAppointment[0].patient?.userId !== user.id) {
      return NextResponse.json({ 
        success: false,
        error: "Appointment not found or access denied",
        code: "APPOINTMENT_NOT_FOUND" 
      }, { status: 404 });
    }

    const { 
      patientId, 
      staffId, 
      appointmentDate, 
      appointmentTime, 
      type, 
      status,
      durationMinutes,
      notes 
    } = body;

    // Validate type if provided
    if (type && !VALID_APPOINTMENT_TYPES.includes(type)) {
      return NextResponse.json({ 
        success: false,
        error: `Invalid appointment type. Must be one of: ${VALID_APPOINTMENT_TYPES.join(', ')}`,
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate patientId if provided
    if (patientId) {
      const patientExists = await db.select()
        .from(patients)
        .where(and(
          eq(patients.id, parseInt(patientId)),
          eq(patients.userId, user.id)
        ))
        .limit(1);

      if (patientExists.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: "Patient not found or access denied",
          code: "PATIENT_NOT_FOUND" 
        }, { status: 404 });
      }
    }

    // Validate staffId if provided
    if (staffId !== undefined && staffId !== null) {
      if (staffId) {
        const staffExists = await db.select()
          .from(staff)
          .where(and(
            eq(staff.id, parseInt(staffId)),
            eq(staff.userId, user.id)
          ))
          .limit(1);

        if (staffExists.length === 0) {
          return NextResponse.json({ 
            success: false,
            error: "Staff not found or access denied",
            code: "STAFF_NOT_FOUND" 
          }, { status: 404 });
        }
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString()
    };

    if (patientId !== undefined) updateData.patientId = parseInt(patientId);
    if (staffId !== undefined) updateData.staffId = staffId ? parseInt(staffId) : null;
    if (appointmentDate !== undefined) updateData.appointmentDate = appointmentDate.trim();
    if (appointmentTime !== undefined) updateData.appointmentTime = appointmentTime.trim();
    if (type !== undefined) updateData.type = type.trim();
    if (status !== undefined) updateData.status = status.trim();
    if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes);
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

    const updated = await db.update(appointments)
      .set(updateData)
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true,
      data: updated[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ 
      success: false,
      error: 'Authentication required' 
    }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false,
        error: "Valid appointment ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if appointment exists and belongs to user's patient
    const existingAppointment = await db.select({
      appointment: appointments,
      patient: patients
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .where(eq(appointments.id, parseInt(id)))
    .limit(1);

    if (existingAppointment.length === 0 || existingAppointment[0].patient?.userId !== user.id) {
      return NextResponse.json({ 
        success: false,
        error: "Appointment not found or access denied",
        code: "APPOINTMENT_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true,
      message: "Appointment deleted successfully",
      data: deleted[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}