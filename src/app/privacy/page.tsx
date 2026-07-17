'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowLeft, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation back to Main Application */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="h-4 w-4" /> BACK TO WORKSPACE
          </Link>
        </div>

        {/* Header Block */}
        <header className="border-b border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Privacy Policy Configuration
            </h1>
          </div>
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Last Updated: July 2026 • Operational Security Standards
          </p>
        </header>

        {/* Policy Text Structure */}
        <div className="space-y-6 text-sm text-slate-400 leading-relaxed font-sans">
          
          <section className="bg-slate-900/40 border border-slate-900 p-5 rounded-xl">
            <h4 className="font-mono font-bold text-slate-200 uppercase tracking-wide mb-2 text-xs text-emerald-400">1. Prompt Vector Processing</h4>
            <p>CircuitAI Studio processes your structural text prompts and component specifications strictly to compile architecture schemas and synthesize microcontroller code strings. Prompt vectors are passed securely to runtime AI processing endpoints and are not stored permanently on external clusters.</p>
          </section>

          <section className="bg-slate-900/40 border border-slate-900 p-5 rounded-xl">
            <h4 className="font-mono font-bold text-slate-200 uppercase tracking-wide mb-2 text-xs text-emerald-400">2. Local Storage Sandbox</h4>
            <p>Your active workspace parameters, diagnostic refinement chat history logs, and compile-module strings are handled completely within your active browser runtime cache memory. We do not keep remote databases or logs tracking your proprietary code scripts.</p>
          </section>

          <section className="bg-slate-900/40 border border-slate-900 p-5 rounded-xl">
            <h4 className="font-mono font-bold text-slate-200 uppercase tracking-wide mb-2 text-xs text-emerald-400">3. External Reference Connections</h4>
            <p>Our application layout sections anchor links out to public reference tutorial indices (such as YouTube videos) or component search setups. Interaction data captured beyond our domain falls entirely under the terms and privacy frameworks of those separate providers.</p>
          </section>

        </div>

        {/* Footer info element */}
        <footer className="mt-12 pt-6 border-t border-slate-900 text-center font-mono text-[10px] text-slate-600 tracking-wider">
          <p>&copy; 2026 CircuitAI Studio. All rights reserved.</p>
        </footer>

      </div>
    </main>
  );
}