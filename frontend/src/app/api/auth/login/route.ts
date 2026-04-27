import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Fake login logic for UI testing
    if (body.email && body.password) {
      return NextResponse.json({
        message: 'Login successful',
        token: 'fake-jwt-token-for-testing',
        user: { id: '1', email: body.email, name: 'Test User', role: 'CUSTOMER' }
      }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
