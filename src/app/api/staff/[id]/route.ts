import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staff, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        },
        { status: 401 }
      );
    }

    const id = params.id;

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

    const staffRecord = await db
      .select({
        id: staff.id,
        userId: staff.userId,
        fullName: staff.fullName,
        role: staff.role,
        permissions: staff.permissions,
        phone: staff.phone,
        status: staff.status,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(staff)
      .innerJoin(user, eq(staff.userId, user.id))
      .where(eq(staff.id, parseInt(id)))
      .limit(1);

    if (staffRecord.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Staff member not found',
          code: 'STAFF_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: staffRecord[0]
    });
  } catch (error) {
    console.error('GET staff error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        },
        { status: 401 }
      );
    }

    const id = params.id;

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

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED' 
        },
        { status: 400 }
      );
    }

    const { fullName, role, phone, permissions, status } = body;

    const validRoles = ['doctor', 'nutritionist', 'assistant', 'admin'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { 
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          code: 'INVALID_ROLE' 
        },
        { status: 400 }
      );
    }

    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.id, parseInt(id)))
      .limit(1);

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Staff member not found',
          code: 'STAFF_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim() === '') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Full name must be a non-empty string',
            code: 'INVALID_FULL_NAME' 
          },
          { status: 400 }
        );
      }
      updates.fullName = fullName.trim();
    }

    if (role !== undefined) {
      updates.role = role;
    }

    if (phone !== undefined) {
      if (phone !== null && typeof phone !== 'string') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Phone must be a string or null',
            code: 'INVALID_PHONE' 
          },
          { status: 400 }
        );
      }
      updates.phone = phone ? phone.trim() : phone;
    }

    if (permissions !== undefined) {
      if (permissions !== null) {
        try {
          const parsedPermissions = typeof permissions === 'string' 
            ? JSON.parse(permissions) 
            : permissions;
          
          if (!Array.isArray(parsedPermissions)) {
            return NextResponse.json(
              { 
                success: false,
                error: 'Permissions must be a JSON array',
                code: 'INVALID_PERMISSIONS' 
              },
              { status: 400 }
            );
          }
          updates.permissions = parsedPermissions;
        } catch (error) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Invalid permissions format. Must be a valid JSON array',
              code: 'INVALID_PERMISSIONS_FORMAT' 
            },
            { status: 400 }
          );
        }
      } else {
        updates.permissions = null;
      }
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || (status !== 'active' && status !== 'inactive')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Status must be either "active" or "inactive"',
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    const updatedStaff = await db
      .update(staff)
      .set(updates)
      .where(eq(staff.id, parseInt(id)))
      .returning();

    const staffWithUser = await db
      .select({
        id: staff.id,
        userId: staff.userId,
        fullName: staff.fullName,
        role: staff.role,
        permissions: staff.permissions,
        phone: staff.phone,
        status: staff.status,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(staff)
      .innerJoin(user, eq(staff.userId, user.id))
      .where(eq(staff.id, parseInt(id)))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: staffWithUser[0],
      message: 'Staff member updated successfully'
    });
  } catch (error) {
    console.error('PUT staff error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        },
        { status: 401 }
      );
    }

    const id = params.id;

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

    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.id, parseInt(id)))
      .limit(1);

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Staff member not found',
          code: 'STAFF_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const deactivatedStaff = await db
      .update(staff)
      .set({
        status: 'inactive',
        updatedAt: new Date().toISOString()
      })
      .where(eq(staff.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: deactivatedStaff[0],
      message: 'Staff member deactivated successfully'
    });
  } catch (error) {
    console.error('DELETE staff error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}