import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, purpose } = await request.json();

    if (!email || !otp || !purpose) {
      return NextResponse.json({ error: 'Email, OTP, and purpose are required' }, { status: 400 });
    }

    // Get OTP from Firestore
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

    // Check if purpose matches
    if (otpData.purpose !== purpose) {
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

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
