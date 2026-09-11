'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Bot, Crown, MessageCircle, RefreshCw, Send, X } from 'lucide-react';
import { hasActiveProAccess } from '@/lib/proAccess';

interface ActiveProjectSnapshot {
  activeTab?: string;
  projectData?: unknown;
}

interface AskResponse {
  answer?: string;
  error?: string;
  message?: string;
}

const PROJECT_STORAGE_KEY = 'circuitai-active-project';

function readActiveProject(): ActiveProjectSnapshot | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(PROJECT_STORAGE_KEY);
    return raw ? JSON.parse(raw) as ActiveProjectSnapshot : null;
  } catch {
    return null;
  }
}

export default function CircuitAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [activeProject, setActiveProject] = useState<ActiveProjectSnapshot | null>(null);
  const [scope, setScope] = useState<'general' | 'project'>('general');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const hasProject = !!activeProject?.projectData;
  const canUseProjectTutor = hasProject && isProUser;

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      unsubscribeUserDoc?.();

      if (!user) {
        setIsProUser(false);
        return;
      }

      unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
        setIsProUser(snapshot.exists() ? hasActiveProAccess(snapshot.data()) : false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserDoc?.();
    };
  }, []);

  useEffect(() => {
    const syncProject = () => {
      setActiveProject(readActiveProject());
    };

    syncProject();
    window.addEventListener('storage', syncProject);
    window.addEventListener('circuitai-active-project', syncProject);
    return () => {
      window.removeEventListener('storage', syncProject);
      window.removeEventListener('circuitai-active-project', syncProject);
    };
  }, []);

  useEffect(() => {
    if (scope === 'project' && !canUseProjectTutor) {
      setScope('general');
    }
  }, [canUseProjectTutor, scope]);

  const askCircuitAI = async (event: FormEvent) => {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;

    if (!currentUser) {
      setAnswer('Please sign in to ask CircuitAI. General questions are free after sign in.');
      setIsOpen(true);
      return;
    }

    if (scope === 'project' && !canUseProjectTutor) {
      setAnswer('Project-aware answers are a Pro feature. You can still ask general CircuitAI questions for free.');
      return;
    }

    setLoading(true);
    setAnswer('');

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: cleanQuestion,
          scope,
          activeTab: activeProject?.activeTab,
          projectData: scope === 'project' ? activeProject?.projectData : null,
        }),
      });

      const payload = await response.json().catch(() => ({})) as AskResponse;
      if (!response.ok) {
        throw new Error(payload.message || payload.error || 'CircuitAI could not answer right now.');
      }

      setAnswer(payload.answer || 'CircuitAI did not return an answer. Try asking again.');
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'CircuitAI could not answer right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {isOpen && (
        <section className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-teal-300" />
              <div>
                <h2 className="text-sm font-black">Ask CircuitAI</h2>
                <p className="text-[11px] text-zinc-500">{canUseProjectTutor ? 'General and project tutor' : 'General tutor'}</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100" aria-label="Close CircuitAI assistant">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('general')}
                className={`h-9 rounded-md border text-xs font-bold transition ${scope === 'general' ? 'border-teal-700 bg-teal-950/50 text-teal-300' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
              >
                CircuitAI
              </button>
              <button
                type="button"
                onClick={() => setScope('project')}
                disabled={!canUseProjectTutor}
                className={`h-9 rounded-md border text-xs font-bold transition ${scope === 'project' ? 'border-teal-700 bg-teal-950/50 text-teal-300' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300'} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Project
              </button>
            </div>

            {hasProject && !isProUser && (
              <div className="rounded-lg border border-amber-800/70 bg-amber-950/30 p-3 text-xs text-amber-100">
                <div className="flex items-center gap-2 font-bold">
                  <Crown className="h-3.5 w-3.5" /> Project tutor is Pro
                </div>
                <p className="mt-1 text-amber-100/80">Free users can ask general CircuitAI questions here.</p>
              </div>
            )}

            {!authReady || !currentUser ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
                <p>Sign in to ask CircuitAI. General questions are free, and project-aware answers unlock with Pro.</p>
                <Link href="/workspace" className="mt-3 inline-flex h-9 items-center rounded-md bg-teal-600 px-3 text-xs font-bold uppercase text-white hover:bg-teal-500">
                  Open Workspace
                </Link>
              </div>
            ) : (
              <form onSubmit={askCircuitAI} className="space-y-3">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={scope === 'project' ? 'Ask about this project code, wiring, parts, safety...' : 'Ask about CircuitAI, Pro, limits, teacher mode...'}
                  className="min-h-24 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-teal-500 focus:outline-none"
                />
                <button type="submit" disabled={loading || !question.trim()} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 text-xs font-bold uppercase text-white hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-500">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Ask
                </button>
              </form>
            )}

            {(answer || loading) && (
              <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm leading-relaxed text-zinc-300">
                {loading ? 'CircuitAI is thinking...' : answer}
              </div>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-700 bg-teal-600 text-white shadow-2xl shadow-teal-950/60 transition hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        aria-label="Open CircuitAI assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
