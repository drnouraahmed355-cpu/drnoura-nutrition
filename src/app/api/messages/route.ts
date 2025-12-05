import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, user } from '@/db/schema';
import { eq, or, desc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiverId, message, subject, senderId } = body;

    // Security check: reject if senderId provided in body doesn't match authenticated user
    if (senderId && senderId !== authenticatedUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sender ID cannot be different from authenticated user',
          code: 'INVALID_SENDER_ID',
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!receiverId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Receiver ID is required',
          code: 'MISSING_RECEIVER_ID',
        },
        { status: 400 }
      );
    }

    if (!message || message.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required',
          code: 'MISSING_MESSAGE',
        },
        { status: 400 }
      );
    }

    // Validate sender exists (authenticated user)
    const senderExists = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, authenticatedUser.id))
      .limit(1);

    if (senderExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sender not found',
          code: 'SENDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Validate receiver exists
    const receiverExists = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, receiverId.trim()))
      .limit(1);

    if (receiverExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Receiver not found',
          code: 'RECEIVER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Create message
    const newMessage = await db
      .insert(messages)
      .values({
        senderId: authenticatedUser.id,
        receiverId: receiverId.trim(),
        subject: subject?.trim() || null,
        message: message.trim(),
        read: false,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newMessage[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || authenticatedUser.id;
    const type = searchParams.get('type'); // 'sent' or 'received'
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Security: Users can only query their own messages
    if (userId !== authenticatedUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only access your own messages',
          code: 'UNAUTHORIZED_ACCESS',
        },
        { status: 403 }
      );
    }

    let query;

    if (type === 'sent') {
      // Get sent messages
      query = db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          subject: messages.subject,
          message: messages.message,
          read: messages.read,
          createdAt: messages.createdAt,
          senderName: user.name,
        })
        .from(messages)
        .leftJoin(user, eq(messages.receiverId, user.id))
        .where(eq(messages.senderId, userId))
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);
    } else if (type === 'received') {
      // Get received messages
      query = db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          subject: messages.subject,
          message: messages.message,
          read: messages.read,
          createdAt: messages.createdAt,
          senderName: user.name,
        })
        .from(messages)
        .leftJoin(user, eq(messages.senderId, user.id))
        .where(eq(messages.receiverId, userId))
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      // Get both sent and received messages
      const sentMessages = await db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          subject: messages.subject,
          message: messages.message,
          read: messages.read,
          createdAt: messages.createdAt,
          otherUserId: messages.receiverId,
        })
        .from(messages)
        .where(eq(messages.senderId, userId))
        .orderBy(desc(messages.createdAt));

      const receivedMessages = await db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          subject: messages.subject,
          message: messages.message,
          read: messages.read,
          createdAt: messages.createdAt,
          otherUserId: messages.senderId,
        })
        .from(messages)
        .where(eq(messages.receiverId, userId))
        .orderBy(desc(messages.createdAt));

      // Combine and get user names
      const allMessages = [...sentMessages, ...receivedMessages];
      
      // Get unique user IDs
      const userIds = [...new Set(allMessages.map(m => m.otherUserId))];
      
      // Fetch user names
      const users = await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(or(...userIds.map(id => eq(user.id, id))));

      const userMap = new Map(users.map(u => [u.id, u.name]));

      // Add names and sort
      const messagesWithNames = allMessages.map(msg => ({
        ...msg,
        senderName: msg.senderId === userId ? 'You' : userMap.get(msg.senderId) || 'Unknown',
        receiverName: msg.receiverId === userId ? 'You' : userMap.get(msg.receiverId) || 'Unknown',
      }));

      // Sort by createdAt desc
      messagesWithNames.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Apply pagination
      const paginatedMessages = messagesWithNames.slice(offset, offset + limit);

      return NextResponse.json(
        {
          success: true,
          data: paginatedMessages,
          total: messagesWithNames.length,
        },
        { status: 200 }
      );
    }

    const results = await query;

    // For sent/received, fetch the other user's name
    if (type === 'sent') {
      const messagesWithNames = await Promise.all(
        results.map(async (msg) => {
          const receiver = await db
            .select({ name: user.name })
            .from(user)
            .where(eq(user.id, msg.receiverId))
            .limit(1);

          return {
            ...msg,
            senderName: 'You',
            receiverName: receiver[0]?.name || 'Unknown',
          };
        })
      );

      return NextResponse.json(
        {
          success: true,
          data: messagesWithNames,
          total: messagesWithNames.length,
        },
        { status: 200 }
      );
    } else if (type === 'received') {
      const messagesWithNames = results.map((msg) => ({
        ...msg,
        receiverName: 'You',
      }));

      return NextResponse.json(
        {
          success: true,
          data: messagesWithNames,
          total: messagesWithNames.length,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: [],
        total: 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}