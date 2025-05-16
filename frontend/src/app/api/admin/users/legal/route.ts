import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // Find all users with role "legal"
    const legalUsers = await User.find({ role: 'legal' }).select('-password');

    console.log('Found legal users:', legalUsers);

    return NextResponse.json(legalUsers);
  } catch (error) {
    console.error('Error fetching legal users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal users' },
      { status: 500 }
    );
  }
} 