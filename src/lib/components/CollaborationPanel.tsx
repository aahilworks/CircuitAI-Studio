'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, X, Share2, UserPlus, Copy, CheckCircle2, Clock, Crown } from 'lucide-react';
import { getCollaborationManager, type CollaborationUser } from '@/lib/collaboration';
import { initiateProSubscription } from '@/lib/razorpayCheckout';
import type { User } from 'firebase/auth';

interface CollaborationPanelProps {
  sessionId: string | undefined;
  userId: string | undefined;
  userData?: { email?: string | undefined; displayName?: string | undefined };
  isPro: boolean;
  currentUser?: User | null;
  onClose?: () => void;
}

export default function CollaborationPanel({
  sessionId,
  userId,
  userData,
  isPro,
  currentUser,
  onClose,
}: CollaborationPanelProps) {
  console.log('[CollaborationPanel] Component rendered', { sessionId, userId, isPro, currentUser: !!currentUser });
  
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ sessionId, userId, isPro });

  const manager = getCollaborationManager();

  // Update debug info when props change
  useEffect(() => {
    setDebugInfo({ sessionId, userId, isPro });
  }, [sessionId, userId, isPro]);

  const joinSession = useCallback(async () => {
    console.log('[CollaborationPanel] joinSession called', { sessionId, userId, isPro });
    
    if (!sessionId || !userId) {
      console.error('[CollaborationPanel] Missing required data', { sessionId, userId });
      return;
    }
    
    // Only pro users can start new sessions
    if (!isPro) {
      console.warn('[CollaborationPanel] Free users cannot start new sessions');
      return;
    }
    
    setIsJoining(true);
    try {
      console.log('[CollaborationPanel] Calling manager.joinSession...');
      const success = await manager.joinSession(sessionId, userId, userData || {}, isPro);
      console.log('[CollaborationPanel] joinSession result:', success);
      setIsActive(success);
      if (!success) {
        console.error('[CollaborationPanel] Failed to join session');
      }
    } catch (error) {
      console.error('[CollaborationPanel] Error joining session:', error);
    } finally {
      setIsJoining(false);
    }
  }, [sessionId, userId, userData, isPro, manager]);

  // Allow free users to join existing sessions (read-only)
  const joinExistingSession = useCallback(async () => {
    console.log('[CollaborationPanel] joinExistingSession called', { sessionId, userId, isPro });
    
    if (!sessionId || !userId) {
      console.error('[CollaborationPanel] Missing required data', { sessionId, userId });
      return;
    }
    
    setIsJoining(true);
    try {
      console.log('[CollaborationPanel] Calling manager.joinSession for existing session...');
      const success = await manager.joinSession(sessionId, userId, userData || {}, true); // Force isPro=true for joining
      console.log('[CollaborationPanel] joinSession result:', success);
      setIsActive(success);
      if (!success) {
        console.error('[CollaborationPanel] Failed to join session');
      }
    } catch (error) {
      console.error('[CollaborationPanel] Error joining session:', error);
    } finally {
      setIsJoining(false);
    }
  }, [sessionId, userId, userData, manager]);

  const leaveSession = useCallback(async () => {
    await manager.leaveSession();
    setIsActive(false);
  }, [manager]);

  useEffect(() => {
    if (!sessionId || !userId) return;
    
    // Allow both pro and free users to listen to session changes
    manager.onSessionChange(() => {
      const sessionUsers = manager.getSessionUsers();
      setUsers(sessionUsers);
    });

    // Generate share link
    if (typeof window !== 'undefined') {
      setShareLink(`${window.location.origin}/workspace?session=${sessionId}`);
    }

    return () => {
      manager.leaveSession();
    };
  }, [sessionId, userId, userData, manager]);

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatLastActive = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Active now';
    if (seconds < 300) return `${Math.floor(seconds / 60)}m ago`;
    return 'Inactive';
  };

  // Remove the pro-only gate - allow free users to see collaboration panel
  // if they have a sessionId (e.g., from a shared link)
  if (!isPro && !sessionId) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-300" /> Collaboration
          </h3>
          {onClose && (
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <UserPlus className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-200">Real-time Collaboration</p>
              <p className="text-xs text-zinc-500 mt-1">Work together with teammates in real-time. See cursors, share projects, and collaborate instantly.</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (currentUser) {
                initiateProSubscription({ currentUser });
              }
            }}
            className="w-full h-9 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
          >
            <Crown className="h-4 w-4" /> Upgrade to Pro
          </button>
        </div>
        {/* Debug info */}
        <div className="mt-3 p-2 bg-zinc-950 border border-zinc-800 rounded text-[10px] text-zinc-500">
          <p>Debug: isActive={String(isActive)}, isJoining={String(isJoining)}, isPro={String(isPro)}</p>
          <p>SessionId: {debugInfo.sessionId || 'none'}</p>
          <p>UserId: {debugInfo.userId || 'none'}</p>
        </div>
      </div>
    );
  }

  if (!isActive) {
    console.log('[CollaborationPanel] Rendering start button', { isJoining, sessionId, userId, isPro });
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-300" /> Collaboration
          </h3>
          {onClose && (
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {isPro ? (
          <button
            onClick={() => {
              console.log('[CollaborationPanel] Start button clicked (Pro)');
              joinSession();
            }}
            disabled={isJoining}
            className="w-full h-9 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
          >
            {isJoining ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {isJoining ? 'Starting...' : 'Start Collaboration'}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('[CollaborationPanel] Join button clicked (Free)');
                joinExistingSession();
              }}
              disabled={isJoining}
              className="w-full h-9 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
            >
              {isJoining ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isJoining ? 'Joining...' : 'Join Session'}
            </button>
            <p className="text-[10px] text-zinc-500 text-center">Free users can join existing sessions</p>
          </div>
        )}
        {/* Debug info */}
        <div className="mt-3 p-2 bg-zinc-950 border border-zinc-800 rounded text-[10px] text-zinc-500">
          <p>Debug: isActive={String(isActive)}, isJoining={String(isJoining)}, isPro={String(isPro)}</p>
          <p>SessionId: {debugInfo.sessionId || 'none'}</p>
          <p>UserId: {debugInfo.userId || 'none'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Users className="h-4 w-4 text-teal-300" /> 
          Active Collaborators ({users.length})
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-semibold">LIVE</span>
          {onClose && (
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {users.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-3">Waiting for collaborators to join...</p>
        ) : (
          users.map((user) => (
            <div
              key={user.uid}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5"
            >
              <div className="relative">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-100 truncate">
                  {user.displayName || user.email?.split('@')[0] || 'Anonymous'}
                </p>
                <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {formatLastActive(user.lastActive)}
                  {user.uid === userId && <span className="text-teal-400">• You</span>}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={copyShareLink}
          className="w-full h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy Share Link
            </>
          )}
        </button>

        {shareLink && (
          <p className="text-[10px] text-zinc-500 truncate text-center">{shareLink}</p>
        )}

        <button
          onClick={leaveSession}
          className="w-full h-8 bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 text-red-300 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
        >
          End Session
        </button>
      </div>
    </div>
  );
}
