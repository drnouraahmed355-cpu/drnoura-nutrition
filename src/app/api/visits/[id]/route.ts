import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { visitRecords, patients } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const visitRecord = await db
      .select({
        id: visitRecords.id,
        patientId: visitRecords.patientId,
        appointmentId: visitRecords.appointmentId,
        visitDate: visitRecords.visitDate,
        weight: visitRecords.weight,
        bloodPressure: visitRecords.bloodPressure,
        notes: visitRecords.notes,
        progressAssessment: visitRecords.progressAssessment,
        nextVisitDate: visitRecords.nextVisitDate,
        createdAt: visitRecords.createdAt,
        patientFullName: patients.fullName,
      })
      .from(visitRecords)
      .innerJoin(patients, eq(visitRecords.patientId, patients.id))
      .where(eq(visitRecords.id, parseInt(id)))
      .limit(1);

    if (visitRecord.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Visit record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: visitRecord[0],
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body || 'patientId' in body) {
      return NextResponse.json(
        {
          success: false,
          error: 'User or patient ID cannot be provided in request body',
          code: 'ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingRecord = await db
      .select()
      .from(visitRecords)
      .where(eq(visitRecords.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Visit record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: Partial<{
      visitDate: string;
      weight: number;
      bloodPressure: string;
      notes: string;
      progressAssessment: string;
      nextVisitDate: string;
    }> = {};

    if (body.visitDate !== undefined) updates.visitDate = body.visitDate;
    if (body.weight !== undefined) updates.weight = body.weight;
    if (body.bloodPressure !== undefined) updates.bloodPressure = body.bloodPressure;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.progressAssessment !== undefined) updates.progressAssessment = body.progressAssessment;
    if (body.nextVisitDate !== undefined) updates.nextVisitDate = body.nextVisitDate;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(visitRecords)
      .set(updates)
      .where(eq(visitRecords.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update visit record', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated[0],
      message: 'Visit record updated successfully',
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingRecord = await db
      .select()
      .from(visitRecords)
      .where(eq(visitRecords.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Visit record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(visitRecords)
      .where(eq(visitRecords.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete visit record', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deleted[0],
      message: 'Visit record deleted successfully',
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}