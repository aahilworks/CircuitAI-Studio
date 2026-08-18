import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/server/auth';
import { getRazorpayClient, getRazorpayPlanId, getTrialDays } from '@/lib/server/razorpay';
import { adminDb } from '@/lib/firebaseAdmin';
import { hasActiveProAccess } from '@/lib/proAccess';
import { Currency } from '@/lib/currency';

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Sign in and try again.' }, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    const newBillingCycle = body.billingCycle || 'monthly';
    const currency = (body.currency || 'INR') as Currency;

    if (newBillingCycle !== 'monthly' && newBillingCycle !== 'yearly') {
      return NextResponse.json({ error: 'Invalid billing cycle. Must be monthly or yearly.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!hasActiveProAccess(userData)) {
      return NextResponse.json({ error: 'You do not have an active Pro subscription.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (userData?.subscriptionBillingCycle === newBillingCycle) {
      return NextResponse.json({ error: 'You are already on this billing cycle.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Cancel current subscription in Razorpay
    if (userData?.subscriptionId) {
      const razorpay = getRazorpayClient();
      await razorpay.subscriptions.cancel(userData.subscriptionId);
    }

    // Create new subscription with new billing cycle
    const razorpay = getRazorpayClient();
    const trialDays = getTrialDays();
    const startAt =
      trialDays > 0 ? Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60 : undefined;

    const planId = getRazorpayPlanId(currency, newBillingCycle);
    const product = newBillingCycle === 'yearly' ? 'circuitai_pro_yearly' : 'circuitai_pro_monthly';
    const totalCount = newBillingCycle === 'yearly' ? 1 : 12;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount,
      customer_notify: 1,
      ...(startAt ? { start_at: startAt } : {}),
      notes: {
        userId: user.uid,
        product,
        billingCycle: newBillingCycle,
      },
    });

    await userRef.set(
      {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlanId: planId,
        subscriptionBillingCycle: newBillingCycle,
        subscriptionCreatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      subscription_id: subscription.id,
      status: subscription.status,
      billingCycle: newBillingCycle,
      message: `Successfully changed to ${newBillingCycle} billing.`,
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('[change-plan] failed:', error instanceof Error ? error.message : String(error));

    return NextResponse.json({ error: 'Failed to change plan. Please try again.' }, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
