'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, sendEmailVerification } from 'firebase/auth';
import { Globe, LogIn, LogOut, UserPlus, X, Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message.replace('Firebase: ', '') : String(error);

export default function AuthModal({ isOpen, onClose, user }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecaptcha();
    }
  }, [isOpen]);

  const executeRecaptcha = async (): Promise<string> => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action: 'submit' })
          .then(resolve)
          .catch(reject);
      });
    });
  };

  const verifyRecaptcha = async (token: string) => {
    const response = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error('reCAPTCHA verification failed');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await executeRecaptcha();
      await verifyRecaptcha(token);

      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Send email verification
        await sendEmailVerification(userCredential.user);
        alert('Account created! Please check your email to verify your account.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      onClose();
      resetForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await executeRecaptcha();
      await verifyRecaptcha(token);

      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setError('');
      alert('Password reset email sent. Please check your inbox.');
      setAuthMode('login');
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
      resetForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
  };

  if (!isOpen) return null;

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

            {!user.emailVerified && (
              <div className="bg-amber-950/30 border border-amber-700/60 rounded-lg p-3">
                <p className="text-xs text-amber-200 mb-2">Your email is not verified. Please verify your email to access all features.</p>
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      await fetch('/api/resend-verification', { method: 'POST' });
                      alert('Verification email sent! Please check your inbox.');
                    } catch (err) {
                      alert('Failed to send verification email. Please try again.');
                    }
                  }}
                  className="w-full h-9 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wide rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Mail className="h-3.5 w-3.5" /> Resend Verification Email
                </button>
              </div>
            )}

            <button type="button" onClick={() => { void signOut(auth); onClose(); }} className="w-full h-11 bg-red-950/40 border border-red-900/70 text-red-200 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-900/30 transition">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {authMode === 'forgot-password' ? (
              <>
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
                    <Lock className="h-4 w-4" /> Reset Password
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-zinc-50">Forgot your password?</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {error && <p className="text-xs text-red-200 bg-red-950/30 p-3 rounded-lg border border-red-900/60">{error}</p>}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase text-zinc-500 font-bold mb-1.5">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm focus:outline-none focus:border-teal-500 text-zinc-100" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-11 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wide rounded-lg transition disabled:opacity-50">
                    {loading ? 'Please wait...' : 'Send Reset Link'}
                  </button>
                </form>

                <p className="text-xs text-center text-zinc-500 pt-1">
                  Remember your password?{' '}
                  <button type="button" onClick={() => switchAuthMode('login')} className="text-teal-300 underline hover:text-teal-200 transition">
                    Sign in
                  </button>
                </p>
              </>
            ) : (
              <>
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
                    {authMode === 'signup' ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                    {authMode === 'signup' ? 'Create account' : 'Sign in'}
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-zinc-50">
                    {authMode === 'signup' ? 'Start saving your builds.' : 'Continue your robotics workspace.'}
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
                    {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                  </button>
                </form>

                <div className="flex flex-col gap-2 text-xs text-center text-zinc-500 pt-1">
                  {authMode === 'login' && (
                    <>
                      <button type="button" onClick={() => switchAuthMode('forgot-password')} className="text-teal-300 underline hover:text-teal-200 transition">
                        Forgot password?
                      </button>
                      New to CircuitAI?{' '}
                      <button type="button" onClick={() => switchAuthMode('signup')} className="text-teal-300 underline hover:text-teal-200 transition">
                        Create one
                      </button>
                    </>
                  )}
                  {authMode === 'signup' && (
                    <>
                      Already have an account?{' '}
                      <button type="button" onClick={() => switchAuthMode('login')} className="text-teal-300 underline hover:text-teal-200 transition">
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
