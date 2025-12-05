import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, appointments, staff, visitRecords } from '@/db/schema';
import { eq, gte, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Calculate date for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString().split('T')[0];
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // 1. Total patients count
    const totalPatientsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients);
    const totalPatients = Number(totalPatientsResult[0]?.count || 0);

    // 2. Active patients count
    const activePatientsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(eq(patients.status, 'active'));
    const activePatients = Number(activePatientsResult[0]?.count || 0);

    // 3. Inactive patients count
    const inactivePatientsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(eq(patients.status, 'inactive'));
    const inactivePatients = Number(inactivePatientsResult[0]?.count || 0);

    // 4. Total appointments count
    const totalAppointmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments);
    const totalAppointments = Number(totalAppointmentsResult[0]?.count || 0);

    // 5. Upcoming appointments (appointmentDate >= today, status='scheduled')
    const upcomingAppointmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, today),
          eq(appointments.status, 'scheduled')
        )
      );
    const upcomingAppointments = Number(upcomingAppointmentsResult[0]?.count || 0);

    // 6. Completed appointments
    const completedAppointmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(eq(appointments.status, 'completed'));
    const completedAppointments = Number(completedAppointmentsResult[0]?.count || 0);

    // 7. Cancelled appointments
    const cancelledAppointmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(eq(appointments.status, 'cancelled'));
    const cancelledAppointments = Number(cancelledAppointmentsResult[0]?.count || 0);

    // 8. Total staff count (status='active')
    const totalStaffResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(staff)
      .where(eq(staff.status, 'active'));
    const totalStaff = Number(totalStaffResult[0]?.count || 0);

    // 9. Total visits count
    const totalVisitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(visitRecords);
    const totalVisits = Number(totalVisitsResult[0]?.count || 0);

    // 10. Recent activity (last 7 days)
    // New patients in last 7 days
    const newPatientsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(gte(patients.createdAt, sevenDaysAgoISO));
    const newPatients = Number(newPatientsResult[0]?.count || 0);

    // Completed appointments in last 7 days
    const recentCompletedAppointmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.status, 'completed'),
          gte(appointments.appointmentDate, sevenDaysAgoISO)
        )
      );
    const recentCompletedAppointments = Number(recentCompletedAppointmentsResult[0]?.count || 0);

    // Total visits in last 7 days
    const recentVisitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(visitRecords)
      .where(gte(visitRecords.visitDate, sevenDaysAgoISO));
    const recentVisits = Number(recentVisitsResult[0]?.count || 0);

    // Build response object
    const stats = {
      patients: {
        total: totalPatients,
        active: activePatients,
        inactive: inactivePatients
      },
      appointments: {
        total: totalAppointments,
        upcoming: upcomingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      },
      staff: {
        total: totalStaff
      },
      visits: {
        total: totalVisits
      },
      recentActivity: {
        newPatients: newPatients,
        completedAppointments: recentCompletedAppointments,
        totalVisits: recentVisits
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    }, { status: 200 });

  } catch (error) {
    console.error('GET dashboard stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}