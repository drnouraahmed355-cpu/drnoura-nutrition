import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dietPlans, patients, staff } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;
    
    // Validate patientId
    if (!patientId || isNaN(parseInt(patientId))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid patient ID is required',
          code: 'INVALID_PATIENT_ID'
        },
        { status: 400 }
      );
    }

    const patientIdInt = parseInt(patientId);

    // Check if patient exists
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientIdInt))
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

    const body = await request.json();
    const {
      planName,
      startDate,
      dailyCalories,
      mealPlan,
      endDate,
      instructions,
      createdByStaffId,
      status
    } = body;

    // Validate required fields
    if (!planName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan name is required',
          code: 'MISSING_PLAN_NAME'
        },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Start date is required',
          code: 'MISSING_START_DATE'
        },
        { status: 400 }
      );
    }

    if (!dailyCalories) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daily calories is required',
          code: 'MISSING_DAILY_CALORIES'
        },
        { status: 400 }
      );
    }

    if (!mealPlan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Meal plan is required',
          code: 'MISSING_MEAL_PLAN'
        },
        { status: 400 }
      );
    }

    // Validate mealPlan structure
    if (typeof mealPlan !== 'object' || Array.isArray(mealPlan)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Meal plan must be a valid JSON object',
          code: 'INVALID_MEAL_PLAN_FORMAT'
        },
        { status: 400 }
      );
    }

    const requiredMealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    for (const mealType of requiredMealTypes) {
      if (!(mealType in mealPlan)) {
        return NextResponse.json(
          {
            success: false,
            error: `Meal plan must include ${mealType}`,
            code: 'INVALID_MEAL_PLAN_STRUCTURE'
          },
          { status: 400 }
        );
      }
      if (!Array.isArray(mealPlan[mealType])) {
        return NextResponse.json(
          {
            success: false,
            error: `Meal plan ${mealType} must be an array`,
            code: 'INVALID_MEAL_PLAN_STRUCTURE'
          },
          { status: 400 }
        );
      }
    }

    // Validate dailyCalories is a number
    if (isNaN(parseInt(dailyCalories))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daily calories must be a valid number',
          code: 'INVALID_DAILY_CALORIES'
        },
        { status: 400 }
      );
    }

    // Validate createdByStaffId if provided
    if (createdByStaffId) {
      const staffMember = await db
        .select()
        .from(staff)
        .where(eq(staff.id, parseInt(createdByStaffId)))
        .limit(1);

      if (staffMember.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Staff member not found',
            code: 'STAFF_NOT_FOUND'
          },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    const newDietPlan = await db
      .insert(dietPlans)
      .values({
        patientId: patientIdInt,
        planName: planName.trim(),
        startDate,
        endDate: endDate || null,
        dailyCalories: parseInt(dailyCalories),
        mealPlan,
        instructions: instructions || null,
        createdByStaffId: createdByStaffId ? parseInt(createdByStaffId) : null,
        status: status || 'active',
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newDietPlan[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST diet plan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;
    
    // Validate patientId
    if (!patientId || isNaN(parseInt(patientId))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid patient ID is required',
          code: 'INVALID_PATIENT_ID'
        },
        { status: 400 }
      );
    }

    const patientIdInt = parseInt(patientId);

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build where conditions
    let whereConditions = [eq(dietPlans.patientId, patientIdInt)];

    if (statusFilter) {
      whereConditions.push(eq(dietPlans.status, statusFilter));
    }

    // Query diet plans with left join to staff table
    const results = await db
      .select({
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
        staffName: staff.fullName
      })
      .from(dietPlans)
      .leftJoin(staff, eq(dietPlans.createdByStaffId, staff.id))
      .where(and(...whereConditions))
      .orderBy(desc(dietPlans.startDate))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCount = await db
      .select({ count: dietPlans.id })
      .from(dietPlans)
      .where(and(...whereConditions));

    return NextResponse.json(
      {
        success: true,
        data: results,
        total: totalCount.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET diet plans error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}