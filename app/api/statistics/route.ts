import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/shared/constants/api';

export async function GET(req: NextRequest) {
  const url = new URL(API_ENDPOINTS.STATISTICS);
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