import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import User from '@/models/User';
import { generateToken } from '@/utils/jwt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is legal and not approved
    if (user.role === 'legal' && !user.approve) {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please wait for admin approval.' },
        { status: 403 }
      );
    }

    const token = generateToken(user);

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approve: user.approve,
        phone: user.phone,
        address: user.address,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 