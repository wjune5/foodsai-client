import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/shared/constants/api';

export async function POST(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const body = await req.json();
  let backendUrl = '';

  if (pathname.endsWith('/login')) {
    backendUrl = API_ENDPOINTS.AUTH_LOGIN;
  } else if (pathname.endsWith('/register')) {
    backendUrl = API_ENDPOINTS.AUTH_REGISTER;
  } else if (pathname.endsWith('/refresh')) {
    backendUrl = API_ENDPOINTS.AUTH_REFRESH;
  } else if (pathname.endsWith('/logout')) {
    backendUrl = API_ENDPOINTS.AUTH_LOGOUT; 
  } else {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const backendRes = await fetch(backendUrl, {
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

export async function GET(req: NextRequest) {
  // For /auth/me
  const { pathname } = req.nextUrl;
  if (!pathname.endsWith('/me')) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  const backendRes = await fetch(API_ENDPOINTS.AUTH_ME, {
    headers: {
      'Authorization': req.headers.get('authorization') || '',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}

export async function PUT(req: NextRequest) {
  // For /auth/me
  const { pathname } = req.nextUrl;
  if (!pathname.endsWith('/me')) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  const body = await req.json();
  const backendRes = await fetch(API_ENDPOINTS.AUTH_ME, {
    method: 'PUT',
    headers: {
      'Authorization': req.headers.get('authorization') || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
} 