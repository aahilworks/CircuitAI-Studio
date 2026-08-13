import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRazorpayWebhookSecret } from '@/lib/server/razorpay';
import {
  activateProSubscription,
  findUserIdBySubscriptionId,
  revokeProSubscription,
} from '@/lib/server/subscription';

export const runtime = 'nodejs';

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    subscription?: {
      entity?: {
        id?: string;
        status?: string;
        notes?: Record<string, string>;
        current_end?: number;
      };
    };
    payment?: {
      entity?: {
        id?: string;
      };
    };
  };
}

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', getRazorpayWebhookSecret())
    .update(rawBody)
    .digest('hex');

  return expected === signature;
}

async function resolveUserId(
  subscriptionId: string | undefined,
  notes?: Record<string, string>
): Promise<string | null> {
  if (notes?.userId) {
    return notes.userId;
  }

  if (!subscriptionId) {
    return null;
  }

  return findUserIdBySubscriptionId(subscriptionId);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  try {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const event = payload.event || '';
    const subscription = payload.payload?.subscription?.entity;
    const paymentId = payload.payload?.payment?.entity?.id;
    const subscriptionId = subscription?.id;
    const userId = await resolveUserId(subscriptionId, subscription?.notes);

    if (!userId) {
      console.warn('[razorpay-webhook] No user mapped for event:', event, subscriptionId);
      return NextResponse.json({ received: true }, { headers: { 'Content-Type': 'application/json' } });
    }

    const currentPeriodEnd = subscription?.current_end
      ? new Date(subscription.current_end * 1000).toISOString()
      : null;

    switch (event) {
      case 'subscription.authenticated':
      case 'subscription.activated':
      case 'subscription.charged':
      case 'subscription.resumed':
        await activateProSubscription(userId, {
          subscriptionId,
          subscriptionStatus: subscription?.status || 'active',
          currentPeriodEnd,
          lastPaymentId: paymentId,
        });
        break;

      case 'subscription.cancelled':
      case 'subscription.halted':
      case 'subscription.completed':
        await revokeProSubscription(userId, {
          subscriptionId,
          subscriptionStatus: subscription?.status || event.replace('subscription.', ''),
        });
        break;

      case 'payment.failed':
        await revokeProSubscription(userId, {
          subscriptionId,
          subscriptionStatus: 'payment_failed',
        });
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('[razorpay-webhook] failed:', getErrorMessage(error));
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
