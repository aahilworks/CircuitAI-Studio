import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: 'Email and purpose are required' }, { status: 400 });
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      return NextResponse.json({ error: 'EmailJS configuration not found' }, { status: 500 });
    }

    // Initialize EmailJS with public key
    emailjs.init(publicKey);

    // Check if email already exists in Firestore (for signup)
    if (purpose === 'signup') {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in Firestore
    const otpRef = doc(db, 'otps', email);
    await setDoc(otpRef, {
      otp,
      purpose,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Send email using EmailJS
    const templateParams = {
      to_email: email,
      otp: otp,
      purpose: purpose === 'signup' ? 'email verification' : 'login',
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
