import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { expertiseAreas } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json();
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

    const validatedDisplayOrder = displayOrder !== undefined ? parseInt(displayOrder) : 0;
    const validatedIsActive = isActive !== undefined ? Boolean(isActive) : true;
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