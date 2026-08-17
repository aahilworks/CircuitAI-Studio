'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Cable, CheckCircle2, Code2, Crown, FileText, GraduationCap, Menu, PlayCircle, ShieldAlert, ShoppingCart, Wrench, X } from 'lucide-react';

const featureGroups = [
  {
    title: 'AI Project Generation',
    features: [
      'Student-friendly robotics project packs with AI',
      'Arduino, ESP32, Pico, NodeMCU, and custom board prompts',
      'Arduino firmware, wiring diagrams, BOM, tools, and safety notes',
      'Smart parts list with price ranges and alternatives for Indian students',
      'Modify existing Arduino projects without starting again',
    ],
    Icon: Bot,
  },
  {
    title: 'Circuit Diagram & Wiring',
    features: [
      'Pin-by-pin Arduino wiring lists',
      'Advanced visual circuit diagram for Pro users',
      'Assembly routine with beginner-safe steps for electronics projects',
      'Board-specific Arduino code upload guide',
      'Troubleshooting and calibration checklist for robotics',
    ],
    Icon: Cable,
  },
  {
    title: 'Arduino Upload & Simulation',
    features: [
      'Arduino IDE setup, board package, and library checklist',
      'Common Arduino upload errors and fixes',
      'Premium simulation lab with inputs and outputs for robotics',
      'Expected behavior before powering hardware',
    ],
    Icon: PlayCircle,
  },
  {
    title: 'Parts Shopping Guide',
    features: [
      'Quantity-based bill of materials for Arduino projects',
      'Estimated student-market price ranges in India',
      'Buying tips for each electronics component',
      'Alternative compatible components for Arduino',
    ],
    Icon: ShoppingCart,
  },
  {
    title: 'STEM Education & Reports',
    features: [
      'Learning goals for every robotics project',
      'Teacher report mode with abstract and conclusion for STEM',
      'Viva questions for presentation practice',
      'Marking rubric for teachers',
      'PDF / print report export for Pro users',
    ],
    Icon: GraduationCap,
  },
  {
    title: 'Pro Features for Students',
    features: [
      'Timed viva practice quiz with scoring for Indian students',
      'Presentation slides with speaker notes',
      'School-ready teacher reports for STEM education',
      'Unlimited AI generations and modifications for Arduino projects',
      'Unlimited saved project history for robotics learning',
    ],
    Icon: Crown,
  },
  {
    title: 'Robotics Workspace',
    features: [
      'Firebase sign-in required for saved Arduino projects',
      'Saved robotics project history with search and board filters',
      'Free and Pro usage limits for STEM education',
      'Pro monthly subscription via Razorpay for Indian students',
      'Pro status synced live from Firebase',
    ],
    Icon: Wrench,
  },
];

export default function FeaturesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 md:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-black text-xs text-teal-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">CAI</span>
            <span className="text-lg font-black tracking-wide">Circuit<span className="text-teal-300">AI</span></span>
          </Link>
          <div className="hidden items-center gap-6 text-xs font-bold text-zinc-500 md:flex">
            <Link href="/features" className="text-teal-300">Features</Link>
            <Link href="/pricing" className="hover:text-teal-300 transition">Pricing</Link>
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
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
            <Code2 className="h-4 w-4" /> Features
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-zinc-50 md:text-6xl">Complete Arduino robotics project features for Indian students. Best STEM education tool.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            CircuitAI is the best Arduino project maker online with AI-powered features for Indian students. Generate Arduino code, circuit diagrams, wiring guides, and complete robotics projects. Perfect for STEM education, robotics for beginners, and electronics projects.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
          {featureGroups.map(({ title, features, Icon }) => (
            <article key={title} className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-teal-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black text-zinc-100">{title}</h2>
              </div>
              <div className="mt-5 space-y-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-800 px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-5">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
            <h2 className="mt-4 text-sm font-black text-amber-200">Safety First</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/80">Generated outputs include safeguards, but students must verify wiring and power before running physical hardware.</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 lg:col-span-2">
            <FileText className="h-5 w-5 text-teal-300" />
            <h2 className="mt-4 text-sm font-black text-zinc-100">Built For Submissions</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">Pro report mode helps turn technical project output into a format students can submit or present.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
