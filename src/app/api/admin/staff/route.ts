import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account, staff } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

// Helper function to generate random password
function generateRandomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to generate unique ID
function generateUniqueId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authorization check - must be admin
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Admin role required.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, email, role, phone, permissions } = body;

    // Validate required fields
    if (!fullName || !email || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: fullName, email, and role are required',
        code: 'MISSING_REQUIRED_FIELDS' 
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ['doctor', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        code: 'INVALID_ROLE' 
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL' 
      }, { status: 400 });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: 'Email already exists',
        code: 'EMAIL_EXISTS' 
      }, { status: 409 });
    }

    // Generate random password
    const plainPassword = generateRandomPassword(8);

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Generate unique user ID
    const userId = generateUniqueId('user');

    // Insert into user table
    const newUser = await db.insert(user).values({
      id: userId,
      name: fullName.trim(),
      email: normalizedEmail,
      role: role,
      passwordNeedsChange: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    if (newUser.length === 0) {
      throw new Error('Failed to create user');
    }

    // Generate account ID
    const accountId = generateUniqueId('account');

    // Insert into account table
    await db.insert(account).values({
      id: accountId,
      accountId: accountId,
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert into staff table
    const newStaff = await db.insert(staff).values({
      userId: userId,
      fullName: fullName.trim(),
      role: role,
      permissions: permissions ? JSON.stringify(permissions) : null,
      phone: phone?.trim() || null,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();

    if (newStaff.length === 0) {
      throw new Error('Failed to create staff record');
    }

    return NextResponse.json({
      success: true,
      data: {
        staff: {
          id: newStaff[0].id,
          userId: newStaff[0].userId,
          fullName: newStaff[0].fullName,
          role: newStaff[0].role,
          phone: newStaff[0].phone,
          permissions: newStaff[0].permissions,
          status: newStaff[0].status,
          createdAt: newStaff[0].createdAt,
          updatedAt: newStaff[0].updatedAt
        },
        credentials: {
          email: normalizedEmail,
          password: plainPassword
        }
      },
      message: 'Staff account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authorization check - must be admin
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Admin role required.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Filters
    const roleFilter = searchParams.get('role');
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query conditions
    const conditions = [];

    if (roleFilter) {
      conditions.push(eq(staff.role, roleFilter));
    }

    if (statusFilter) {
      conditions.push(eq(staff.status, statusFilter));
    }

    if (search) {
      conditions.push(
        or(
          like(staff.fullName, `%${search}%`),
          like(staff.phone, `%${search}%`)
        )
      );
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get staff with user data (for email)
    const staffList = await db.select({
      id: staff.id,
      userId: staff.userId,
      fullName: staff.fullName,
      role: staff.role,
      phone: staff.phone,
      permissions: staff.permissions,
      status: staff.status,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      email: user.email
    })
      .from(staff)
      .innerJoin(user, eq(staff.userId, user.id))
      .where(whereClause)
      .orderBy(desc(staff.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({
      id: staff.id
    })
      .from(staff)
      .innerJoin(user, eq(staff.userId, user.id))
      .where(whereClause);

    const total = totalResult.length;

    return NextResponse.json({
      success: true,
      data: staffList,
      total: total
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}