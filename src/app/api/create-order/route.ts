import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/server/auth';
import { getRazorpayClient } from '@/lib/server/razorpay';
import { adminDb } from '@/lib/firebaseAdmin';
import { hasActiveProAccess } from '@/lib/proAccess';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Failed to create order.';

interface RazorpayOrderError {
  error?: { description?: string };
  description?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Sign in and try again.' }, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    const billingCycle = body.billingCycle || 'yearly';

    if (billingCycle !== 'yearly') {
      return NextResponse.json({ error: 'This endpoint is for yearly one-time payment only.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (hasActiveProAccess(userData)) {
      return NextResponse.json({ error: 'You already have an active Pro subscription.' }, { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    // Independence Day Offer pricing
    const INDEPENDENCE_DAY_START = new Date('2026-08-15T00:00:00.000Z');
    const INDEPENDENCE_DAY_END = new Date('2026-08-20T00:00:00.000Z');
    const now = new Date();
    const isOfferActive = now >= INDEPENDENCE_DAY_START && now < INDEPENDENCE_DAY_END;
    
    const amount = isOfferActive ? 599900 : 699900; // Razorpay uses paise (₹5999 = 599900 paise)
    const currency = 'INR';

    // Create Razorpay order for one-time payment
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: `circuitai_pro_${user.uid}_${Date.now()}`,
      notes: {
        userId: user.uid,
        product: 'circuitai_pro_yearly_onetime',
        billingCycle: 'yearly',
        isOfferActive: isOfferActive.toString(),
      },
    });

    // Store order details in Firebase
    await userRef.set(
      {
        pendingOrderId: order.id,
        pendingOrderAmount: amount,
        pendingOrderCurrency: currency,
        pendingBillingCycle: 'yearly',
        pendingOrderCreatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentProvider: 'razorpay',
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('[create-order] failed:', getErrorMessage(error));

    const razorpayError = error as RazorpayOrderError;
    const errorMessage =
      razorpayError?.error?.description ||
      razorpayError?.description ||
      razorpayError?.message ||
      getErrorMessage(error);

    return NextResponse.json({ error: errorMessage }, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
