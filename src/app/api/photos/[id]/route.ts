import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progressPhotos } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const photo = await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.id, parseInt(id)))
      .limit(1);

    if (photo.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Photo not found', code: 'PHOTO_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: photo[0]
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingPhoto = await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.id, parseInt(id)))
      .limit(1);

    if (existingPhoto.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Photo not found', code: 'PHOTO_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(progressPhotos)
      .where(eq(progressPhotos.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: deleted[0],
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}