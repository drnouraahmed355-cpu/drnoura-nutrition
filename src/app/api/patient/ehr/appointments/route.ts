import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, appointments, staff } from '@/db/schema';
import { eq, and, gte, asc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user and verify role='patient'
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    if (user.role !== 'patient') {
      return NextResponse.json({ 
        error: 'Access forbidden. Patient role required.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // 2. Find patient where userId=user.id
    const patient = await db.select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    // 3. Return 404 if patient not found
    if (patient.length === 0) {
      return NextResponse.json({ 
        error: 'Patient record not found',
        code: 'PATIENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const patientId = patient[0].id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const upcomingParam = searchParams.get('upcoming');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // 4-6. Get appointments for patientId with staff join and filters
    let conditions = [eq(appointments.patientId, patientId)];

    // Filter by status if provided
    if (statusParam) {
      conditions.push(eq(appointments.status, statusParam));
    }

    // If upcoming=true, filter appointmentDate >= today
    if (upcomingParam === 'true') {
      const today = new Date().toISOString().split('T')[0];
      conditions.push(gte(appointments.appointmentDate, today));
    }

    // Get appointments with staff information (left join)
    const appointmentsQuery = db
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
        staffName: staff.fullName,
      })
      .from(appointments)
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .where(and(...conditions))
      .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime))
      .limit(limit)
      .offset(offset);

    const appointmentsData = await appointmentsQuery;

    // 10. Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(...conditions));

    const countResult = await countQuery;
    const total = countResult[0]?.count ?? 0;

    // Return response
    return NextResponse.json({
      success: true,
      data: appointmentsData,
      total,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}