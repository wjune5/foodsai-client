import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_ENDPOINTS } from '@/shared/constants/api';

export async function GET(req: NextRequest) {
  const url = new URL(API_ENDPOINTS.RECIPE);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const backendRes = await fetch(url.toString(), {
    headers: {
      'Authorization': req.headers.get('authorization') || '',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendRes = await fetch(API_ENDPOINTS.RECIPE, {
    method: 'POST',
    headers: {
      'Authorization': req.headers.get('authorization') || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
} 