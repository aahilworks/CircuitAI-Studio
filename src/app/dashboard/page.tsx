'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import AuthModal from '@/lib/components/AuthModal';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs, orderBy, limit, setDoc } from 'firebase/firestore';
import { hasActiveProAccess } from '@/lib/proAccess';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  Crown, 
  FileText, 
  Lock, 
  Menu, 
  RefreshCw, 
  Settings, 
  Sparkles, 
  TrendingUp, 
  User as UserIcon, 
  X 
} from 'lucide-react';

interface UserData {
  isPro?: boolean;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
  subscriptionId?: string | null;
  subscriptionBillingCycle?: string | null;
  subscriptionCreatedAt?: string | null;
  proActivatedAt?: string | null;
}

interface ProjectData {
  id: string;
  title: string;
  target_board?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState<ProjectData[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      unsubscribeUserDoc?.();

      if (!user) {
        setUserData(null);
        setProjectCount(0);
        setRecentProjects([]);
        return;
      }

      // Load user data
      unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.data() as UserData);
        } else {
          // User document doesn't exist, create it
          setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            createdAt: new Date().toISOString(),
            isPro: false,
          }, { merge: true });
          setUserData(null);
        }
      });

      // Load project count
      const loadProjectData = async () => {
        try {
          const projectsQuery = query(
            collection(db, 'users', user.uid, 'projects'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const snapshot = await getDocs(projectsQuery);
          setProjectCount(snapshot.size);
          
          const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || 'Untitled Project',
            target_board: doc.data().target_board,
            createdAt: doc.data().createdAt,
          })) as ProjectData[];
          setRecentProjects(projects);
        } catch (error) {
          console.error('Failed to load project data:', error);
        }
      };

      loadProjectData();
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserDoc?.();
    };
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Subscription cancellation requested. You will have access until the end of your billing period.');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate?: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (!authReady) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-300" />
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30">
        <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 md:px-8">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-black text-xs text-teal-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">CAI</span>
              <span className="text-lg font-black tracking-wide">Circuit<span className="text-teal-300">AI</span></span>
            </Link>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase flex items-center gap-2 transition"
            >
              Sign In
            </button>
          </nav>
        </header>
        <section className="px-4 py-20 md:px-8">
          <div className="mx-auto max-w-md text-center">
            <Lock className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-zinc-100 mb-2">Sign In Required</h1>
            <p className="text-zinc-400 mb-6">Please sign in to access your dashboard.</p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="h-11 px-5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition mx-auto"
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} user={currentUser} />
      </main>
    );
  }

  const isPro = hasActiveProAccess(userData);
  const daysRemaining = getDaysRemaining(userData?.currentPeriodEnd);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 md:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-black text-xs text-teal-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">CAI</span>
            <span className="text-lg font-black tracking-wide">Circuit<span className="text-teal-300">AI</span></span>
          </Link>
          <div className="hidden items-center gap-6 text-xs font-bold text-zinc-500 md:flex">
            <Link href="/features" className="hover:text-teal-300 transition">Features</Link>
            <Link href="/pricing" className="hover:text-teal-300 transition">Pricing</Link>
            <Link href="/dashboard" className="text-teal-300">Dashboard</Link>
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

      <section className="px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-lg bg-teal-950/50 border border-teal-800 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-teal-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-100">Dashboard</h1>
              <p className="text-sm text-zinc-400">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Projects</span>
              </div>
              <p className="text-3xl font-black text-zinc-100">{projectCount}</p>
              <p className="text-xs text-zinc-500 mt-1">Total projects created</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Crown className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Plan</span>
              </div>
              <p className="text-3xl font-black text-zinc-100">{isPro ? 'Pro' : 'Free'}</p>
              <p className="text-xs text-zinc-500 mt-1">Current subscription</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Status</span>
              </div>
              <p className="text-3xl font-black text-zinc-100">{userData?.subscriptionStatus || 'Active'}</p>
              <p className="text-xs text-zinc-500 mt-1">Subscription status</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Days Left</span>
              </div>
              <p className="text-3xl font-black text-zinc-100">{daysRemaining !== null ? daysRemaining : '-'}</p>
              <p className="text-xs text-zinc-500 mt-1">Until renewal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-black text-zinc-100 mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-teal-300" />
                Subscription Details
              </h2>
              
              {isPro ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-sm text-zinc-400">Plan Type</span>
                    <span className="text-sm font-bold text-teal-300">CircuitAI Pro</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-sm text-zinc-400">Billing Cycle</span>
                    <span className="text-sm font-bold text-zinc-100">{userData?.subscriptionBillingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-sm text-zinc-400">Status</span>
                    <span className="text-sm font-bold text-emerald-300">{userData?.subscriptionStatus || 'Active'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-sm text-zinc-400">Started On</span>
                    <span className="text-sm font-bold text-zinc-100">{formatDate(userData?.proActivatedAt || undefined)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-sm text-zinc-400">Renews On</span>
                    <span className="text-sm font-bold text-zinc-100">{formatDate(userData?.currentPeriodEnd || undefined)}</span>
                  </div>
                  
                  <div className="pt-4">
                    {userData?.subscriptionBillingCycle === 'yearly' ? (
                      <div className="text-xs text-zinc-500 text-center">
                        One-time payment - no cancellation needed
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className="w-full h-10 px-4 rounded-lg border border-red-900/50 bg-red-950/30 hover:bg-red-950/50 text-red-300 text-xs font-bold uppercase transition disabled:opacity-50"
                      >
                        {isCancelling ? <RefreshCw className="h-4 w-4 animate-spin mx-auto" /> : 'Cancel Subscription'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 bg-amber-950/30 border border-amber-900/50 px-4 py-3 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">Upgrade to Pro for unlimited projects and advanced features</span>
                  </div>
                  <Link
                    href="/pricing"
                    className="block w-full h-11 px-5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
                  >
                    Upgrade to Pro <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-black text-zinc-100 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-300" />
                Recent Projects
              </h2>
              
              {recentProjects.length > 0 ? (
                <div className="space-y-2">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/workspace?session=${project.id}`}
                      className="block p-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-100 truncate">{project.title}</span>
                        <CheckCircle2 className="h-4 w-4 text-teal-300 shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500">{project.target_board || 'Unknown board'}</span>
                        <span className="text-[10px] text-zinc-600">•</span>
                        <span className="text-[10px] text-zinc-500">{formatDate(project.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400 mb-4">No projects yet</p>
                  <Link
                    href="/workspace"
                    className="inline-flex h-10 px-5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase items-center gap-2 transition"
                  >
                    Create First Project <Sparkles className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
            <h2 className="text-lg font-black text-zinc-100 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-teal-300" />
              Account Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950">
                <UserIcon className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="text-sm font-bold text-zinc-100">{currentUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950">
                <CreditCard className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-xs text-zinc-500">Payment Method</p>
                  <p className="text-sm font-bold text-zinc-100">Razorpay</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">
                Need help with refunds or billing? Contact us at{' '}
                <a href="mailto:techokids123@gmail.com" className="text-teal-400 hover:text-teal-300 underline">
                  techokids123@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} user={currentUser} />
    </main>
  );
}
