import 'server-only';

import Razorpay from 'razorpay';

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys are not configured on the server.');
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
}

export function getRazorpayKeySecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured.');
  }
  return secret;
}

export function getRazorpayWebhookSecret(): string {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured.');
  }
  return secret;
}

export function getRazorpayPlanId(): string {
  const planId = process.env.RAZORPAY_PLAN_ID?.trim();
  if (!planId) {
    throw new Error('RAZORPAY_PLAN_ID is not configured. Create a test plan in Razorpay Dashboard.');
  }
  return planId;
}

export function getRazorpayYearlyPlanId(): string {
  const planId = process.env.RAZORPAY_YEARLY_PLAN_ID?.trim();
  if (!planId) {
    throw new Error('RAZORPAY_YEARLY_PLAN_ID is not configured. Create a yearly test plan in Razorpay Dashboard.');
  }
  return planId;
}

export function getRazorpayInternationalMonthlyPlanId(): string {
  const planId = process.env.RAZORPAY_INTERNATIONAL_MONTHLY_PLAN_ID?.trim();
  if (!planId) {
    throw new Error('RAZORPAY_INTERNATIONAL_MONTHLY_PLAN_ID is not configured. Create an international monthly plan in Razorpay Dashboard.');
  }
  return planId;
}

export function getRazorpayInternationalYearlyPlanId(): string {
  const planId = process.env.RAZORPAY_INTERNATIONAL_YEARLY_PLAN_ID?.trim();
  if (!planId) {
    throw new Error('RAZORPAY_INTERNATIONAL_YEARLY_PLAN_ID is not configured. Create an international yearly plan in Razorpay Dashboard.');
  }
  return planId;
}

export function getTrialDays(): number {
  const raw = process.env.RAZORPAY_TRIAL_DAYS;
  const parsed = raw ? Number(raw) : 2;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 2;
}
