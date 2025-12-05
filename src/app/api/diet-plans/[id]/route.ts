import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dietPlans, staff } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const dietPlanId = parseInt(id);

    // Fetch diet plan with staff information
    const result = await db
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
        creatorName: staff.fullName,
      })
      .from(dietPlans)
      .leftJoin(staff, eq(dietPlans.createdByStaffId, staff.id))
      .where(eq(dietPlans.id, dietPlanId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Diet plan not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('GET diet plan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error as Error).message,
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
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const dietPlanId = parseInt(id);

    // Check if diet plan exists
    const existingPlan = await db
      .select()
      .from(dietPlans)
      .where(eq(dietPlans.id, dietPlanId))
      .limit(1);

    if (existingPlan.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Diet plan not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      planName,
      startDate,
      endDate,
      dailyCalories,
      mealPlan,
      instructions,
      status,
    } = body;

    // Validate mealPlan format if provided
    if (mealPlan !== undefined) {
      if (typeof mealPlan !== 'object' || mealPlan === null) {
        return NextResponse.json(
          {
            success: false,
            error: 'Meal plan must be a valid JSON object',
            code: 'INVALID_MEAL_PLAN_FORMAT',
          },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['active', 'completed', 'discontinued'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Status must be one of: active, completed, discontinued',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    // Validate dailyCalories if provided
    if (dailyCalories !== undefined && (typeof dailyCalories !== 'number' || dailyCalories < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daily calories must be a positive number',
          code: 'INVALID_DAILY_CALORIES',
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (planName !== undefined) updates.planName = planName.trim();
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (dailyCalories !== undefined) updates.dailyCalories = dailyCalories;
    if (mealPlan !== undefined) updates.mealPlan = mealPlan;
    if (instructions !== undefined) updates.instructions = instructions.trim();
    if (status !== undefined) updates.status = status;

    const updated = await db
      .update(dietPlans)
      .set(updates)
      .where(eq(dietPlans.id, dietPlanId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0],
      message: 'Diet plan updated successfully',
    });
  } catch (error) {
    console.error('PUT diet plan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error as Error).message,
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
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const dietPlanId = parseInt(id);

    // Check if diet plan exists
    const existingPlan = await db
      .select()
      .from(dietPlans)
      .where(eq(dietPlans.id, dietPlanId))
      .limit(1);

    if (existingPlan.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Diet plan not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(dietPlans)
      .where(eq(dietPlans.id, dietPlanId))
      .returning();

    return NextResponse.json({
      success: true,
      data: deleted[0],
      message: 'Diet plan deleted successfully',
    });
  } catch (error) {
    console.error('DELETE diet plan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}