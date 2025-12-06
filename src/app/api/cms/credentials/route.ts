import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { credentials } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json();
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
    const validatedIsActive = isActive !== undefined ? Boolean(isActive) : true;
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