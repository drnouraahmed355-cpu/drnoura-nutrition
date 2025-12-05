import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
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
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid notification ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const notificationId = parseInt(id);

    const existingNotification = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)))
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updatedNotification = await db
      .update(notifications)
      .set({
        read: true,
      })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)))
      .returning();

    if (updatedNotification.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update notification', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedNotification[0],
        message: 'Notification marked as read',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT notification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}