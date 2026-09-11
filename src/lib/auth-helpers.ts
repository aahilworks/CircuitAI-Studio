import { NextResponse } from 'next/server';
import type { AuthenticatedUser } from '@/lib/server/auth';

/**
 * Check if the authenticated user's email is verified.
 * Returns an error response if not verified, null if verified
 */
export function checkEmailVerification(user: AuthenticatedUser | null): NextResponse | null {
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json({ 
      error: 'Email not verified', 
      message: 'Please verify your email to access this feature.' 
    }, { status: 403 });
  }

  return null;
}
