import 'server-only';

import { adminDb } from '@/lib/firebaseAdmin';
import {
  hasActiveProAccess,
  isActiveSubscriptionStatus,
  type ProAccessUserData,
} from '@/lib/proAccess';

interface SubscriptionUpdateInput {
  subscriptionId?: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string | null;
  lastPaymentId?: string;
}

export { hasActiveProAccess, isActiveSubscriptionStatus };

export async function activateProSubscription(
  userId: string,
  details: SubscriptionUpdateInput
): Promise<void> {
  const userRef = adminDb.collection('users').doc(userId);

  await userRef.set(
    {
      isPro: true,
      proActivatedAt: new Date().toISOString(),
      subscriptionId: details.subscriptionId ?? null,
      subscriptionStatus: details.subscriptionStatus ?? 'active',
      currentPeriodEnd: details.currentPeriodEnd ?? null,
      lastPaymentId: details.lastPaymentId ?? null,
      proRevokedAt: null,
    },
    { merge: true }
  );
}

export async function revokeProSubscription(
  userId: string,
  details: Pick<SubscriptionUpdateInput, 'subscriptionId' | 'subscriptionStatus'>
): Promise<void> {
  const userRef = adminDb.collection('users').doc(userId);

  await userRef.set(
    {
      isPro: false,
      subscriptionStatus: details.subscriptionStatus ?? 'cancelled',
      subscriptionId: details.subscriptionId ?? null,
      proRevokedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function ensureProAccessSynced(
  userId: string,
  userData: ProAccessUserData | undefined
): Promise<boolean> {
  const active = hasActiveProAccess(userData);

  if (userData?.isPro && !active) {
    await revokeProSubscription(userId, {
      subscriptionId: userData.subscriptionId ?? undefined,
      subscriptionStatus: userData.subscriptionStatus ?? 'ended',
    });
  }

  return active;
}

export async function findUserIdBySubscriptionId(subscriptionId: string): Promise<string | null> {
  const snapshot = await adminDb
    .collection('users')
    .where('subscriptionId', '==', subscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].id;
}
