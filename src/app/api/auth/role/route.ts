import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHENTICATED'
        }, 
        { status: 401 }
      );
    }

    // Fetch user details from database to ensure fresh data
    const userRecord = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        }, 
        { status: 404 }
      );
    }

    const userData = userRecord[0];

    return NextResponse.json({
      success: true,
      data: {
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/auth/role error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    );
  }
}