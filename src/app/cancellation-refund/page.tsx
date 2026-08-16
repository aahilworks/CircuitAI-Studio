import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function CancellationRefundPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-teal-300 transition mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-black text-zinc-100 md:text-4xl">Cancellation & Refund Policy</h1>
          <p className="mt-2 text-sm text-zinc-400">Last updated: August 15, 2026</p>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2 mb-4">
              <RefreshCw className="h-5 w-5 text-teal-300" />
              Subscription Cancellation
            </h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>You can cancel your CircuitAI Pro subscription at any time through your dashboard.</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Monthly subscriptions: Cancel anytime, access continues until billing period ends</li>
                <li>Yearly one-time payments: No cancellation needed, access lasts for 1 year from purchase</li>
                <li>No cancellation fees or penalties</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-teal-300" />
              Refund Policy
            </h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>We want you to be satisfied with CircuitAI Pro. Here's our refund policy:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>7-day refund window:</strong> Request a refund within 7 days of purchase if you're not satisfied</li>
                <li><strong>Monthly subscriptions:</strong> Refund for the current billing period only</li>
                <li><strong>Yearly one-time payments:</strong> Pro-rated refund based on remaining time</li>
                <li><strong>No refunds after 7 days:</strong> Except in cases of technical issues or service failures</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">How to Request a Refund</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>To request a cancellation or refund, contact our support team:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Email: <a href="mailto:support@circuitai.in" className="text-teal-400 hover:text-teal-300 underline">support@circuitai.in</a></li>
                <li>Include your account email and subscription details</li>
                <li>State the reason for your refund request</li>
                <li>Refunds are processed within 5-7 business days</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Exceptions</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>We may issue refunds beyond the 7-day window in cases of:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Technical issues preventing use of the service</li>
                <li>Billing errors or unauthorized charges</li>
                <li>Service downtime exceeding 24 hours</li>
                <li>Other exceptional circumstances at our discretion</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Questions?</h2>
            <p className="text-sm text-zinc-300">
              If you have any questions about our cancellation or refund policy, please contact us at{' '}
              <a href="mailto:support@circuitai.in" className="text-teal-400 hover:text-teal-300 underline">
                support@circuitai.in
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
