import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/server/auth';
import { getRazorpayClient } from '@/lib/server/razorpay';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Sign in and try again.' }, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData?.isPro) {
      return NextResponse.json({ error: 'No active Pro subscription found.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if user has a Razorpay subscription (monthly) or one-time payment (yearly)
    if (userData?.subscriptionId) {
      // Cancel Razorpay subscription for monthly users
      try {
        const razorpay = getRazorpayClient();
        await razorpay.subscriptions.cancel(userData.subscriptionId);
      } catch (error) {
        console.error('Failed to cancel Razorpay subscription:', error);
        // Continue with Firebase update even if Razorpay cancellation fails
      }
    }

    // Update user document to remove Pro access
    await userRef.set(
      {
        isPro: false,
        subscriptionStatus: 'cancelled',
        subscriptionCancelledAt: new Date().toISOString(),
        currentPeriodEnd: new Date().toISOString(), // End access immediately
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, message: 'Pro access cancelled successfully.' }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('[cancel-subscription] failed:', error instanceof Error ? error.message : String(error));

    return NextResponse.json({ error: 'Failed to cancel subscription. Please try again.' }, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
