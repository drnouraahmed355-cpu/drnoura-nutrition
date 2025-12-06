import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { credentials } from '@/db/schema';
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

    const credential = await db
      .select()
      .from(credentials)
      .where(eq(credentials.id, parseInt(id)))
      .limit(1);

    if (credential.length === 0) {
      return NextResponse.json(
        { error: 'Credential not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: credential[0],
    });
  } catch (error) {
    console.error('GET credential error:', error);
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

    const existingCredential = await db
      .select()
      .from(credentials)
      .where(eq(credentials.id, parseInt(id)))
      .limit(1);

    if (existingCredential.length === 0) {
      return NextResponse.json(
        { error: 'Credential not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      titleAr,
      titleEn,
      institutionAr,
      institutionEn,
      displayOrder,
      isActive,
    } = body;

    const updateData: {
      titleAr?: string;
      titleEn?: string;
      institutionAr?: string;
      institutionEn?: string;
      displayOrder?: number;
      isActive?: boolean;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (titleAr !== undefined) {
      updateData.titleAr = titleAr.trim();
    }
    if (titleEn !== undefined) {
      updateData.titleEn = titleEn.trim();
    }
    if (institutionAr !== undefined) {
      updateData.institutionAr = institutionAr.trim();
    }
    if (institutionEn !== undefined) {
      updateData.institutionEn = institutionEn.trim();
    }
    if (displayOrder !== undefined) {
      updateData.displayOrder = displayOrder;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updated = await db
      .update(credentials)
      .set(updateData)
      .where(eq(credentials.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT credential error:', error);
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

    const existingCredential = await db
      .select()
      .from(credentials)
      .where(eq(credentials.id, parseInt(id)))
      .limit(1);

    if (existingCredential.length === 0) {
      return NextResponse.json(
        { error: 'Credential not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .update(credentials)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(credentials.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Credential soft deleted successfully',
      data: deleted[0],
    });
  } catch (error) {
    console.error('DELETE credential error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}