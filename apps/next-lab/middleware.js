import { NextResponse } from 'next/server';

// Edge Middleware runs before the cache on every matched request.
// The dashboard reports it separately under Deployment > Functions.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(request) {
  const response = NextResponse.next();

  response.headers.set('x-study-lab-middleware', 'active');
  response.headers.set(
    'x-study-lab-geo',
    request.headers.get('x-vercel-ip-country') ?? 'unknown'
  );

  return response;
}
