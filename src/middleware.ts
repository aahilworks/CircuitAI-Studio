import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Skip redirect for Apple Pay verification path
  if (url.pathname === '/.well-known/apple-developer-merchantid-domain-association') {
    return NextResponse.next();
  }

  // Redirect non-www to www
  if (hostname === 'circuitai.in') {
    const wwwUrl = new URL(url);
    wwwUrl.hostname = 'www.circuitai.in';
    return NextResponse.redirect(wwwUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for:
    // - _next (Next.js internals)
    // - api (API routes)
    // - static files (images, etc.)
    // - Apple Pay verification (handled separately above)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
