export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['authenticated', 'active', 'pending', 'trial']);

export const ENDED_SUBSCRIPTION_STATUSES = new Set([
  'cancelled',
  'halted',
  'completed',
  'payment_failed',
  'paused',
]);

export interface ProAccessUserData {
  isPro?: boolean;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
  subscriptionId?: string | null;
}

export function isActiveSubscriptionStatus(status?: string | null): boolean {
  return !!status && ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}

export function hasActiveProAccess(userData?: ProAccessUserData | null): boolean {
  if (!userData?.isPro) {
    return false;
  }

  if (!isActiveSubscriptionStatus(userData.subscriptionStatus)) {
    return false;
  }

  if (userData.currentPeriodEnd) {
    const periodEndMs = new Date(userData.currentPeriodEnd).getTime();
    if (!Number.isNaN(periodEndMs) && periodEndMs <= Date.now()) {
      return false;
    }
  }

  return true;
}
