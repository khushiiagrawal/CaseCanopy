import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import User from '@/models/User';
import { generateToken } from '@/utils/jwt';

export async function POST(request: Request) {
  try {
    const { name, email, password, role, phone, address } = await request.json();

    if (!name || !email || !password || !phone || !address) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (role && !['public', 'legal'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user with specified role or default to public
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'public',
      approve: role === 'legal' ? false : true, // Legal users need approval
      phone,
      address,
    });

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
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 