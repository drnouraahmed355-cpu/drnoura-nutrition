import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Authentication check
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

    // Security check: Reject userId from query params when auth is integrated
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');
    
    if (queryUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID cannot be provided in request. Operations are automatically scoped to authenticated user.',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    // Mark all unread notifications as read for the authenticated user
    const updated = await db
      .update(notifications)
      .set({
        read: true
      })
      .where(
        and(
          eq(notifications.userId, user.id),
          eq(notifications.read, false)
        )
      )
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'All notifications marked as read',
        count: updated.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('PUT error:', error);
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