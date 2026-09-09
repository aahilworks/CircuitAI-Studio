'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, FileText, ShieldAlert } from 'lucide-react';

const terms = [
  {
    title: 'Use Of CircuitAI',
    body: 'CircuitAI helps students generate robotics project guidance, including parts lists, wiring plans, firmware, testing steps, and learning notes. By using the app, you agree to use the generated material responsibly.',
  },
  {
    title: 'AI Output Disclaimer',
    body: 'Generated robotics instructions may contain mistakes. You must verify wiring, code, current draw, battery handling, component ratings, and physical safety before building or powering hardware.',
  },
  {
    title: 'Student Safety',
    body: 'Do not use CircuitAI to build illegal, dangerous, weaponized, life-support, or critical infrastructure systems. Adult supervision is recommended for soldering, high-current motors, batteries, tools, and moving parts.',
  },
  {
    title: 'Your Projects',
    body: 'You own your prompts and may use, modify, and run generated code for personal, school, or learning projects. CircuitAI owns the app interface, product design, and service implementation.',
  },
  {
    title: 'Third-Party Services',
    body: 'CircuitAI uses external services such as Firebase, Gemini APIs, Razorpay, YouTube links, and component search links. Those services may have their own terms, privacy policies, and availability limits.',
  },
  {
    title: 'Pro Subscription Billing',
    body: 'CircuitAI Pro offers two billing options: Monthly at ₹699/month or Yearly at ₹5,999/year (save 14%). Monthly subscribers are billed monthly for up to 12 billing cycles unless cancelled. Yearly subscribers pay one-time for 1 year access. Failed payments or cancellation revoke Pro access immediately. Subscription status is managed server-side in Firebase. All subscription payments are non-refundable. Small verification charges used for payment validation will be refunded after successful verification. Users can cancel their subscription anytime from the dashboard.',
  },
  {
    title: 'Promotional Communications',
    body: 'By signing up for CircuitAI, you automatically agree to receive promotional emails about new features, updates, and offers. You can unsubscribe from these emails at any time by clicking the unsubscribe link in our emails or contacting us.',
  },
  {
    title: 'Account Termination',
    body: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, abuse the service, or violate safety guidelines. Pro access will be immediately revoked upon termination.',
  },
  {
    title: 'Data Privacy',
    body: 'Your project data, prompts, and account information are stored securely in Firebase. We do not sell your personal data to third parties. For detailed privacy practices, please refer to our Privacy Policy.',
  },
  {
    title: 'Service Availability',
    body: 'CircuitAI relies on third-party AI services (Gemini APIs) which may experience downtime, rate limits, or service interruptions. We do not guarantee 100% uptime or immediate response times.',
  },
  {
    title: 'No Warranty',
    body: 'CircuitAI is provided as-is and as-available. We do not guarantee that AI-generated electronics guidance will be accurate, safe, complete, or suitable for a specific project.',
  },
  {
    title: 'Limitation Of Liability',
    body: 'To the maximum extent permitted by law, CircuitAI is not liable for injury, hardware damage, property damage, data loss, fire, electrical hazards, or other losses resulting from use of generated project guidance.',
  },
  {
    title: 'Changes To Terms',
    body: 'We may update these terms as CircuitAI evolves. Continued use of the app after updates means you accept the updated terms.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 md:p-8 selection:bg-teal-500/30">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-teal-300 transition mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to CircuitAI
        </Link>

        <header className="border-b border-zinc-800 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
            <FileText className="h-4 w-4" /> Terms
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-zinc-50">Terms Of Service</h1>
          <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Clear rules for using CircuitAI to plan, build, test, and improve robotics projects.
          </p>
          <p className="mt-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Last updated: August 2026</p>
        </header>

        <section className="mb-4 bg-amber-950/20 border border-amber-900/60 p-5 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-amber-900/60 flex items-center justify-center text-amber-300 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-200">Always verify before powering hardware.</h2>
              <p className="mt-2 text-sm text-amber-100/80 leading-relaxed">
                Robotics projects can involve motors, batteries, heat, current spikes, moving parts, and sharp tools. Treat generated output as a starting point, not final engineering approval.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4">
          {terms.map((term, index) => (
            <section key={term.title} className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-teal-300 shrink-0">
                  {index === 2 ? <ShieldAlert className="h-5 w-5" /> : <span className="text-xs font-black">{index + 1}</span>}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">{term.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{term.body}</p>
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
        </footer>
      </div>
    </main>
  );
}
