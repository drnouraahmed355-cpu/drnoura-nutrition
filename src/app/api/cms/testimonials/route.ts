import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Remove authentication for GET - public content
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('isActive');
    const ratingParam = searchParams.get('rating');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const conditions = [];

    if (isActiveParam !== null) {
      const isActiveValue = isActiveParam === 'true';
      conditions.push(eq(testimonials.isActive, isActiveValue));
    }

    if (ratingParam !== null) {
      const rating = parseInt(ratingParam);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, error: 'Rating must be between 1 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
      conditions.push(eq(testimonials.rating, rating));
    }

    let query = db.select().from(testimonials);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(asc(testimonials.displayOrder), asc(testimonials.id))
      .limit(limit)
      .offset(offset);

    let countQuery = db.select({ count: testimonials.id }).from(testimonials);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const countResult = await countQuery;
    const total = countResult.length;

    return NextResponse.json({
      success: true,
      data: results,
      total: total
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
        { success: false, error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { success: false, error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const { nameAr, nameEn, textAr, textEn, rating, displayOrder, isActive } = body;

    if (!nameAr || typeof nameAr !== 'string' || nameAr.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'nameAr is required and must be a non-empty string', code: 'MISSING_NAME_AR' },
        { status: 400 }
      );
    }

    if (!nameEn || typeof nameEn !== 'string' || nameEn.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'nameEn is required and must be a non-empty string', code: 'MISSING_NAME_EN' },
        { status: 400 }
      );
    }

    if (!textAr || typeof textAr !== 'string' || textAr.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'textAr is required and must be a non-empty string', code: 'MISSING_TEXT_AR' },
        { status: 400 }
      );
    }

    if (!textEn || typeof textEn !== 'string' || textEn.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'textEn is required and must be a non-empty string', code: 'MISSING_TEXT_EN' },
        { status: 400 }
      );
    }

    const ratingValue = rating !== undefined ? parseInt(rating) : 5;
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    const displayOrderValue = displayOrder !== undefined ? parseInt(displayOrder) : 0;
    if (isNaN(displayOrderValue)) {
      return NextResponse.json(
        { success: false, error: 'displayOrder must be a valid integer', code: 'INVALID_DISPLAY_ORDER' },
        { status: 400 }
      );
    }

    const isActiveValue = isActive !== undefined ? Boolean(isActive) : true;

    const now = new Date().toISOString();

    const newTestimonial = await db.insert(testimonials)
      .values({
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        textAr: textAr.trim(),
        textEn: textEn.trim(),
        rating: ratingValue,
        displayOrder: displayOrderValue,
        isActive: isActiveValue,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newTestimonial[0] },
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
        { success: false, error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
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
        { success: false, error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const existing = await db.select()
      .from(testimonials)
      .where(eq(testimonials.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { nameAr, nameEn, textAr, textEn, rating, displayOrder, isActive } = body;

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (nameAr !== undefined) {
      if (typeof nameAr !== 'string' || nameAr.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'nameAr must be a non-empty string', code: 'INVALID_NAME_AR' },
          { status: 400 }
        );
      }
      updates.nameAr = nameAr.trim();
    }

    if (nameEn !== undefined) {
      if (typeof nameEn !== 'string' || nameEn.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'nameEn must be a non-empty string', code: 'INVALID_NAME_EN' },
          { status: 400 }
        );
      }
      updates.nameEn = nameEn.trim();
    }

    if (textAr !== undefined) {
      if (typeof textAr !== 'string' || textAr.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'textAr must be a non-empty string', code: 'INVALID_TEXT_AR' },
          { status: 400 }
        );
      }
      updates.textAr = textAr.trim();
    }

    if (textEn !== undefined) {
      if (typeof textEn !== 'string' || textEn.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'textEn must be a non-empty string', code: 'INVALID_TEXT_EN' },
          { status: 400 }
        );
      }
      updates.textEn = textEn.trim();
    }

    if (rating !== undefined) {
      const ratingValue = parseInt(rating);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return NextResponse.json(
          { success: false, error: 'Rating must be an integer between 1 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
      updates.rating = ratingValue;
    }

    if (displayOrder !== undefined) {
      const displayOrderValue = parseInt(displayOrder);
      if (isNaN(displayOrderValue)) {
        return NextResponse.json(
          { success: false, error: 'displayOrder must be a valid integer', code: 'INVALID_DISPLAY_ORDER' },
          { status: 400 }
        );
      }
      updates.displayOrder = displayOrderValue;
    }

    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    const updated = await db.update(testimonials)
      .set(updates)
      .where(eq(testimonials.id, parseInt(id)))
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
        { success: false, error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db.select()
      .from(testimonials)
      .where(eq(testimonials.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db.update(testimonials)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .where(eq(testimonials.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Testimonial soft deleted successfully',
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