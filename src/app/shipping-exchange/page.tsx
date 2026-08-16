import Link from 'next/link';
import { ArrowLeft, Package, Truck } from 'lucide-react';

export default function ShippingExchangePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-teal-300 transition mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-black text-zinc-100 md:text-4xl">Shipping & Exchange Policy</h1>
          <p className="mt-2 text-sm text-zinc-400">Last updated: August 15, 2026</p>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-teal-300" />
              Digital Product - No Physical Shipping
            </h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>CircuitAI is a digital SaaS (Software as a Service) platform. All our services are delivered digitally:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Instant access to Pro features upon payment</li>
                <li>No physical products are shipped</li>
                <li>No shipping fees or delivery times</li>
                <li>Access is available 24/7 from anywhere in the world</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-teal-300" />
              Service Delivery
            </h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>How you receive your CircuitAI Pro access:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Immediate activation after successful payment</li>
                <li>Access through your CircuitAI account dashboard</li>
                <li>Email confirmation with subscription details</li>
                <li>No waiting period or processing delays</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Exchange Policy</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>Since CircuitAI is a digital service, traditional exchanges don't apply. However, we offer:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Plan changes:</strong> Switch between monthly and yearly billing cycles</li>
                <li><strong>Account transfers:</strong> Transfer your subscription to another account in special cases</li>
                <li><strong>Pause option:</strong> Pause your subscription (coming soon)</li>
                <li>Contact support for special requests</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Regional Availability</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>CircuitAI is available globally with no regional restrictions:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Available in all countries</li>
                <li>Multi-currency support through Razorpay</li>
                <li>Local payment methods where available</li>
                <li>No import duties or customs fees</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Technical Requirements</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>To use CircuitAI, you need:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Internet connection (broadband recommended)</li>
                <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Compatible device (desktop, tablet, or mobile)</li>
                <li>Valid email address for account registration</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Questions?</h2>
            <p className="text-sm text-zinc-300">
              If you have any questions about service delivery or need special accommodations, please contact us at{' '}
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
