import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user and verify role='patient'
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'patient') {
      return NextResponse.json(
        { error: 'Access denied. Patient role required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // 2. Validate both passwords are provided
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required', code: 'MISSING_CURRENT_PASSWORD' },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required', code: 'MISSING_NEW_PASSWORD' },
        { status: 400 }
      );
    }

    // 3. Validate newPassword is at least 6 characters
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters', code: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      );
    }

    // 4. Find account where userId=user.id AND providerId='credential'
    const userAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, currentUser.id),
          eq(account.providerId, 'credential')
        )
      )
      .limit(1);

    // 5. Return 404 if account not found
    if (userAccount.length === 0) {
      return NextResponse.json(
        { error: 'Account not found', code: 'ACCOUNT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const accountRecord = userAccount[0];

    if (!accountRecord.password) {
      return NextResponse.json(
        { error: 'Account password not set', code: 'NO_PASSWORD' },
        { status: 400 }
      );
    }

    // 6. Verify currentPassword matches stored password using bcrypt.compare()
    const isPasswordValid = await bcrypt.compare(currentPassword, accountRecord.password);

    // 7. Return 400 with 'INVALID_CURRENT_PASSWORD' if password doesn't match
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect', code: 'INVALID_CURRENT_PASSWORD' },
        { status: 400 }
      );
    }

    // 8. Hash new password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 9. Update account password and updatedAt
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(account.id, accountRecord.id));

    // 10. Set user.passwordNeedsChange=false
    // 11. Update user.updatedAt
    await db
      .update(user)
      .set({
        passwordNeedsChange: false,
        updatedAt: new Date()
      })
      .where(eq(user.id, currentUser.id));

    // 12. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/patient/change-password error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}