import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminAuth = request.cookies.has('admin-auth');
  const isStudentAuth = request.cookies.has('student-auth');

  // Protect /admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAdminAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect logged-in admin from login page
  if (pathname === '/admin/login' && isAdminAuth) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Protect /vote route
  if (pathname.startsWith('/vote')) {
    if (!isStudentAuth) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect logged-in student from login page
  if (pathname === '/' && isStudentAuth) {
    return NextResponse.redirect(new URL('/vote', request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin/login', '/vote', '/'],
};
