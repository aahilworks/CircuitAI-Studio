import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { requireAuthUser } from '@/lib/server/auth';
import { checkEmailVerification } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Old password and new password are required' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const user = await requireAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const verificationError = checkEmailVerification(user);
    if (verificationError) {
      return verificationError;
    }

    if (!user.email) {
      return NextResponse.json({ error: 'User email not available' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Firebase API key is not configured' }, { status: 500 });
    }

    const verifyPasswordResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: oldPassword,
          returnSecureToken: false,
        }),
      }
    );

    if (!verifyPasswordResponse.ok) {
      return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
    }

    await getAuth().updateUser(user.uid, { password: newPassword });

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error: unknown) {
    console.error('Change password error:', error);

    if (typeof error === 'object' && error && 'code' in error && error.code === 'auth/too-many-requests') {
      return NextResponse.json({ error: 'Too many attempts. Please try again later' }, { status: 429 });
    }
    
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
