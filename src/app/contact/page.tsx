import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-teal-300 transition mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-black text-zinc-100 md:text-4xl">Contact Us</h1>
          <p className="mt-2 text-sm text-zinc-400">We're here to help with any questions or issues.</p>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-teal-300" />
              Email Support
            </h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>For all inquiries, refunds, billing issues, or technical support:</p>
              <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                <a href="mailto:techokids123@gmail.com" className="text-teal-400 hover:text-teal-300 underline text-lg font-bold">
                  techokids123@gmail.com
                </a>
              </div>
              <p className="text-xs text-zinc-500">We typically respond within 24-48 hours on business days.</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-teal-300" />
              What We Can Help With
            </h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Subscription and billing questions</li>
                <li>Refund requests and cancellations</li>
                <li>Technical issues with CircuitAI features</li>
                <li>Account access and login problems</li>
                <li>Feature requests and feedback</li>
                <li>Partnership and business inquiries</li>
                <li>Bug reports and error troubleshooting</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-teal-300" />
              Response Times
            </h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>General inquiries:</strong> 24-48 hours</li>
                <li><strong>Billing and refunds:</strong> 24-48 hours</li>
                <li><strong>Technical support:</strong> 24-72 hours</li>
                <li><strong>Urgent issues:</strong> Mark as urgent in subject line</li>
              </ul>
              <p className="text-xs text-zinc-500 mt-2">Response times may be longer during holidays or weekends.</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Before Contacting Us</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>Please check these resources first - they may have the answer you need:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><Link href="/pricing" className="text-teal-400 hover:text-teal-300 underline">Pricing page</Link> - For subscription plans and features</li>
                <li><Link href="/cancellation-refund" className="text-teal-400 hover:text-teal-300 underline">Cancellation & Refund Policy</Link> - For refund information</li>
                <li><Link href="/dashboard" className="text-teal-400 hover:text-teal-300 underline">Dashboard</Link> - For managing your subscription</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h2 className="text-lg font-black text-zinc-100 mb-4">Tips for Faster Response</h2>
            <div className="space-y-3 text-sm text-zinc-300">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Include your account email address</li>
                <li>Describe your issue clearly and concisely</li>
                <li>Include screenshots if applicable</li>
                <li>For technical issues, mention your browser and device</li>
                <li>Use a descriptive subject line</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
