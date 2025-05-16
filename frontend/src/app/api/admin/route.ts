import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Forward the request to the backend
    const response = await fetch("http://localhost:8000/api/users", {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching legal users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  // const { userId } = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Forward the request to the backend
    const response = await fetch(`http://localhost:8000/api/users/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to approve user');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 });
  }
} 