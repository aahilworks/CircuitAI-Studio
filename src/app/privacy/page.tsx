'use client';

import Link from 'next/link';
import { ArrowLeft, Database, LockKeyhole, ShieldCheck, User, CreditCard, Server, Eye } from 'lucide-react';

const sections = [
  {
    title: 'Personal Data We Collect',
    body: 'We collect your email address, display name (optional), and unique user identifier (UID) when you create an account. This data is used for authentication, account management, and to provide personalized service. Your email is used for account verification, subscription notifications, and support communications.',
    Icon: User,
  },
  {
    title: 'Financial Data We Collect',
    body: 'Payment processing is handled by Razorpay. We collect subscription plan type (monthly/yearly), billing cycle, payment status, and transaction IDs. We do NOT store your credit card numbers, bank details, or complete payment information. Razorpay securely processes payments and only shares transaction confirmation with us.',
    Icon: CreditCard,
  },
  {
    title: 'Purpose of Data Collection',
    body: 'Personal data enables account authentication, subscription management, and service delivery. Financial data enables billing processing, subscription activation, and refund handling. Project data (prompts, generated content) is stored to provide saved workspace functionality and improve service quality.',
    Icon: Database,
  },
  {
    title: 'Data Security Measures',
    body: 'All data is encrypted in transit using HTTPS/TLS. Firebase provides encryption at rest for database storage. Payment data is processed through Razorpay\'s PCI-DSS compliant infrastructure. We implement access controls, regular security audits, and follow industry best practices to protect your information.',
    Icon: LockKeyhole,
  },
  {
    title: 'Data Sharing Practices',
    body: 'We share data only with necessary service providers: Firebase (authentication & database), Razorpay (payment processing), and AI generation providers (for project generation). We do NOT sell your data to third parties. We do NOT share data for advertising purposes. Service providers have strict data protection obligations.',
    Icon: ShieldCheck,
  },
  {
    title: 'External Services',
    body: 'CircuitAI integrates with Firebase (authentication & database), Razorpay (payment processing), and AI generation providers (for project creation). Each provider has independent privacy policies. We only share the minimum data required for these services to function.',
    Icon: Server,
  },
  {
    title: 'Your Data Rights',
    body: 'You have the right to access, correct, or delete your personal data. You can export your project data from the dashboard. Account deletion removes your personal data from our systems. Financial records are retained for legal compliance but payment details are not stored.',
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
