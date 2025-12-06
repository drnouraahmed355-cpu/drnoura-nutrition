import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { expertiseAreas } from '@/db/schema';
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

    const record = await db
      .select()
      .from(expertiseAreas)
      .where(eq(expertiseAreas.id, parseInt(id)))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json(
        { error: 'Expertise area not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record[0],
    });
  } catch (error) {
    console.error('GET error:', error);
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

    const existingRecord = await db
      .select()
      .from(expertiseAreas)
      .where(eq(expertiseAreas.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Expertise area not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      titleAr,
      titleEn,
      descriptionAr,
      descriptionEn,
      icon,
      displayOrder,
      isActive,
    } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (titleAr !== undefined) updates.titleAr = titleAr.trim();
    if (titleEn !== undefined) updates.titleEn = titleEn.trim();
    if (descriptionAr !== undefined) updates.descriptionAr = descriptionAr.trim();
    if (descriptionEn !== undefined) updates.descriptionEn = descriptionEn.trim();
    if (icon !== undefined) updates.icon = icon.trim();
    if (displayOrder !== undefined) updates.displayOrder = displayOrder;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await db
      .update(expertiseAreas)
      .set(updates)
      .where(eq(expertiseAreas.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
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

    const existingRecord = await db
      .select()
      .from(expertiseAreas)
      .where(eq(expertiseAreas.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Expertise area not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .update(expertiseAreas)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(expertiseAreas.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Expertise area deleted successfully',
      data: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}