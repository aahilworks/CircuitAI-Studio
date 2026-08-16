'use client';

import Link from 'next/link';
import { ArrowLeft, Database, LockKeyhole, ShieldCheck, User, CreditCard, Server, Eye } from 'lucide-react';

const sections = [
  {
    title: 'Data Collection Disclosure',
    body: 'We collect the following types of data: Personal Information (name, email address, phone number if provided), Account Information (unique user identifier UID, display name), Financial Information (subscription plan type, billing cycle, payment status, transaction IDs), and Project Data (prompts, generated robotics projects). Financial data is collected securely during checkout through our payment gateway.',
    Icon: User,
  },
  {
    title: 'Third-Party Sharing',
    body: 'Payment data is shared with partner banks (e.g., Axis Bank) and payment gateways (e.g., Razorpay) strictly to process transactions. We share data only with necessary service providers: Firebase (authentication & database), Razorpay (payment processing), Axis Bank (transaction processing), and AI generation providers (for project generation). We do NOT sell your data to third parties or share data for advertising purposes.',
    Icon: ShieldCheck,
  },
  {
    title: 'Security Measures',
    body: 'All transactions are encrypted and secured using industry standards. Payment processing is PCI-DSS compliant via Razorpay payment gateway. We do NOT store sensitive card data (CVV, full card numbers) locally - it is handled securely by the payment gateway. All data is encrypted in transit using HTTPS/TLS. Firebase provides encryption at rest for database storage. We implement access controls and regular security audits.',
    Icon: LockKeyhole,
  },
  {
    title: 'Information We Collect',
    body: 'Financial data is collected securely during checkout. We collect subscription plan type (monthly/yearly), billing cycle, payment status, and transaction IDs. We do NOT collect or store credit card numbers, CVV codes, or complete banking information. Razorpay securely processes payments and only shares transaction confirmation with us.',
    Icon: CreditCard,
  },
  {
    title: 'How We Use Information',
    body: 'Data is used exclusively to fulfill orders, process payments through Axis Bank / Razorpay, and meet legal obligations. Personal data enables account authentication, subscription management, and service delivery. Financial data enables billing processing, subscription activation, and refund handling. Project data is stored to provide saved workspace functionality.',
    Icon: Database,
  },
  {
    title: 'Data Security',
    body: 'Our site does not store sensitive card data (CVV, full card numbers) locally. All sensitive payment information is handled securely by the payment gateway (Razorpay) in compliance with PCI-DSS standards. Only transaction confirmation data is stored in our systems for subscription management and legal compliance.',
    Icon: Server,
  },
  {
    title: 'User Consent & Rights',
    body: 'You can opt-out of data collection by deleting your account. You have the right to request data deletion by contacting us at techokids123@gmail.com. You can access, correct, or export your personal data from your dashboard. For questions about your financial data or to exercise your rights, contact our support team. Account deletion removes your personal data from our systems.',
    Icon: Eye,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 md:p-8 selection:bg-teal-500/30">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-teal-300 transition mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to CircuitAI
        </Link>

        <header className="border-b border-zinc-800 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="h-4 w-4" /> Privacy
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-zinc-50">Privacy Policy</h1>
          <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Comprehensive information about personal and financial data collection, purpose, security, and sharing practices.
          </p>
          <p className="mt-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Last updated: August 16, 2026</p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {sections.map(({ title, body, Icon }) => (
            <section key={title} className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-teal-300 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">{title}</h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-600">
          <p>&copy; 2026 CircuitAI. All rights reserved.</p>
          <p className="mt-2">
            Founder & Developer:{' '}
            <a href="https://aahilworks.github.io" target="_blank" rel="noopener noreferrer" className="text-teal-300 hover:text-teal-200 transition">
              AahilWorks
            </a>
          </p>
          <p className="mt-4">
            Questions about privacy? Contact us at{' '}
            <a href="mailto:techokids123@gmail.com" className="text-teal-300 hover:text-teal-200 underline">
              techokids123@gmail.com
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
