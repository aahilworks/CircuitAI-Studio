import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuthUser } from '@/lib/server/auth';
import { getRazorpayKeySecret } from '@/lib/server/razorpay';
import { activateProSubscription } from '@/lib/server/subscription';

interface VerifySubscriptionBody {
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  billingCycle?: 'monthly' | 'yearly';
}

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { razorpay_subscription_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, billingCycle } =
      (await req.json()) as VerifySubscriptionBody;

    const isYearly = billingCycle === 'yearly';

    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification details.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (isYearly && !razorpay_order_id) {
      return NextResponse.json(
        { success: false, error: 'Missing order ID for yearly payment.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isYearly && !razorpay_subscription_id) {
      return NextResponse.json(
        { success: false, error: 'Missing subscription ID for monthly payment.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const secret = getRazorpayKeySecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_payment_id}|${isYearly ? razorpay_order_id : razorpay_subscription_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (isYearly) {
      // For one-time yearly payment, activate Pro for 1 year
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const userRef = adminDb.collection('users').doc(user.uid);
      
      await userRef.set({
        isPro: true,
        subscriptionStatus: 'active',
        currentPeriodEnd: currentPeriodEnd.toISOString(),
        proActivatedAt: new Date().toISOString(),
        subscriptionBillingCycle: 'yearly',
        lastPaymentId: razorpay_payment_id,
        pendingOrderId: null, // Clear pending order
      }, { merge: true });
    } else {
      // For monthly subscription
      await activateProSubscription(user.uid, {
        subscriptionId: razorpay_subscription_id!,
        subscriptionStatus: 'authenticated',
        lastPaymentId: razorpay_payment_id,
      });
      
      // Also set billing cycle for monthly
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const userRef = adminDb.collection('users').doc(user.uid);
      await userRef.set({
        subscriptionBillingCycle: 'monthly',
      }, { merge: true });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription verified. CircuitAI Pro is active.',
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('[verify-payment] failed:', getErrorMessage(error));
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) || 'Internal Server Error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
