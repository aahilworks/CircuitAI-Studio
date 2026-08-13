import type { User } from 'firebase/auth';

interface RazorpaySubscriptionResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpaySubscriptionOptions {
  key: string | undefined;
  subscription_id: string;
  name: string;
  description: string;
  prefill: { email: string; name?: string };
  handler: (response: RazorpaySubscriptionResponse) => Promise<void>;
  theme: { color: string };
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
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export async function initiateProSubscription({
  currentUser,
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
    const subscriptionRes = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    const subscriptionData = await subscriptionRes.json();
    if (!subscriptionRes.ok) {
      throw new Error(subscriptionData.error || 'Failed to start subscription checkout.');
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay checkout is unavailable after loading.');
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      throw new Error('Subscription configuration is missing on this deployment.');
    }

    const isTestMode = razorpayKey.startsWith('rzp_test_');

    const razorpayInstance = new window.Razorpay({
      key: razorpayKey,
      subscription_id: subscriptionData.subscription_id,
      name: 'CircuitAI',
      description: isTestMode
        ? 'Pro Monthly (Test Mode) — 2-day trial, then ₹999/month'
        : 'Pro Monthly Subscription — 2-day free trial, then ₹999/month',
      prefill: {
        email: currentUser.email || '',
        name: currentUser.displayName || undefined,
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
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            notifySuccess('Subscription started. Your CircuitAI Pro trial is active.');
            return;
          }

          notifyError(verifyData.error || 'Subscription verification failed.');
        } catch {
          notifyError('Verification request failed. Contact support if you were charged.');
        }
      },
      theme: { color: '#0d9488' },
    });

    razorpayInstance.open();
  } catch (error) {
    notifyError(error instanceof Error ? error.message : 'Subscription setup failed.');
  }
}
