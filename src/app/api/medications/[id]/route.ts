import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid medication ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const medication = await db.select()
      .from(medications)
      .where(eq(medications.id, parseInt(id)))
      .limit(1);

    if (medication.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: medication[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET medication error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid medication ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('patientId' in body) {
      return NextResponse.json(
        { success: false, error: 'Patient ID cannot be modified', code: 'PATIENT_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const existingMedication = await db.select()
      .from(medications)
      .where(eq(medications.id, parseInt(id)))
      .limit(1);

    if (existingMedication.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: Partial<typeof medications.$inferInsert> = {};

    if (body.medicationName !== undefined) {
      if (typeof body.medicationName !== 'string' || body.medicationName.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Medication name must be a non-empty string', code: 'INVALID_MEDICATION_NAME' },
          { status: 400 }
        );
      }
      updates.medicationName = body.medicationName.trim();
    }

    if (body.dosage !== undefined) {
      if (body.dosage !== null && typeof body.dosage !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Dosage must be a string', code: 'INVALID_DOSAGE' },
          { status: 400 }
        );
      }
      updates.dosage = body.dosage ? body.dosage.trim() : null;
    }

    if (body.frequency !== undefined) {
      if (body.frequency !== null && typeof body.frequency !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Frequency must be a string', code: 'INVALID_FREQUENCY' },
          { status: 400 }
        );
      }
      updates.frequency = body.frequency ? body.frequency.trim() : null;
    }

    if (body.startDate !== undefined) {
      if (typeof body.startDate !== 'string' || body.startDate.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Start date must be a non-empty string', code: 'INVALID_START_DATE' },
          { status: 400 }
        );
      }
      updates.startDate = body.startDate.trim();
    }

    if (body.endDate !== undefined) {
      if (body.endDate !== null && typeof body.endDate !== 'string') {
        return NextResponse.json(
          { success: false, error: 'End date must be a string', code: 'INVALID_END_DATE' },
          { status: 400 }
        );
      }
      updates.endDate = body.endDate ? body.endDate.trim() : null;
    }

    if (body.prescribedBy !== undefined) {
      if (body.prescribedBy !== null && typeof body.prescribedBy !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Prescribed by must be a string', code: 'INVALID_PRESCRIBED_BY' },
          { status: 400 }
        );
      }
      updates.prescribedBy = body.prescribedBy ? body.prescribedBy.trim() : null;
    }

    if (body.notes !== undefined) {
      if (body.notes !== null && typeof body.notes !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Notes must be a string', code: 'INVALID_NOTES' },
          { status: 400 }
        );
      }
      updates.notes = body.notes ? body.notes.trim() : null;
    }

    if (body.status !== undefined) {
      const validStatuses = ['active', 'completed', 'discontinued'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Status must be one of: active, completed, discontinued', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const updatedMedication = await db.update(medications)
      .set(updates)
      .where(eq(medications.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { success: true, data: updatedMedication[0], message: 'Medication updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT medication error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid medication ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingMedication = await db.select()
      .from(medications)
      .where(eq(medications.id, parseInt(id)))
      .limit(1);

    if (existingMedication.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db.delete(medications)
      .where(eq(medications.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { success: true, data: deleted[0], message: 'Medication deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE medication error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}