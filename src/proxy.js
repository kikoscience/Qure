import { NextResponse } from 'next/server';

export function proxy(request) {
  const authUser = request.cookies.get('auth_user');
  const path = request.nextUrl.pathname;

  // Protect specific portal routes
  const protectedPaths = ['/triage', '/staff', '/records'];
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

  if (isProtectedPath && !authUser) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (path === '/login' && authUser) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/triage/:path*', '/staff/:path*', '/records/:path*', '/login'],
};
