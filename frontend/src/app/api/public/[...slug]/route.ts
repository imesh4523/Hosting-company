import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  if (!slugArray) {
    return NextResponse.json({ success: false, message: 'Missing slug' }, { status: 400 });
  }
  const slug = slugArray.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/api/public/${slug}${searchParams ? '?' + searchParams : ''}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    try {
      return NextResponse.json(JSON.parse(text));
    } catch (e) {
      console.error('[Proxy] JSON Parse Error:', text.substring(0, 100));
      return new NextResponse(text, { status: response.status, headers: { 'Content-Type': 'text/plain' } });
    }
  } catch (error) {
    console.error('[Proxy] Fetch Error:', (error as Error).message);
    return NextResponse.json({ success: false, message: 'Proxy failed', error: (error as Error).message }, { status: 500 });
  }
}
