import { auth } from '@/lib/firebase';
import { NextResponse } from 'next/server';

/**
 * Check if the current user's email is verified
 * Returns an error response if not verified, null if verified
 */
export async function checkEmailVerification(): Promise<NextResponse | null> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Reload user to get latest verification status
  await currentUser.reload();

  if (!currentUser.emailVerified) {
    return NextResponse.json({ 
      error: 'Email not verified', 
      message: 'Please verify your email to access this feature.' 
    }, { status: 403 });
  }

  return null;
}
