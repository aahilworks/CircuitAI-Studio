import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Verify OTP first
    const otpRef = doc(db, 'otps', email);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    const otpData = otpDoc.data();

    // Check if OTP matches
    if (otpData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Check if purpose is for password reset
    if (otpData.purpose !== 'forgot-password') {
      return NextResponse.json({ error: 'OTP purpose mismatch' }, { status: 400 });
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpData.expiresAt);
    if (expiresAt < new Date()) {
      await deleteDoc(otpRef);
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // Delete OTP after successful verification
    await deleteDoc(otpRef);

    // Send password reset email
    await sendPasswordResetEmail(auth, email);

    return NextResponse.json({ success: true, message: 'Password reset email sent' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Don't reveal if email exists or not for security
    return NextResponse.json({ success: true, message: 'If email exists and OTP is valid, password reset email sent' });
  }
}
