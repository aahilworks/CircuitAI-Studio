'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Cable, CheckCircle2, Crown, FileText, GraduationCap, Menu, Sparkles, X } from 'lucide-react';

const highlights = [
  {
    title: 'AI Project Packs',
    body: 'Generate Arduino firmware, BOM, wiring diagrams, safety notes, testing steps, and troubleshooting from one robotics idea. Best AI project generator for Arduino projects.',
    Icon: Sparkles,
  },
  {
    title: 'Pro Reports & Quiz',
    body: 'School-ready documentation with timed viva practice, presentation slides, and teacher reports for Pro users. Perfect for STEM education.',
    Icon: GraduationCap,
  },
  {
    title: 'Wiring Help',
    body: 'Move from pin lists to cleaner wiring guidance and visual circuit diagrams for Pro workspaces. Best circuit diagram generator for electronics projects.',
    Icon: Cable,
  },
];

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 md:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-black text-xs text-teal-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">CAI</span>
            <span className="text-lg font-black tracking-wide">Circuit<span className="text-teal-300">AI</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 text-xs font-bold text-zinc-500 md:flex">
            <Link href="/features" className="hover:text-teal-300 transition">Features</Link>
            <Link href="/pricing" className="hover:text-teal-300 transition">Pricing</Link>
            <Link href="/dashboard" className="hover:text-teal-300 transition">Dashboard</Link>
            <Link href="/workspace" className="hover:text-teal-300 transition">Workspace</Link>
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
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

      <section className="bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_34rem)] px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
              <GraduationCap className="h-4 w-4" /> AI-Powered Arduino Project Generator for Students
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-zinc-50 md:text-6xl">
              Build Arduino robotics projects faster with AI. Best STEM education tool for students worldwide.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
              CircuitAI is the best Arduino project maker online for students. Generate complete robotics projects with AI-powered circuit diagrams, Arduino code, wiring guides, and documentation. Perfect for STEM education, robotics for beginners, and electronics projects. Your ultimate robotics learning platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/workspace" className="h-11 px-5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                Start Building <Sparkles className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="h-11 px-5 bg-zinc-900 border border-zinc-800 hover:border-teal-800 text-zinc-300 hover:text-teal-300 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                Pro Subscription <Crown className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Example Build</p>
                <h2 className="mt-3 text-xl font-black text-zinc-100">Bluetooth Line Follower Robot</h2>
                <div className="mt-4 space-y-2 text-xs text-zinc-400">
                  {['Arduino firmware', 'Pin-by-pin wiring', 'BOM and tools', 'Testing checklist', 'Teacher report'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
          {highlights.map(({ title, body, Icon }) => (
            <article key={title} className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <Icon className="h-5 w-5 text-teal-300" />
              <h2 className="mt-4 text-sm font-black text-zinc-100">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-4 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          &copy; 2026 <span className="text-zinc-300 font-bold">CircuitAI</span>. Founder & Developer:{' '}
          <a href="https://aahilworks.github.io" target="_blank" rel="noopener noreferrer" className="text-teal-300 hover:text-teal-200 transition">AahilWorks</a>
        </div>
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <Link href="/terms" className="hover:text-teal-300 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-teal-300 transition">Privacy</Link>
          <Link href="/cancellation-refund" className="hover:text-teal-300 transition">Cancellation & Refund</Link>
          <Link href="/shipping-exchange" className="hover:text-teal-300 transition">Shipping & Exchange</Link>
          <Link href="/contact" className="hover:text-teal-300 transition">Contact</Link>
          <Link href="/faq" className="hover:text-teal-300 transition">FAQ</Link>
          <Link href="/status-github" className="hover:text-teal-300 transition">GitHub Status</Link>
          <Link href="/status-razorpay" className="hover:text-teal-300 transition">Payment Gateway Status</Link>
          <Link href="/status-vercel" className="hover:text-teal-300 transition">Hosting Status</Link>
        </div>
      </footer>
    </main>
  );
}
