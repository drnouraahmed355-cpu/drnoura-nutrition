import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const testimonialId = parseInt(id);

    const testimonial = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, testimonialId))
      .limit(1);

    if (testimonial.length === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: testimonial[0]
    });
  } catch (error) {
    console.error('GET testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const testimonialId = parseInt(id);

    const existing = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, testimonialId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { nameAr, nameEn, textAr, textEn, rating, displayOrder, isActive } = body;

    if (rating !== undefined) {
      const ratingValue = parseInt(rating);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (nameAr !== undefined) updates.nameAr = nameAr;
    if (nameEn !== undefined) updates.nameEn = nameEn;
    if (textAr !== undefined) updates.textAr = textAr;
    if (textEn !== undefined) updates.textEn = textEn;
    if (rating !== undefined) updates.rating = parseInt(rating);
    if (displayOrder !== undefined) updates.displayOrder = parseInt(displayOrder);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const updated = await db
      .update(testimonials)
      .set(updates)
      .where(eq(testimonials.id, testimonialId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('PUT testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const testimonialId = parseInt(id);

    const existing = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, testimonialId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .update(testimonials)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .where(eq(testimonials.id, testimonialId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Testimonial deactivated successfully',
      data: deleted[0]
    });
  } catch (error) {
    console.error('DELETE testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}