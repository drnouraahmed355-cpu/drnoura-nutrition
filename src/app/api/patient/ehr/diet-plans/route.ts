import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, dietPlans, staff } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user and verify role='patient'
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'patient') {
      return NextResponse.json({ 
        error: 'Access denied. This endpoint is only accessible to patients.',
        code: 'FORBIDDEN_ROLE'
      }, { status: 403 });
    }

    // 2. Find patient where userId=user.id
    const patientRecords = await db.select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    // 3. Return 404 if patient not found
    if (patientRecords.length === 0) {
      return NextResponse.json({ 
        error: 'Patient record not found',
        code: 'PATIENT_NOT_FOUND'
      }, { status: 404 });
    }

    const patient = patientRecords[0];

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // 4. Get diet plans for patientId
    // 5. Left join with staff table to get creator name
    let whereConditions = eq(dietPlans.patientId, patient.id);

    // 6. Filter by status if provided (active/completed/discontinued)
    if (statusParam && ['active', 'completed', 'discontinued'].includes(statusParam)) {
      whereConditions = and(
        eq(dietPlans.patientId, patient.id),
        eq(dietPlans.status, statusParam)
      ) as any;
    }

    // Get diet plans with staff information
    const dietPlanRecords = await db.select({
      id: dietPlans.id,
      patientId: dietPlans.patientId,
      createdByStaffId: dietPlans.createdByStaffId,
      planName: dietPlans.planName,
      startDate: dietPlans.startDate,
      endDate: dietPlans.endDate,
      dailyCalories: dietPlans.dailyCalories,
      mealPlan: dietPlans.mealPlan,
      instructions: dietPlans.instructions,
      status: dietPlans.status,
      createdAt: dietPlans.createdAt,
      updatedAt: dietPlans.updatedAt,
      creatorName: staff.fullName,
    })
      .from(dietPlans)
      .leftJoin(staff, eq(dietPlans.createdByStaffId, staff.id))
      .where(whereConditions)
      .orderBy(desc(dietPlans.startDate))
      .limit(limit)
      .offset(offset);

    // 9. Get total count
    const totalRecords = await db.select({
      id: dietPlans.id,
    })
      .from(dietPlans)
      .where(whereConditions);

    const total = totalRecords.length;

    // Response format
    return NextResponse.json({
      success: true,
      data: dietPlanRecords,
      total: total
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}