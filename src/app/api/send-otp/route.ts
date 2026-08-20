import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import nodemailer from 'nodemailer';

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

    const senderEmail = process.env.EMAIL_OTP_SENDER_EMAIL;
    const senderPassword = process.env.EMAIL_OTP_SENDER_PASSWORD;

    if (!senderEmail || !senderPassword) {
      return NextResponse.json({ error: 'Email configuration not found' }, { status: 500 });
    }

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

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: senderPassword,
      },
    });

    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: purpose === 'signup' ? 'CircuitAI - Email Verification' : 'CircuitAI - Login OTP',
      text: `Your OTP for CircuitAI is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #14b8a6;">CircuitAI</h2>
          <p>Your OTP for ${purpose === 'signup' ? 'email verification' : 'login'} is:</p>
          <h1 style="color: #14b8a6; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
