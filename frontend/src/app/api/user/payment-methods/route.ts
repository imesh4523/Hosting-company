import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization');
  try {
    const res = await fetch(`${BACKEND_URL}/api/user/payment-methods`, {
      headers: { ...(token ? { 'Authorization': token } : {}) },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization');
  const body = await req.text();
  try {
    const res = await fetch(`${BACKEND_URL}/api/user/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': token } : {}) },
      body,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
