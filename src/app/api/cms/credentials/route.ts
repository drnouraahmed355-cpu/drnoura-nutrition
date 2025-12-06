import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { credentials } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const isActiveParam = searchParams.get('isActive');

    let query = db.select().from(credentials);

    if (isActiveParam !== null) {
      const isActiveValue = isActiveParam === 'true';
      query = query.where(eq(credentials.isActive, isActiveValue));
    }

    const results = await query
      .orderBy(asc(credentials.displayOrder), asc(credentials.id))
      .limit(limit)
      .offset(offset);

    let totalQuery = db.select({ count: credentials.id }).from(credentials);
    if (isActiveParam !== null) {
      const isActiveValue = isActiveParam === 'true';
      totalQuery = totalQuery.where(eq(credentials.isActive, isActiveValue));
    }
    const totalResult = await totalQuery;
    const total = totalResult.length;

    return NextResponse.json({
      success: true,
      data: results,
      total
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    const { titleAr, titleEn, institutionAr, institutionEn, displayOrder, isActive } = body;

    if (!titleAr || typeof titleAr !== 'string' || titleAr.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'titleAr is required and must be a non-empty string', code: 'INVALID_TITLE_AR' },
        { status: 400 }
      );
    }

    if (!titleEn || typeof titleEn !== 'string' || titleEn.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'titleEn is required and must be a non-empty string', code: 'INVALID_TITLE_EN' },
        { status: 400 }
      );
    }

    if (!institutionAr || typeof institutionAr !== 'string' || institutionAr.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'institutionAr is required and must be a non-empty string', code: 'INVALID_INSTITUTION_AR' },
        { status: 400 }
      );
    }

    if (!institutionEn || typeof institutionEn !== 'string' || institutionEn.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'institutionEn is required and must be a non-empty string', code: 'INVALID_INSTITUTION_EN' },
        { status: 400 }
      );
    }

    const validatedDisplayOrder = displayOrder !== undefined ? parseInt(displayOrder) : 0;
    if (displayOrder !== undefined && isNaN(validatedDisplayOrder)) {
      return NextResponse.json(
        { success: false, error: 'displayOrder must be a valid integer', code: 'INVALID_DISPLAY_ORDER' },
        { status: 400 }
      );
    }

    const validatedIsActive = isActive !== undefined ? Boolean(isActive) : true;
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newCredential = await db.insert(credentials)
      .values({
        titleAr: titleAr.trim(),
        titleEn: titleEn.trim(),
        institutionAr: institutionAr.trim(),
        institutionEn: institutionEn.trim(),
        displayOrder: validatedDisplayOrder,
        isActive: validatedIsActive,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newCredential[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    const existing = await db.select()
      .from(credentials)
      .where(eq(credentials.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Credential not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { titleAr, titleEn, institutionAr, institutionEn, displayOrder, isActive } = body;

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (titleAr !== undefined) {
      if (typeof titleAr !== 'string' || titleAr.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'titleAr must be a non-empty string', code: 'INVALID_TITLE_AR' },
          { status: 400 }
        );
      }
      updates.titleAr = titleAr.trim();
    }

    if (titleEn !== undefined) {
      if (typeof titleEn !== 'string' || titleEn.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'titleEn must be a non-empty string', code: 'INVALID_TITLE_EN' },
          { status: 400 }
        );
      }
      updates.titleEn = titleEn.trim();
    }

    if (institutionAr !== undefined) {
      if (typeof institutionAr !== 'string' || institutionAr.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'institutionAr must be a non-empty string', code: 'INVALID_INSTITUTION_AR' },
          { status: 400 }
        );
      }
      updates.institutionAr = institutionAr.trim();
    }

    if (institutionEn !== undefined) {
      if (typeof institutionEn !== 'string' || institutionEn.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'institutionEn must be a non-empty string', code: 'INVALID_INSTITUTION_EN' },
          { status: 400 }
        );
      }
      updates.institutionEn = institutionEn.trim();
    }

    if (displayOrder !== undefined) {
      const validatedDisplayOrder = parseInt(displayOrder);
      if (isNaN(validatedDisplayOrder)) {
        return NextResponse.json(
          { success: false, error: 'displayOrder must be a valid integer', code: 'INVALID_DISPLAY_ORDER' },
          { status: 400 }
        );
      }
      updates.displayOrder = validatedDisplayOrder;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE' },
          { status: 400 }
        );
      }
      updates.isActive = isActive;
    }

    const updated = await db.update(credentials)
      .set(updates)
      .where(eq(credentials.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db.select()
      .from(credentials)
      .where(eq(credentials.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Credential not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db.update(credentials)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .where(eq(credentials.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Credential soft deleted successfully',
      data: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}