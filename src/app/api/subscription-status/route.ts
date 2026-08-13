import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/server/auth';
import { adminDb } from '@/lib/firebaseAdmin';
import { ensureProAccessSynced } from '@/lib/server/subscription';

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const isPro = await ensureProAccessSynced(user.uid, userData);

    return NextResponse.json({
      isPro,
      subscriptionStatus: userData?.subscriptionStatus ?? null,
      currentPeriodEnd: userData?.currentPeriodEnd ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync subscription status.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
