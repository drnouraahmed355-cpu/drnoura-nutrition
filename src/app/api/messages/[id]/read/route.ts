import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Extract and validate ID from route params
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid message ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const messageId = parseInt(id);

    // Check if message exists and belongs to authenticated user (as receiver)
    const existingMessage = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.receiverId, user.id)
        )
      )
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message not found or you do not have permission to update it',
          code: 'MESSAGE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update message read status
    const updatedMessage = await db
      .update(messages)
      .set({
        read: true
      })
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.receiverId, user.id)
        )
      )
      .returning();

    if (updatedMessage.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update message',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedMessage[0],
        message: 'Message marked as read'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('PUT /api/messages/[id]/read error:', error);
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