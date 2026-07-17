'use client';

import { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { X, LogIn, UserPlus, LogOut, Globe } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

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
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
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
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 relative font-mono text-slate-200 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        
        {user ? (
          <div className="text-center space-y-4 py-4">
            <h3 className="text-sm font-bold text-cyan-400">SESSION IDENTIFIER ACTIVE</h3>
            <p className="text-xs text-slate-400">{user.email}</p>
            <button onClick={() => { signOut(auth); onClose(); }} className="w-full h-10 bg-red-950/40 border border-red-900 text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-900/20 transition">
              <LogOut className="h-4 w-4" /> Disconnect Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {isSignUp ? 'Create Workspace Identity' : 'Authenticate Identity'}
            </h3>
            
            {error && <p className="text-xs text-red-400 bg-red-950/20 p-2.5 rounded-lg border border-red-900/50">{error}</p>}

            <button type="button" disabled={loading} onClick={handleGoogleSignIn} className="w-full h-10 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2.5 transition">
              <Globe className="h-4 w-4 text-cyan-400" /> Continue with Google
            </button>

            <div className="flex items-center my-4 text-slate-700 text-[10px] font-bold tracking-widest uppercase">
              <div className="flex-1 border-t border-slate-800/80"></div>
              <span className="px-3">OR</span>
              <div className="flex-1 border-t border-slate-800/80"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Email Node Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs focus:outline-none focus:border-cyan-500 text-slate-100" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Secret Verification Token</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs focus:outline-none focus:border-cyan-500 text-slate-100" />
              </div>
              <button type="submit" disabled={loading} className="w-full h-10 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-40">
                {loading ? 'Processing Array...' : isSignUp ? 'Generate Identity' : 'Mount Access'}
              </button>
            </form>

            <p className="text-[11px] text-center text-slate-500 pt-2">
              {isSignUp ? "Already have a node?" : "Need a workspace allocation?"}{' '}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-cyan-400 underline hover:text-cyan-300">
                {isSignUp ? 'Authenticate' : 'Register'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}