import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, progressPhotos } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and verify role
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

    // Find patient record for this user
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

    const patient = patientRecord[0];
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const photoType = searchParams.get('photoType');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate photoType if provided
    if (photoType && !['front', 'side', 'back'].includes(photoType)) {
      return NextResponse.json({ 
        error: 'Invalid photo type. Must be: front, side, or back',
        code: 'INVALID_PHOTO_TYPE' 
      }, { status: 400 });
    }

    // Build query conditions
    const conditions = [eq(progressPhotos.patientId, patient.id)];
    if (photoType) {
      conditions.push(eq(progressPhotos.photoType, photoType));
    }

    // Get total count
    const countResult = await db.select()
      .from(progressPhotos)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0]);
    
    const total = countResult.length;

    // Get paginated photos ordered by takenAt DESC (most recent first)
    const photos = await db.select()
      .from(progressPhotos)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(progressPhotos.takenAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: photos,
      total
    }, { status: 200 });

  } catch (error) {
    console.error('GET progress photos error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}