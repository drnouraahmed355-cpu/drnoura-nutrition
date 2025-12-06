import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteContent } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const record = await db.select()
      .from(siteContent)
      .where(eq(siteContent.id, parseInt(id)))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record[0]
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
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const existingRecord = await db.select()
      .from(siteContent)
      .where(eq(siteContent.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { section, key, valueAr, valueEn } = body;

    const updates: {
      section?: string;
      key?: string;
      valueAr?: string;
      valueEn?: string;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString()
    };

    if (section !== undefined) {
      if (!section || typeof section !== 'string' || section.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Section must be a non-empty string',
            code: 'INVALID_SECTION'
          },
          { status: 400 }
        );
      }
      updates.section = section.trim();
    }

    if (key !== undefined) {
      if (!key || typeof key !== 'string' || key.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Key must be a non-empty string',
            code: 'INVALID_KEY'
          },
          { status: 400 }
        );
      }
      updates.key = key.trim();
    }

    if (valueAr !== undefined) {
      if (!valueAr || typeof valueAr !== 'string' || valueAr.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Arabic value must be a non-empty string',
            code: 'INVALID_VALUE_AR'
          },
          { status: 400 }
        );
      }
      updates.valueAr = valueAr.trim();
    }

    if (valueEn !== undefined) {
      if (!valueEn || typeof valueEn !== 'string' || valueEn.trim() === '') {
        return NextResponse.json(
          { 
            error: 'English value must be a non-empty string',
            code: 'INVALID_VALUE_EN'
          },
          { status: 400 }
        );
      }
      updates.valueEn = valueEn.trim();
    }

    const updated = await db.update(siteContent)
      .set(updates)
      .where(eq(siteContent.id, parseInt(id)))
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
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const existingRecord = await db.select()
      .from(siteContent)
      .where(eq(siteContent.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    const deleted = await db.delete(siteContent)
      .where(eq(siteContent.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Site content deleted successfully',
      data: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}