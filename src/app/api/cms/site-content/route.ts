import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteContent } from '@/db/schema';
import { eq, and, asc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get('section');
    const key = searchParams.get('key');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build where conditions
    const conditions = [];
    if (section) {
      conditions.push(eq(siteContent.section, section));
    }
    if (key) {
      conditions.push(eq(siteContent.key, key));
    }

    // Build query
    let query = db.select().from(siteContent);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    let countQuery = db.select({ count: count() }).from(siteContent);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;

    // Get data with pagination and sorting
    const results = await query
      .orderBy(asc(siteContent.section), asc(siteContent.id))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: results,
      total
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
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
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    const body = await request.json();
    const { section, key, valueAr, valueEn } = body;

    // Validate required fields
    if (!section || typeof section !== 'string' || section.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Section is required and must be a non-empty string',
        code: 'INVALID_SECTION'
      }, { status: 400 });
    }

    if (!key || typeof key !== 'string' || key.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Key is required and must be a non-empty string',
        code: 'INVALID_KEY'
      }, { status: 400 });
    }

    if (!valueAr || typeof valueAr !== 'string' || valueAr.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Arabic value is required and must be a non-empty string',
        code: 'INVALID_VALUE_AR'
      }, { status: 400 });
    }

    if (!valueEn || typeof valueEn !== 'string' || valueEn.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'English value is required and must be a non-empty string',
        code: 'INVALID_VALUE_EN'
      }, { status: 400 });
    }

    // Insert new record
    const newRecord = await db.insert(siteContent)
      .values({
        section: section.trim(),
        key: key.trim(),
        valueAr: valueAr.trim(),
        valueEn: valueEn.trim(),
        updatedAt: new Date().toISOString()
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
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
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
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        success: false,
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const recordId = parseInt(id);

    // Check if record exists
    const existing = await db.select()
      .from(siteContent)
      .where(eq(siteContent.id, recordId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Record not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    const body = await request.json();
    const { section, key, valueAr, valueEn } = body;

    // Validate fields if provided
    if (section !== undefined && (typeof section !== 'string' || section.trim() === '')) {
      return NextResponse.json({
        success: false,
        error: 'Section must be a non-empty string',
        code: 'INVALID_SECTION'
      }, { status: 400 });
    }

    if (key !== undefined && (typeof key !== 'string' || key.trim() === '')) {
      return NextResponse.json({
        success: false,
        error: 'Key must be a non-empty string',
        code: 'INVALID_KEY'
      }, { status: 400 });
    }

    if (valueAr !== undefined && (typeof valueAr !== 'string' || valueAr.trim() === '')) {
      return NextResponse.json({
        success: false,
        error: 'Arabic value must be a non-empty string',
        code: 'INVALID_VALUE_AR'
      }, { status: 400 });
    }

    if (valueEn !== undefined && (typeof valueEn !== 'string' || valueEn.trim() === '')) {
      return NextResponse.json({
        success: false,
        error: 'English value must be a non-empty string',
        code: 'INVALID_VALUE_EN'
      }, { status: 400 });
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (section !== undefined) updates.section = section.trim();
    if (key !== undefined) updates.key = key.trim();
    if (valueAr !== undefined) updates.valueAr = valueAr.trim();
    if (valueEn !== undefined) updates.valueEn = valueEn.trim();

    // Update record
    const updated = await db.update(siteContent)
      .set(updates)
      .where(eq(siteContent.id, recordId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0]
    }, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
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
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        success: false,
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const recordId = parseInt(id);

    // Check if record exists
    const existing = await db.select()
      .from(siteContent)
      .where(eq(siteContent.id, recordId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Record not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    // Delete record
    const deleted = await db.delete(siteContent)
      .where(eq(siteContent.id, recordId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Site content deleted successfully',
      data: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}