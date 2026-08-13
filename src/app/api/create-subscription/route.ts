import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/server/auth';
import { getRazorpayClient, getRazorpayPlanId, getTrialDays } from '@/lib/server/razorpay';
import { adminDb } from '@/lib/firebaseAdmin';
import { hasActiveProAccess } from '@/lib/proAccess';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Failed to create subscription.';

interface RazorpaySubscriptionError {
  error?: { description?: string };
  description?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Sign in and try again.' }, { status: 401 });
    }

    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (hasActiveProAccess(userData)) {
      return NextResponse.json({ error: 'You already have an active Pro subscription.' }, { status: 409 });
    }

    const razorpay = getRazorpayClient();
    const trialDays = getTrialDays();
    const startAt =
      trialDays > 0 ? Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60 : undefined;

    const subscription = await razorpay.subscriptions.create({
      plan_id: getRazorpayPlanId(),
      total_count: 12,
      customer_notify: 1,
      ...(startAt ? { start_at: startAt } : {}),
      notes: {
        userId: user.uid,
        product: 'circuitai_pro_monthly',
      },
    });

    await userRef.set(
      {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlanId: getRazorpayPlanId(),
        subscriptionCreatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      subscription_id: subscription.id,
      status: subscription.status,
    });
  } catch (error: unknown) {
    console.error('[create-subscription] failed:', getErrorMessage(error));

    const razorpayError = error as RazorpaySubscriptionError;
    const errorMessage =
      razorpayError?.error?.description ||
      razorpayError?.description ||
      razorpayError?.message ||
      getErrorMessage(error);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
