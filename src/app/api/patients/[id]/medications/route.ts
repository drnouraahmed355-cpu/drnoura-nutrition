import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medications, patients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const patientId = parseInt(params.patientId);
    if (!patientId || isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Valid patient ID is required', code: 'INVALID_PATIENT_ID' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    const { medicationName, dosage, frequency, startDate, endDate, prescribedBy, notes, status } = requestBody;

    // Security check: reject if patientId provided in body
    if ('patientId' in requestBody || 'patient_id' in requestBody) {
      return NextResponse.json(
        { success: false, error: 'Patient ID cannot be provided in request body', code: 'PATIENT_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!medicationName) {
      return NextResponse.json(
        { success: false, error: 'Medication name is required', code: 'MISSING_MEDICATION_NAME' },
        { status: 400 }
      );
    }

    if (!dosage) {
      return NextResponse.json(
        { success: false, error: 'Dosage is required', code: 'MISSING_DOSAGE' },
        { status: 400 }
      );
    }

    if (!frequency) {
      return NextResponse.json(
        { success: false, error: 'Frequency is required', code: 'MISSING_FREQUENCY' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { success: false, error: 'Start date is required', code: 'MISSING_START_DATE' },
        { status: 400 }
      );
    }

    // Verify patient exists and belongs to the authenticated user
    const patient = await db.select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.userId, user.id)))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found', code: 'PATIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare medication data
    const medicationData = {
      patientId,
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      startDate: startDate.trim(),
      endDate: endDate ? endDate.trim() : null,
      prescribedBy: prescribedBy ? prescribedBy.trim() : null,
      notes: notes ? notes.trim() : null,
      status: status || 'active',
      createdAt: new Date().toISOString(),
    };

    // Insert medication
    const newMedication = await db.insert(medications)
      .values(medicationData)
      .returning();

    return NextResponse.json(
      { success: true, data: newMedication[0] },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST medication error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const patientId = parseInt(params.patientId);
    if (!patientId || isNaN(patientId)) {
      return NextResponse.json(
        { success: false, error: 'Valid patient ID is required', code: 'INVALID_PATIENT_ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Verify patient exists and belongs to the authenticated user
    const patient = await db.select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.userId, user.id)))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found', code: 'PATIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build query with patient filter
    let query = db.select()
      .from(medications)
      .where(eq(medications.patientId, patientId));

    // Apply status filter if provided
    if (statusFilter) {
      query = db.select()
        .from(medications)
        .where(and(
          eq(medications.patientId, patientId),
          eq(medications.status, statusFilter)
        ));
    }

    // Execute query with sorting
    const results = await query.orderBy(desc(medications.startDate));

    return NextResponse.json(
      { success: true, data: results },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET medications error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}