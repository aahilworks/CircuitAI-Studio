import Link from 'next/link';
import { ArrowLeft, CreditCard, Activity, ExternalLink } from 'lucide-react';

export default function RazorpayStatusPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-teal-300 transition mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-black text-zinc-100 md:text-4xl flex items-center gap-3">
            <CreditCard className="h-8 w-8" /> Payment Gateway Status
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Monitor Razorpay payment gateway availability and incidents</p>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-teal-300" />
              Official Status Page
            </h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>For the most up-to-date information about Razorpay's service status, visit their official status page:</p>
              <a 
                href="https://status.razorpay.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-950 rounded-lg p-4 border border-zinc-800 text-teal-400 hover:text-teal-300 hover:border-teal-800 transition"
              >
                <span className="text-lg font-bold">status.razorpay.com</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">What This Monitors</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>Razorpay status monitors the availability of:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Payment processing (cards, UPI, wallets)</li>
                <li>Subscription management</li>
                <li>Payment gateway API</li>
                <li>Webhook delivery</li>
                <li>Dashboard access</li>
                <li>Refund processing</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Impact on CircuitAI</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>Razorpay outages may affect:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>New subscription purchases</li>
                <li>Payment processing for upgrades</li>
                <li>Automatic subscription renewals</li>
                <li>Refund processing</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Quick Reference</h2>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span>Status Page:</span>
                <a href="https://status.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">status.razorpay.com</a>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span>API Documentation:</span>
                <a href="https://razorpay.com/docs/api" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">API Docs</a>
              </div>
              <div className="flex justify-between py-2">
                <span>Support:</span>
                <a href="mailto:support@razorpay.com" className="text-teal-400 hover:text-teal-300 underline">support@razorpay.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
