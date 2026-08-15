import type { User } from 'firebase/auth';

// Independence Day Offer: August 15, 2026 (80th Independence Day)
// Offer valid for 5 days: August 15-19, 2026
const INDEPENDENCE_DAY_START = new Date('2026-08-15T00:00:00.000Z');
const INDEPENDENCE_DAY_END = new Date('2026-08-20T00:00:00.000Z');

const isIndependenceDayOffer = () => {
  const now = new Date();
  return now >= INDEPENDENCE_DAY_START && now < INDEPENDENCE_DAY_END;
};

const getOfferPrice = (billingCycle: 'monthly' | 'yearly') => {
  if (!isIndependenceDayOffer()) {
    return billingCycle === 'yearly' ? '₹6,999' : '₹999';
  }
  return billingCycle === 'yearly' ? '₹5,999' : '₹699';
};

interface RazorpaySubscriptionResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpaySubscriptionOptions {
  key: string | undefined;
  subscription_id?: string;
  order_id?: string;
  name: string;
  description: string;
  prefill: { email: string; name?: string };
  handler: (response: RazorpaySubscriptionResponse) => Promise<void>;
  theme: { color: string };
  method?: {
    upi: boolean;
    card: boolean;
    netbanking: boolean;
    wallet: boolean;
    emi: boolean;
    paylater: boolean;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpaySubscriptionOptions) => { open: () => void };
  }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

interface InitiateProSubscriptionOptions {
  currentUser: User;
  billingCycle?: 'monthly' | 'yearly';
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export async function initiateProSubscription({
  currentUser,
  billingCycle = 'monthly',
  onSuccess,
  onError,
}: InitiateProSubscriptionOptions): Promise<void> {
  const notifyError = (message: string) => {
    onError?.(message);
  };

  const notifySuccess = (message: string) => {
    onSuccess?.(message);
  };

  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay checkout. Check your network connection.');
    }

    const idToken = await currentUser.getIdToken();
    
    // For yearly, use one-time payment order; for monthly, use subscription
    const isYearly = billingCycle === 'yearly';
    const endpoint = isYearly ? '/api/create-order' : '/api/create-subscription';
    
    const subscriptionRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ billingCycle }),
    });

    const subscriptionData = await subscriptionRes.json();
    if (!subscriptionRes.ok) {
      throw new Error(subscriptionData.error || 'Failed to start payment checkout.');
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay checkout is unavailable after loading.');
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      throw new Error('Payment configuration is missing on this deployment.');
    }

    const isTestMode = razorpayKey.startsWith('rzp_test_');
    
    // Use Independence Day offer pricing if active
    const price = getOfferPrice(billingCycle);
    const period = isYearly ? 'year' : 'month';
    const offerText = isIndependenceDayOffer() ? '🇮🇳 Independence Day Special - ' : '';
    const paymentType = isYearly ? 'One-time Payment' : 'Subscription';

    const razorpayInstance = new window.Razorpay({
      key: razorpayKey,
      ...(isYearly ? { order_id: subscriptionData.order_id } : { subscription_id: subscriptionData.subscription_id }),
      name: 'CircuitAI',
      description: isTestMode
        ? `${offerText}Pro ${isYearly ? 'Yearly' : 'Monthly'} (Test Mode) — ${paymentType}, ${price}/${period}`
        : `${offerText}Pro ${isYearly ? 'Yearly' : 'Monthly'} ${paymentType} — ${price}/${period}`,
      prefill: {
        email: currentUser.email || '',
        name: currentUser.displayName || undefined,
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        emi: true,
        paylater: true,
      },
      handler: async (response) => {
        try {
          const verifyToken = await currentUser.getIdToken();
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${verifyToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...response, billingCycle }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            notifySuccess(isYearly ? 'Payment successful. Your CircuitAI Pro is now active for 1 year!' : 'Subscription started. Your CircuitAI Pro trial is active.');
            return;
          }

          notifyError(verifyData.error || 'Payment verification failed.');
        } catch {
          notifyError('Verification request failed. Contact support if you were charged.');
        }
      },
      theme: { color: '#0d9488' },
    });

    razorpayInstance.open();
  } catch (error) {
    notifyError(error instanceof Error ? error.message : 'Payment setup failed.');
  }
}
