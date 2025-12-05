import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, user } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_TYPES = ['appointment', 'diet_update', 'progress', 'message'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Title is required',
        code: 'MISSING_TITLE'
      }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required',
        code: 'MISSING_MESSAGE'
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Type is required',
        code: 'MISSING_TYPE'
      }, { status: 400 });
    }

    // Validate type is one of allowed values
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({
        success: false,
        error: `Type must be one of: ${VALID_TYPES.join(', ')}`,
        code: 'INVALID_TYPE'
      }, { status: 400 });
    }

    // Validate userId exists in user table
    const userExists = await db.select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // Create notification
    const newNotification = await db.insert(notifications)
      .values({
        userId: userId.trim(),
        title: title.trim(),
        message: message.trim(),
        type: type.trim(),
        read: false,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newNotification[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const readParam = searchParams.get('read');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate userId is required
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    // Build query conditions
    const conditions = [eq(notifications.userId, userId)];

    // Add type filter if provided
    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json({
          success: false,
          error: `Type must be one of: ${VALID_TYPES.join(', ')}`,
          code: 'INVALID_TYPE'
        }, { status: 400 });
      }
      conditions.push(eq(notifications.type, type));
    }

    // Add read filter if provided
    if (readParam !== null) {
      const readValue = readParam === 'true' || readParam === '1';
      conditions.push(eq(notifications.read, readValue));
    }

    // Execute query with filters
    const results = await db.select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResults = await db.select()
      .from(notifications)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: results,
      total: totalResults.length
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}