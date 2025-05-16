import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import { verifyToken } from '@/utils/jwt';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    await connectDB();

    // TODO: Replace with actual case fetching logic
    // For now, return mock data
    const mockCase = {
      id: params.id,
      title: "Environmental Protection Case Study",
      summary: "A landmark case addressing environmental protection in the Ganga Basin region.",
      jurisdiction: "Supreme Court of India",
      year: "2022",
      outcome: "favorable",
      legalArguments: [
        "Right to clean environment as a fundamental right",
        "Precautionary principle in environmental law",
        "Public trust doctrine application"
      ],
      predictionScore: 85,
      similarCases: 12,
      tags: ["environmental", "water-rights", "public-trust"]
    };

    return NextResponse.json(mockCase);
  } catch (error) {
    console.error('Case fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 