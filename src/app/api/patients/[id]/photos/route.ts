import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progressPhotos, patients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { patientId } = await params;
    const patientIdInt = parseInt(patientId);

    if (isNaN(patientIdInt)) {
      return NextResponse.json(
        { success: false, error: 'Valid patient ID is required', code: 'INVALID_PATIENT_ID' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    const { photoUrl, photoType, takenAt, notes } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!photoUrl) {
      return NextResponse.json(
        { success: false, error: 'Photo URL is required', code: 'MISSING_PHOTO_URL' },
        { status: 400 }
      );
    }

    if (!photoType) {
      return NextResponse.json(
        { success: false, error: 'Photo type is required', code: 'MISSING_PHOTO_TYPE' },
        { status: 400 }
      );
    }

    // Validate photoType
    const validPhotoTypes = ['front', 'side', 'back'];
    if (!validPhotoTypes.includes(photoType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Photo type must be one of: front, side, back',
          code: 'INVALID_PHOTO_TYPE'
        },
        { status: 400 }
      );
    }

    // Verify patient exists and belongs to authenticated user
    const patient = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientIdInt), eq(patients.userId, user.id)))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found', code: 'PATIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Auto-generate takenAt if not provided
    const takenAtValue = takenAt || new Date().toISOString();
    const createdAtValue = new Date().toISOString();

    // Insert progress photo
    const newPhoto = await db
      .insert(progressPhotos)
      .values({
        patientId: patientIdInt,
        photoUrl: photoUrl.trim(),
        photoType: photoType.trim(),
        takenAt: takenAtValue,
        notes: notes?.trim() || null,
        createdAt: createdAtValue
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newPhoto[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST progress photo error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { patientId } = await params;
    const patientIdInt = parseInt(patientId);

    if (isNaN(patientIdInt)) {
      return NextResponse.json(
        { success: false, error: 'Valid patient ID is required', code: 'INVALID_PATIENT_ID' },
        { status: 400 }
      );
    }

    // Verify patient exists and belongs to authenticated user
    const patient = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientIdInt), eq(patients.userId, user.id)))
      .limit(1);

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found', code: 'PATIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const photoType = searchParams.get('photoType');

    // Build query with patient filter
    let query = db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.patientId, patientIdInt));

    // Add photoType filter if provided
    if (photoType) {
      const validPhotoTypes = ['front', 'side', 'back'];
      if (!validPhotoTypes.includes(photoType)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Photo type must be one of: front, side, back',
            code: 'INVALID_PHOTO_TYPE'
          },
          { status: 400 }
        );
      }

      query = db
        .select()
        .from(progressPhotos)
        .where(
          and(
            eq(progressPhotos.patientId, patientIdInt),
            eq(progressPhotos.photoType, photoType)
          )
        );
    }

    // Sort by takenAt DESC (most recent first)
    const photos = await query.orderBy(desc(progressPhotos.takenAt));

    return NextResponse.json({ success: true, data: photos }, { status: 200 });
  } catch (error) {
    console.error('GET progress photos error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}