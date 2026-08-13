'use client';

import Link from 'next/link';
import { ArrowLeft, Database, LockKeyhole, ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: 'Project Prompts',
    body: 'CircuitAI processes the project descriptions, board choices, and component details you enter so it can generate robotics project packs. These prompts are sent to the AI generation provider only for producing the requested output.',
    Icon: ShieldCheck,
  },
  {
    title: 'Saved Builds',
    body: 'When you sign in, generated projects are saved to your Firebase workspace so you can revisit code, wiring, assembly steps, tests, and troubleshooting notes later.',
    Icon: Database,
  },
  {
    title: 'External Services',
    body: 'CircuitAI can link to tutorial searches, component searches, Firebase authentication, Gemini generation, and Razorpay subscription billing. Those providers handle their own service logs and policies.',
    Icon: LockKeyhole,
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
            How CircuitAI handles prompts, saved robotics builds, account data, and third-party services.
          </p>
          <p className="mt-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Last updated: July 2026</p>
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
        </footer>
      </div>
    </main>
  );
}
