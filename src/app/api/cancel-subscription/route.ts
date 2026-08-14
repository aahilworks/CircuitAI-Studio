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

    if (!userData?.subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Cancel subscription in Razorpay
    const razorpay = getRazorpayClient();
    await razorpay.subscriptions.cancel(userData.subscriptionId);

    // Update user document
    await userRef.set(
      {
        subscriptionStatus: 'cancelled',
        subscriptionCancelledAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, message: 'Subscription cancelled successfully.' }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('[cancel-subscription] failed:', error instanceof Error ? error.message : String(error));

    return NextResponse.json({ error: 'Failed to cancel subscription. Please try again.' }, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
