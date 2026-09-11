import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  if (url.pathname === '/.well-known/apple-developer-merchantid-domain-association') {
    return NextResponse.next();
  }

  if (hostname === 'circuitai.in') {
    const wwwUrl = new URL(url);
    wwwUrl.hostname = 'www.circuitai.in';
    return NextResponse.redirect(wwwUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
