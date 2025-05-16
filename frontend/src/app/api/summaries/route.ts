import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import CaseSummary from '@/models/CaseSummary';
import User from '@/models/User';
import { verifyToken } from '@/utils/jwt';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const summaries = await CaseSummary.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'legal') {
      return NextResponse.json(
        { error: 'Only legal professionals can publish summaries' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, caseId, pdfUrl, tags } = body;

    if (!title || !content || !caseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Verify user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const summary = await CaseSummary.create({
      title,
      content,
      author: decoded.id,
      caseId,
      pdfUrl,
      tags: tags || [],
    });

    return NextResponse.json(summary, { status: 201 });
  } catch (error) {
    console.error('Error creating summary:', error);
    return NextResponse.json(
      { error: 'Failed to create summary' },
      { status: 500 }
    );
  }
} 