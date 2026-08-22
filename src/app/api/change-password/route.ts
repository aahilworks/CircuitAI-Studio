import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { checkEmailVerification } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Old password and new password are required' }, { status: 400 });
    }

    const user = auth.currentUser;

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Security: Check email verification
    const verificationError = await checkEmailVerification();
    if (verificationError) {
      return verificationError;
    }

    if (!user.email) {
      return NextResponse.json({ error: 'User email not available' }, { status: 400 });
    }

    // Reauthenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(user, credential);

    // Change password
    await updatePassword(user, newPassword);

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    
    if (error.code === 'auth/wrong-password') {
      return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
    }
    
    if (error.code === 'auth/weak-password') {
      return NextResponse.json({ error: 'Password is too weak' }, { status: 400 });
    }
    
    if (error.code === 'auth/too-many-requests') {
      return NextResponse.json({ error: 'Too many attempts. Please try again later' }, { status: 429 });
    }
    
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
