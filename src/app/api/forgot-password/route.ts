import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await sendPasswordResetEmail(auth, email);

    return NextResponse.json({ success: true, message: 'Password reset email sent' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Don't reveal if email exists or not for security
    return NextResponse.json({ success: true, message: 'If email exists, password reset email sent' });
  }
}
