import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staff, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid staff ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const staffId = parseInt(id);

    const result = await db
      .select({
        id: staff.id,
        userId: staff.userId,
        fullName: staff.fullName,
        role: staff.role,
        phone: staff.phone,
        permissions: staff.permissions,
        status: staff.status,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        email: user.email,
      })
      .from(staff)
      .innerJoin(user, eq(staff.userId, user.id))
      .where(eq(staff.id, staffId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Staff not found', code: 'STAFF_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('GET staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid staff ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const staffId = parseInt(id);

    const body = await request.json();
    const { fullName, role, phone, permissions, status } = body;

    // Validate role if provided
    if (role && !['doctor', 'staff', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be doctor, staff, or admin', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // Check if staff exists
    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1);

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { error: 'Staff not found', code: 'STAFF_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (role !== undefined) updates.role = role;
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (permissions !== undefined) updates.permissions = permissions;
    if (status !== undefined) updates.status = status;

    // Update staff record
    const updatedStaff = await db
      .update(staff)
      .set(updates)
      .where(eq(staff.id, staffId))
      .returning();

    // If fullName changed, also update user.name
    if (fullName !== undefined && fullName.trim() !== '') {
      await db
        .update(user)
        .set({
          name: fullName.trim(),
          updatedAt: new Date(),
        })
        .where(eq(user.id, existingStaff[0].userId));
    }

    // Get updated staff with email
    const staffWithEmail = await db
      .select({
        id: staff.id,
        userId: staff.userId,
        fullName: staff.fullName,
        role: staff.role,
        phone: staff.phone,
        permissions: staff.permissions,
        status: staff.status,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        email: user.email,
      })
      .from(staff)
      .innerJoin(user, eq(staff.userId, user.id))
      .where(eq(staff.id, staffId))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: staffWithEmail[0],
      message: 'Staff updated successfully',
    });
  } catch (error) {
    console.error('PUT staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid staff ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const staffId = parseInt(id);

    // Check if staff exists
    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1);

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { error: 'Staff not found', code: 'STAFF_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to inactive
    const deactivatedStaff = await db
      .update(staff)
      .set({
        status: 'inactive',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(staff.id, staffId))
      .returning();

    // Get deactivated staff with email
    const staffWithEmail = await db
      .select({
        id: staff.id,
        userId: staff.userId,
        fullName: staff.fullName,
        role: staff.role,
        phone: staff.phone,
        permissions: staff.permissions,
        status: staff.status,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        email: user.email,
      })
      .from(staff)
      .innerJoin(user, eq(staff.userId, user.id))
      .where(eq(staff.id, staffId))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: staffWithEmail[0],
      message: 'Staff deactivated successfully',
    });
  } catch (error) {
    console.error('DELETE staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}