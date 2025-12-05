import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staff } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid staff ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { permissions } = body;

    if (permissions === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permissions field is required',
          code: 'MISSING_REQUIRED_FIELD'
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permissions must be an array',
          code: 'INVALID_PERMISSIONS_FORMAT'
        },
        { status: 400 }
      );
    }

    const existingStaff = await db
      .select()
      .from(staff)
      .where(and(eq(staff.id, parseInt(id)), eq(staff.userId, user.id)))
      .limit(1);

    if (existingStaff.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Staff not found',
          code: 'STAFF_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const updatedStaff = await db
      .update(staff)
      .set({
        permissions: permissions,
        updatedAt: new Date().toISOString()
      })
      .where(and(eq(staff.id, parseInt(id)), eq(staff.userId, user.id)))
      .returning();

    if (updatedStaff.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update staff permissions',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedStaff[0],
        message: 'Permissions updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/staff/[id]/permissions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}