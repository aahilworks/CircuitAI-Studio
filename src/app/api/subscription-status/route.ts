import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/server/auth';
import { adminDb } from '@/lib/firebaseAdmin';
import { getRazorpayClient } from '@/lib/server/razorpay';
import { ensureProAccessSynced, revokeProSubscription, activateProSubscription } from '@/lib/server/subscription';
import { isActiveSubscriptionStatus } from '@/lib/proAccess';

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    let isPro = await ensureProAccessSynced(user.uid, userData);
    let subscriptionStatus = userData?.subscriptionStatus ?? null;
    let currentPeriodEnd = userData?.currentPeriodEnd ?? null;

    if (userData?.subscriptionId) {
      try {
        const razorpay = getRazorpayClient();
        const subscription = await razorpay.subscriptions.fetch(userData.subscriptionId);
        subscriptionStatus = subscription.status ?? subscriptionStatus;
        currentPeriodEnd = subscription.current_end
          ? new Date(subscription.current_end * 1000).toISOString()
          : currentPeriodEnd;

        if (subscriptionStatus && isActiveSubscriptionStatus(subscriptionStatus)) {
          await activateProSubscription(user.uid, {
            subscriptionId: userData.subscriptionId,
            subscriptionStatus,
            currentPeriodEnd,
          });
          isPro = true;
        } else if (subscriptionStatus) {
          await revokeProSubscription(user.uid, {
            subscriptionId: userData.subscriptionId,
            subscriptionStatus,
          });
          isPro = false;
        }
      } catch (error) {
        console.error('[subscription-status] Razorpay sync failed:', error instanceof Error ? error.message : String(error));
      }
    }

    return NextResponse.json({
      isPro,
      subscriptionStatus,
      currentPeriodEnd,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync subscription status.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
