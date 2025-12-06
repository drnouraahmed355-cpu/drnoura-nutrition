import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { expertiseAreas } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isActiveParam = searchParams.get('isActive');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(expertiseAreas);

    // Apply isActive filter if provided
    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      query = query.where(eq(expertiseAreas.isActive, isActive));
    }

    // Apply sorting by displayOrder then by id
    query = query.orderBy(asc(expertiseAreas.displayOrder), asc(expertiseAreas.id));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    let countQuery = db.select({ count: expertiseAreas.id }).from(expertiseAreas);
    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      countQuery = countQuery.where(eq(expertiseAreas.isActive, isActive));
    }
    const totalResult = await countQuery;
    const total = totalResult.length;

    return NextResponse.json({
      success: true,
      data: results,
      total
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        success: false,
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { titleAr, titleEn, descriptionAr, descriptionEn, icon, displayOrder, isActive } = body;

    // Validate required fields
    if (!titleAr || typeof titleAr !== 'string' || titleAr.trim() === '') {
      return NextResponse.json({ 
        success: false,
        error: "titleAr is required and must be a non-empty string",
        code: "INVALID_TITLE_AR"
      }, { status: 400 });
    }

    if (!titleEn || typeof titleEn !== 'string' || titleEn.trim() === '') {
      return NextResponse.json({ 
        success: false,
        error: "titleEn is required and must be a non-empty string",
        code: "INVALID_TITLE_EN"
      }, { status: 400 });
    }

    if (!descriptionAr || typeof descriptionAr !== 'string' || descriptionAr.trim() === '') {
      return NextResponse.json({ 
        success: false,
        error: "descriptionAr is required and must be a non-empty string",
        code: "INVALID_DESCRIPTION_AR"
      }, { status: 400 });
    }

    if (!descriptionEn || typeof descriptionEn !== 'string' || descriptionEn.trim() === '') {
      return NextResponse.json({ 
        success: false,
        error: "descriptionEn is required and must be a non-empty string",
        code: "INVALID_DESCRIPTION_EN"
      }, { status: 400 });
    }

    if (!icon || typeof icon !== 'string' || icon.trim() === '') {
      return NextResponse.json({ 
        success: false,
        error: "icon is required and must be a non-empty string",
        code: "INVALID_ICON"
      }, { status: 400 });
    }

    // Validate optional fields
    let validatedDisplayOrder = 0;
    if (displayOrder !== undefined) {
      const parsed = parseInt(displayOrder);
      if (isNaN(parsed)) {
        return NextResponse.json({ 
          success: false,
          error: "displayOrder must be a valid integer",
          code: "INVALID_DISPLAY_ORDER"
        }, { status: 400 });
      }
      validatedDisplayOrder = parsed;
    }

    let validatedIsActive = true;
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json({ 
          success: false,
          error: "isActive must be a boolean",
          code: "INVALID_IS_ACTIVE"
        }, { status: 400 });
      }
      validatedIsActive = isActive;
    }

    const now = new Date().toISOString();

    const newRecord = await db.insert(expertiseAreas)
      .values({
        titleAr: titleAr.trim(),
        titleEn: titleEn.trim(),
        descriptionAr: descriptionAr.trim(),
        descriptionEn: descriptionEn.trim(),
        icon: icon.trim(),
        displayOrder: validatedDisplayOrder,
        isActive: validatedIsActive,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newRecord[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false,
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        success: false,
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(expertiseAreas)
      .where(eq(expertiseAreas.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Expertise area not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    const { titleAr, titleEn, descriptionAr, descriptionEn, icon, displayOrder, isActive } = body;

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add fields if provided
    if (titleAr !== undefined) {
      if (typeof titleAr !== 'string' || titleAr.trim() === '') {
        return NextResponse.json({ 
          success: false,
          error: "titleAr must be a non-empty string",
          code: "INVALID_TITLE_AR"
        }, { status: 400 });
      }
      updates.titleAr = titleAr.trim();
    }

    if (titleEn !== undefined) {
      if (typeof titleEn !== 'string' || titleEn.trim() === '') {
        return NextResponse.json({ 
          success: false,
          error: "titleEn must be a non-empty string",
          code: "INVALID_TITLE_EN"
        }, { status: 400 });
      }
      updates.titleEn = titleEn.trim();
    }

    if (descriptionAr !== undefined) {
      if (typeof descriptionAr !== 'string' || descriptionAr.trim() === '') {
        return NextResponse.json({ 
          success: false,
          error: "descriptionAr must be a non-empty string",
          code: "INVALID_DESCRIPTION_AR"
        }, { status: 400 });
      }
      updates.descriptionAr = descriptionAr.trim();
    }

    if (descriptionEn !== undefined) {
      if (typeof descriptionEn !== 'string' || descriptionEn.trim() === '') {
        return NextResponse.json({ 
          success: false,
          error: "descriptionEn must be a non-empty string",
          code: "INVALID_DESCRIPTION_EN"
        }, { status: 400 });
      }
      updates.descriptionEn = descriptionEn.trim();
    }

    if (icon !== undefined) {
      if (typeof icon !== 'string' || icon.trim() === '') {
        return NextResponse.json({ 
          success: false,
          error: "icon must be a non-empty string",
          code: "INVALID_ICON"
        }, { status: 400 });
      }
      updates.icon = icon.trim();
    }

    if (displayOrder !== undefined) {
      const parsed = parseInt(displayOrder);
      if (isNaN(parsed)) {
        return NextResponse.json({ 
          success: false,
          error: "displayOrder must be a valid integer",
          code: "INVALID_DISPLAY_ORDER"
        }, { status: 400 });
      }
      updates.displayOrder = parsed;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json({ 
          success: false,
          error: "isActive must be a boolean",
          code: "INVALID_IS_ACTIVE"
        }, { status: 400 });
      }
      updates.isActive = isActive;
    }

    const updated = await db.update(expertiseAreas)
      .set(updates)
      .where(eq(expertiseAreas.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0]
    }, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false,
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(expertiseAreas)
      .where(eq(expertiseAreas.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Expertise area not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    const deleted = await db.update(expertiseAreas)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .where(eq(expertiseAreas.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Expertise area deleted successfully (soft delete)',
      data: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}