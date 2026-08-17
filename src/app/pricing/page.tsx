'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import AuthModal from '@/lib/components/AuthModal';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { initiateProSubscription } from '@/lib/razorpayCheckout';
import { hasActiveProAccess } from '@/lib/proAccess';
import { ArrowRight, CheckCircle2, CreditCard, Crown, Lock, Menu, RefreshCw, Sparkles, X } from 'lucide-react';

const freeFeatures = [
  '5 AI projects per month',
  '10 saved projects',
  'Basic wiring list',
  'Markdown project pack',
  'Basic code upload checklist',
  'Testing and troubleshooting tabs',
];

const proFeatures = [
  'Unlimited AI generations',
  'Unlimited project modifications',
  'Unlimited saved project history',
  'Advanced visual wiring diagram',
  'Board-specific upload guide',
  'Premium simulation lab',
  'Smart parts shopping list',
  'Teacher report mode',
  'Viva questions and marking rubric',
  'PDF / print report export',
  'Board conversion workflows',
  'Student-friendly code explanations',
];

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
    return billingCycle === 'yearly' ? '6,999' : '999';
  }
  return billingCycle === 'yearly' ? '5,999' : '699';
};

const getOriginalPrice = (billingCycle: 'monthly' | 'yearly') => {
  return billingCycle === 'yearly' ? '6,999' : '999';
};

export default function PricingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      unsubscribeUserDoc?.();

      if (!user) {
        setIsProUser(false);
        return;
      }

      unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setIsProUser(hasActiveProAccess(snapshot.data()));
        } else {
          // User document doesn't exist, create it
          setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            createdAt: new Date().toISOString(),
            isPro: false,
          }, { merge: true });
          setIsProUser(false);
        }
      });

      void user.getIdToken().then((token) =>
        fetch('/api/subscription-status', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => undefined),
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserDoc?.();
    };
  }, []);

  const initiateCheckout = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsProcessingPayment(true);

    await initiateProSubscription({
      currentUser,
      billingCycle,
      onSuccess: (message) => alert(message),
      onError: (message) => alert(message),
    });

    setIsProcessingPayment(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 md:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-black text-xs text-teal-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">CAI</span>
            <span className="text-lg font-black tracking-wide">Circuit<span className="text-teal-300">AI</span></span>
          </Link>
          <div className="hidden items-center gap-6 text-xs font-bold text-zinc-500 md:flex">
            <Link href="/features" className="hover:text-teal-300 transition">Features</Link>
            <Link href="/pricing" className="text-teal-300">Pricing</Link>
            <Link href="/dashboard" className="hover:text-teal-300 transition">Dashboard</Link>
            <Link href="/workspace" className="hover:text-teal-300 transition">Workspace</Link>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-teal-300 transition"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/workspace" className="hidden h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase items-center gap-2 transition md:flex">
            Open App <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-4">
            <Link href="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-zinc-400 hover:text-teal-300 transition">Features</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-zinc-400 hover:text-teal-300 transition">Pricing</Link>
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-zinc-400 hover:text-teal-300 transition">Dashboard</Link>
            <Link href="/workspace" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-zinc-400 hover:text-teal-300 transition">Workspace</Link>
            <Link href="/workspace" onClick={() => setIsMobileMenuOpen(false)} className="h-11 px-5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
              Open App <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </header>

      <section className="bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_34rem)] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          {isIndependenceDayOffer() && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-300 border border-orange-700/60 bg-orange-950/40 px-3 py-1.5 rounded-lg mb-4">
              <Sparkles className="h-4 w-4 fill-orange-300" />
              🇮🇳 80th Independence Day Special - Limited Time Offer!
            </div>
          )}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
            <Crown className="h-4 w-4 fill-teal-300" /> Premium
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-zinc-50 md:text-6xl">Choose the workspace for your robotics projects.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Free is enough to try CircuitAI. Pro is a subscription that unlocks serious student workflows: unlimited builds, unlimited saved history, reports, and advanced wiring.
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="mt-8 flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`text-xs sm:text-sm font-bold transition ${billingCycle === 'monthly' ? 'text-teal-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Monthly
            </button>
            <div className="h-6 w-11 rounded-full bg-zinc-800 relative cursor-pointer" onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-teal-300 transition-all ${billingCycle === 'monthly' ? 'left-1' : 'left-6'}`} />
            </div>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`text-xs sm:text-sm font-bold transition ${billingCycle === 'yearly' ? 'text-teal-300' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Yearly
            </button>
            {billingCycle === 'yearly' && (
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800 px-2 py-1 rounded-md">
                {isIndependenceDayOffer() ? 'Save 14%' : 'Save 42%'}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 md:px-8">
        <div className="mx-auto -mt-8 grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-5">
            <h2 className="text-xl font-black text-zinc-100">Free</h2>
            <p className="mt-2 text-sm text-zinc-500">For trying project generation.</p>
            <p className="mt-6 text-3xl font-black text-zinc-50">₹0</p>
            <div className="mt-6 space-y-2">
              {freeFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm text-zinc-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-teal-800/70 bg-teal-950/20 p-5 shadow-2xl lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-teal-100">CircuitAI Pro</h2>
                <p className="mt-2 text-sm text-teal-100/70">For students who need reports, revisions, and serious project history.</p>
                <div className="mt-4">
                  {isIndependenceDayOffer() && (
                    <p className="text-sm font-semibold text-zinc-500 line-through">
                      ₹{getOriginalPrice(billingCycle)}/{billingCycle === 'yearly' ? 'year' : 'month'}
                    </p>
                  )}
                  <p className="text-3xl font-black text-zinc-50">
                    ₹{getOfferPrice(billingCycle)}
                    <span className="text-base font-bold text-teal-100/70">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </p>
                  {isIndependenceDayOffer() && (
                    <p className="mt-1 text-xs font-semibold text-orange-300">
                      🇮🇳 Independence Day Special - Limited time offer!
                    </p>
                  )}
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-teal-200/80">
                    {billingCycle === 'yearly' ? 'One-time payment for 1 year access' : '2-day free trial, then billed monthly for 12 months'}
                  </p>
                </div>
              </div>

              <button type="button" onClick={initiateCheckout} disabled={isProcessingPayment || isProUser} className="h-11 px-5 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                {isProcessingPayment ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {isProUser ? 'Pro Active' : (billingCycle === 'yearly' ? 'Buy Now' : 'Start Pro Trial')}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2 rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 lg:col-span-3">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-black text-zinc-100 flex items-center gap-2"><Lock className="h-4 w-4 text-teal-300" /> Firebase Pro Status</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {authReady
                    ? currentUser
                      ? `Signed in as ${currentUser.email || currentUser.uid}. Firebase isPro = ${isProUser ? 'true' : 'false'}.`
                      : 'Sign in to check your Firebase Pro status.'
                    : 'Checking authentication status...'}
                </p>
              </div>

              <div className={`rounded-lg border px-4 py-3 text-sm font-black ${isProUser ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}>
                {isProUser ? 'Pro Active' : 'Pro Not Active'}
              </div>
            </div>

            {!currentUser && (
              <button type="button" onClick={() => setIsAuthModalOpen(true)} className="mt-4 h-10 px-4 bg-zinc-950 border border-zinc-800 hover:border-teal-800 text-zinc-300 hover:text-teal-300 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                <Sparkles className="h-4 w-4" /> Sign In To Check Status
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">
                Need help with refunds or billing? Contact us at{' '}
                <a href="mailto:support@circuitai.in" className="text-teal-400 hover:text-teal-300 underline">
                  support@circuitai.in
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} user={currentUser} />
    </main>
  );
}
