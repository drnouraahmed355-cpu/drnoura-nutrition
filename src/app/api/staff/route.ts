import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staff, user, account } from '@/db/schema';
import { eq, like, or, and, asc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/lib/auth';

const VALID_ROLES = ['doctor', 'nutritionist', 'assistant', 'admin'];

function generateRandomPassword(length: number = 8): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED' 
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, role, email, phone, permissions, status } = body;

    // Validate required fields
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ 
        success: false,
        error: 'Full name is required',
        code: 'MISSING_FULL_NAME' 
      }, { status: 400 });
    }

    if (!role || !role.trim()) {
      return NextResponse.json({ 
        success: false,
        error: 'Role is required',
        code: 'MISSING_ROLE' 
      }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ 
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL' 
      }, { status: 400 });
    }

    // Validate role
    if (!VALID_ROLES.includes(role.toLowerCase())) {
      return NextResponse.json({ 
        success: false,
        error: `Role must be one of: ${VALID_ROLES.join(', ')}`,
        code: 'INVALID_ROLE' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Email already exists',
        code: 'EMAIL_EXISTS' 
      }, { status: 409 });
    }

    // Generate random password
    const plainPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Generate unique ID for user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create user account
    const newUser = await db.insert(user).values({
      id: userId,
      name: fullName.trim(),
      email: email.toLowerCase().trim(),
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if (newUser.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create user account',
        code: 'USER_CREATE_FAILED' 
      }, { status: 500 });
    }

    // Generate unique ID for account
    const accountId = `account_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create credential account
    await db.insert(account).values({
      id: accountId,
      accountId: email.toLowerCase().trim(),
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Parse permissions if provided
    let parsedPermissions = null;
    if (permissions) {
      try {
        parsedPermissions = Array.isArray(permissions) ? permissions : JSON.parse(permissions);
      } catch (error) {
        return NextResponse.json({ 
          success: false,
          error: 'Invalid permissions format. Must be a JSON array',
          code: 'INVALID_PERMISSIONS' 
        }, { status: 400 });
      }
    }

    // Create staff record
    const now = new Date().toISOString();
    const newStaff = await db.insert(staff).values({
      userId: userId,
      fullName: fullName.trim(),
      role: role.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      permissions: parsedPermissions,
      status: status || 'active',
      createdAt: now,
      updatedAt: now,
    }).returning();

    if (newStaff.length === 0) {
      // Rollback: delete user and account
      await db.delete(account).where(eq(account.userId, userId));
      await db.delete(user).where(eq(user.id, userId));
      
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create staff record',
        code: 'STAFF_CREATE_FAILED' 
      }, { status: 500 });
    }

    // Return created staff with credentials
    return NextResponse.json({ 
      success: true,
      data: {
        ...newStaff[0],
        email: email.toLowerCase().trim(),
        credentials: {
          email: email.toLowerCase().trim(),
          password: plainPassword,
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/staff error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ 
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED' 
    }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');
    const statusFilter = searchParams.get('status');

    // Build query conditions
    const conditions = [];

    // Role filter
    if (roleFilter && VALID_ROLES.includes(roleFilter.toLowerCase())) {
      conditions.push(eq(staff.role, roleFilter.toLowerCase()));
    }

    // Status filter
    if (statusFilter) {
      conditions.push(eq(staff.status, statusFilter.toLowerCase()));
    }

    // Search filter
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      const searchConditions = [
        like(staff.fullName, searchTerm),
        like(staff.phone, searchTerm),
      ];
      
      if (conditions.length > 0) {
        conditions.push(or(...searchConditions));
      } else {
        conditions.push(or(...searchConditions));
      }
    }

    // Execute query with joins to get user details
    const staffQuery = db.select({
      id: staff.id,
      userId: staff.userId,
      fullName: staff.fullName,
      role: staff.role,
      permissions: staff.permissions,
      phone: staff.phone,
      status: staff.status,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      email: user.email,
    })
    .from(staff)
    .leftJoin(user, eq(staff.userId, user.id))
    .orderBy(asc(staff.fullName));

    let results;
    if (conditions.length > 0) {
      results = await staffQuery
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);
    } else {
      results = await staffQuery
        .limit(limit)
        .offset(offset);
    }

    // Get total count for pagination
    let countQuery = db.select({ count: staff.id })
      .from(staff);

    let totalCount;
    if (conditions.length > 0) {
      const countResult = await countQuery.where(and(...conditions));
      totalCount = countResult.length;
    } else {
      const countResult = await countQuery;
      totalCount = countResult.length;
    }

    return NextResponse.json({ 
      success: true,
      data: results,
      total: totalCount,
      limit,
      offset,
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/staff error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}