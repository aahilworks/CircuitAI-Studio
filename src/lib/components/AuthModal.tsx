'use client';

import { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { Globe, LogIn, LogOut, UserPlus, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message.replace('Firebase: ', '') : String(error);

export default function AuthModal({ isOpen, onClose, user }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-lg p-6 relative text-zinc-200 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 transition" aria-label="Close sign in dialog">
          <X className="h-4 w-4" />
        </button>

        {user ? (
          <div className="space-y-5 py-2">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
                <LogIn className="h-4 w-4" /> Signed in
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-zinc-50">Your workspace is connected.</h2>
              <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
            </div>

            <button type="button" onClick={() => { void signOut(auth); onClose(); }} className="w-full h-11 bg-red-950/40 border border-red-900/70 text-red-200 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-900/30 transition">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
                {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {isSignUp ? 'Create account' : 'Sign in'}
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-zinc-50">
                {isSignUp ? 'Start saving your builds.' : 'Continue your robotics workspace.'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Save project history, revise generated builds, and keep your firmware, wiring, and test plans together.
              </p>
            </div>

            {error && <p className="text-xs text-red-200 bg-red-950/30 p-3 rounded-lg border border-red-900/60">{error}</p>}

            <button type="button" disabled={loading} onClick={handleGoogleSignIn} className="w-full h-11 bg-zinc-950 border border-zinc-800 hover:border-teal-700 text-zinc-200 font-bold text-xs uppercase tracking-wide rounded-lg flex items-center justify-center gap-2.5 transition disabled:opacity-50">
              <Globe className="h-4 w-4 text-teal-300" /> Continue with Google
            </button>

            <div className="flex items-center text-zinc-700 text-[10px] font-bold tracking-widest uppercase">
              <div className="flex-1 border-t border-zinc-800" />
              <span className="px-3">or</span>
              <div className="flex-1 border-t border-zinc-800" />
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase text-zinc-500 font-bold mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm focus:outline-none focus:border-teal-500 text-zinc-100" />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-zinc-500 font-bold mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm focus:outline-none focus:border-teal-500 text-zinc-100" />
              </div>
              <button type="submit" disabled={loading} className="w-full h-11 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wide rounded-lg transition disabled:opacity-50">
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p className="text-xs text-center text-zinc-500 pt-1">
              {isSignUp ? 'Already have an account?' : 'New to CircuitAI?'}{' '}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-teal-300 underline hover:text-teal-200 transition">
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
