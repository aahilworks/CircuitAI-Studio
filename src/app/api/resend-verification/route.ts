import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Firebase Auth
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 });
    }

    // Check if email is already verified
    if (currentUser.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    // Send verification email
    await sendEmailVerification(currentUser);

    return NextResponse.json({ success: true, message: 'Verification email sent' });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
