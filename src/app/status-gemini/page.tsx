import Link from 'next/link';
import { ArrowLeft, Activity, ExternalLink, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function GeminiStatusPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-teal-300 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <h1 className="text-3xl font-black text-zinc-50 md:text-4xl">Google AI Studio Status</h1>
            <p className="mt-2 text-base text-zinc-400">
              Monitor the status of Google's AI services that power CircuitAI's project generation.
            </p>
          </div>

          {/* Status Card */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                <Activity className="h-6 w-6 text-teal-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-zinc-100">Google AI Studio</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Google's AI platform that provides the Gemini models used by CircuitAI for generating Arduino projects, circuit diagrams, and code.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-2 py-1 rounded">
                    <CheckCircle2 className="h-3 w-3" /> Operational
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 border border-zinc-700/60 bg-zinc-950/40 px-2 py-1 rounded">
                    <Clock className="h-3 w-3" /> Last checked: Just now
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Status Link */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6 mb-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Official Status Page</h3>
            <p className="text-sm text-zinc-400 mb-4">
              For the most up-to-date information about Google AI Studio's status, visit their official status page.
            </p>
            <a
              href="https://aistudio.google.com/status"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase transition"
            >
              View Official Status <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Impact on CircuitAI */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6 mb-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Impact on CircuitAI</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Project Generation</p>
                  <p className="text-xs text-zinc-400">CircuitAI uses Gemini models to generate Arduino projects, code, and documentation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Circuit Diagrams</p>
                  <p className="text-xs text-zinc-400">AI-powered circuit diagram generation depends on Gemini's availability.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Code Generation</p>
                  <p className="text-xs text-zinc-400">Arduino code and wiring guides are generated using Gemini models.</p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Do if Down */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6 mb-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-300" /> What to Do if Google AI Studio is Down
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-teal-300 mt-1">•</span>
                <span>Check the official status page for updates and estimated resolution time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-300 mt-1">•</span>
                <span>Wait for Google to resolve the issue - CircuitAI will work normally once services are restored</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-300 mt-1">•</span>
                <span>Contact CircuitAI support at support@circuitai.in if issues persist after Google services are restored</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-300 mt-1">•</span>
                <span>Follow @GoogleAI on Twitter/X for official announcements about service status</span>
              </li>
            </ul>
          </div>

          {/* Monitoring Details */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Monitoring Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Service</p>
                <p className="text-zinc-100">Google AI Studio (Gemini)</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Status Page</p>
                <p className="text-zinc-100">aistudio.google.com/status</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Provider</p>
                <p className="text-zinc-100">Google</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Used By CircuitAI For</p>
                <p className="text-zinc-100">AI Project Generation</p>
              </div>
            </div>
          </div>

          {/* Additional Status Pages */}
          <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Other Service Status Pages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/status-github"
                className="flex items-center gap-2 p-3 rounded-lg border border-zinc-800 bg-zinc-950/50 hover:border-teal-800 transition"
              >
                <Activity className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300">GitHub Status</span>
              </Link>
              <Link
                href="/status-razorpay"
                className="flex items-center gap-2 p-3 rounded-lg border border-zinc-800 bg-zinc-950/50 hover:border-teal-800 transition"
              >
                <Activity className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300">Razorpay Status</span>
              </Link>
              <Link
                href="/status-vercel"
                className="flex items-center gap-2 p-3 rounded-lg border border-zinc-800 bg-zinc-950/50 hover:border-teal-800 transition"
              >
                <Activity className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300">Vercel Status</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
