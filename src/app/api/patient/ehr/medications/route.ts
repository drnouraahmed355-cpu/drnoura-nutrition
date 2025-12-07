import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, medications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and verify role='patient'
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'patient') {
      return NextResponse.json({ 
        error: 'Access denied. Patient role required.',
        code: 'FORBIDDEN_ROLE' 
      }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Find patient where userId=user.id
    const patientRecord = await db.select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (patientRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Patient record not found',
        code: 'PATIENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const patientId = patientRecord[0].id;

    // Build query for medications
    let whereConditions = eq(medications.patientId, patientId);

    // Filter by status if provided (active/completed/discontinued)
    if (status) {
      if (!['active', 'completed', 'discontinued'].includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be active, completed, or discontinued',
          code: 'INVALID_STATUS' 
        }, { status: 400 });
      }
      whereConditions = and(
        eq(medications.patientId, patientId),
        eq(medications.status, status)
      );
    }

    // Get medications with pagination, ordered by startDate DESC
    const medicationsList = await db.select()
      .from(medications)
      .where(whereConditions)
      .orderBy(desc(medications.startDate))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCountResult = await db.select()
      .from(medications)
      .where(whereConditions);
    
    const total = totalCountResult.length;

    return NextResponse.json({
      success: true,
      data: medicationsList,
      total
    }, { status: 200 });

  } catch (error) {
    console.error('GET medications error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}