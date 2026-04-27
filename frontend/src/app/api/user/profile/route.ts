import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function proxyRequest(req: NextRequest, path: string) {
  const token = req.headers.get('authorization');
  const method = req.method;
  const body = method !== 'GET' ? await req.text() : undefined;

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': token } : {}),
      },
      ...(body ? { body } : {}),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/api/user/profile');
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, '/api/user/profile');
}
