import 'server-only';

import Razorpay from 'razorpay';
import { Currency } from '../currency';

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

export function getRazorpayPlanId(currency: Currency, billingCycle: 'monthly' | 'yearly'): string {
  const suffix = billingCycle === 'yearly' ? '_YEARLY' : '';
  const envVar = `RAZORPAY_PLAN_ID_${currency}${suffix}`;
  const planId = process.env[envVar]?.trim();
  
  if (!planId) {
    throw new Error(`${envVar} is not configured. Create a ${billingCycle} ${currency} plan in Razorpay Dashboard.`);
  }
  return planId;
}

export function getTrialDays(): number {
  const raw = process.env.RAZORPAY_TRIAL_DAYS;
  const parsed = raw ? Number(raw) : 2;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 2;
}
