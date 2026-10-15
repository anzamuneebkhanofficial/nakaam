import { NextResponse } from 'next/server';

const PROTECTED_USER_ROUTES = ['/user', '/account', '/checkout'];
const PROTECTED_ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // Session cookie detection across Better Auth variants
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token') ||
    request.cookies.get('better-auth.session_data');

  const hasSession = Boolean(sessionCookie && sessionCookie.value);
  const userRole = request.cookies.get('nakaam_user_role')?.value || '';

  // Seamless alias: Rewrite/redirect legacy /account paths to /user
  if (pathname === '/account' || pathname.startsWith('/account/')) {
    const targetPath = pathname.replace(/^\/account/, '/user');
    const redirectUrl = new URL(`${targetPath}${search}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const isUserProtected = PROTECTED_USER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminProtected = PROTECTED_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. Unauthenticated visitor trying to access user-protected routes (/user, /checkout)
  if (isUserProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Unauthenticated visitor trying to access admin console (/admin)
  if (isAdminProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated customer trying to access admin console (/admin)
  if (isAdminProtected && hasSession && userRole && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/user', request.url));
  }

  // 4. Authenticated user (customer or admin) trying to access public auth pages (/login, /register, etc.)
  // Note: Allow /verify-email if a token is being verified
  const isVerifyingToken = pathname === '/verify-email' && request.nextUrl.searchParams.has('token');
  if (isAuthPage && hasSession && !isVerifyingToken) {
    const destination = userRole === 'admin' ? '/admin' : '/user';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ],
};
