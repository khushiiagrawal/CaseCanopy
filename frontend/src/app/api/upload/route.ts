import { NextResponse } from 'next/server';
import { getAuthState } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    const authState = getAuthState();
    if (!authState?.user || authState.user.role !== 'legal') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // TODO: Implement actual file upload to cloud storage
    // For now, we'll just return a mock URL
    const mockUrl = `/uploads/${Date.now()}-${file.name}`;

    return NextResponse.json({ url: mockUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 