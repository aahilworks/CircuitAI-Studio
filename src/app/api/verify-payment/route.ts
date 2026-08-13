import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuthUser } from '@/lib/server/auth';
import { getRazorpayKeySecret } from '@/lib/server/razorpay';
import { activateProSubscription } from '@/lib/server/subscription';

interface VerifySubscriptionBody {
  razorpay_subscription_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } =
      (await req.json()) as VerifySubscriptionBody;

    if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing subscription verification details.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const secret = getRazorpayKeySecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid subscription signature.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    await activateProSubscription(user.uid, {
      subscriptionId: razorpay_subscription_id,
      subscriptionStatus: 'authenticated',
      lastPaymentId: razorpay_payment_id,
    });

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
