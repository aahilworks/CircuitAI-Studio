import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/server/auth';
import { getRazorpayClient, getRazorpayPlanId, getRazorpayYearlyPlanId, getRazorpayInternationalMonthlyPlanId, getRazorpayInternationalYearlyPlanId, getTrialDays } from '@/lib/server/razorpay';
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
      return NextResponse.json({ error: 'Unauthorized. Sign in and try again.' }, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    const billingCycle = body.billingCycle || 'monthly';
    const country = body.country || { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' };

    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (hasActiveProAccess(userData)) {
      return NextResponse.json({ error: 'You already have an active Pro subscription.' }, { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    // Use Razorpay for all countries with appropriate plan IDs
    const razorpay = getRazorpayClient();
    const trialDays = getTrialDays();
    const startAt =
      trialDays > 0 ? Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60 : undefined;

    // Select appropriate plan based on country and billing cycle
    let planId: string;
    let product: string;
    
    if (country.code === 'IN') {
      // India plans
      planId = billingCycle === 'yearly' ? getRazorpayYearlyPlanId() : getRazorpayPlanId();
      product = billingCycle === 'yearly' ? 'circuitai_pro_yearly_in' : 'circuitai_pro_monthly_in';
    } else {
      // International plans
      planId = billingCycle === 'yearly' ? getRazorpayInternationalYearlyPlanId() : getRazorpayInternationalMonthlyPlanId();
      product = billingCycle === 'yearly' ? 'circuitai_pro_yearly_intl' : 'circuitai_pro_monthly_intl';
    }
    
    const totalCount = billingCycle === 'yearly' ? 1 : 12;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount,
      customer_notify: 1,
      ...(startAt ? { start_at: startAt } : {}),
      notes: {
        userId: user.uid,
        product,
        billingCycle,
        countryCode: country.code,
        currency: country.currency,
      },
    });

    await userRef.set(
      {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlanId: planId,
        subscriptionBillingCycle: billingCycle,
        subscriptionCreatedAt: new Date().toISOString(),
        countryCode: country.code,
        currency: country.currency,
      },
      { merge: true }
    );

    return NextResponse.json({
      subscription_id: subscription.id,
      status: subscription.status,
      paymentProvider: 'razorpay',
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('[create-subscription] failed:', getErrorMessage(error));

    const razorpayError = error as RazorpaySubscriptionError;
    const errorMessage =
      razorpayError?.error?.description ||
      razorpayError?.description ||
      razorpayError?.message ||
      getErrorMessage(error);

    return NextResponse.json({ error: errorMessage }, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
