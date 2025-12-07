import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staff, account, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Authorization - Check if user is admin
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get and validate ID from params
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid staff ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const staffId = parseInt(id);

    // Get request body
    const body = await request.json();
    const { newPassword } = body;

    // Validate newPassword
    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 6 characters long', 
          code: 'PASSWORD_TOO_SHORT' 
        },
        { status: 400 }
      );
    }

    // Find staff by id to get userId
    const staffRecord = await db
      .select()
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1);

    if (staffRecord.length === 0) {
      return NextResponse.json(
        { error: 'Staff not found', code: 'STAFF_NOT_FOUND' },
        { status: 404 }
      );
    }

    const staffUserId = staffRecord[0].userId;

    // Find account record where userId=staff.userId AND providerId='credential'
    const accountRecord = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, staffUserId),
          eq(account.providerId, 'credential')
        )
      )
      .limit(1);

    if (accountRecord.length === 0) {
      return NextResponse.json(
        { 
          error: 'Account not found for this staff member', 
          code: 'ACCOUNT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Hash new password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update account password and updatedAt
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(account.id, accountRecord[0].id));

    // Set user.passwordNeedsChange=true (staff must change on next login)
    await db
      .update(user)
      .set({
        passwordNeedsChange: true,
        updatedAt: new Date()
      })
      .where(eq(user.id, staffUserId));

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Staff password updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/admin/staff/[id]/password error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}