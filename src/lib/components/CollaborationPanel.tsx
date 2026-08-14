'use client';

import { useEffect, useState } from 'react';
import { User, Users, X, Share2 } from 'lucide-react';
import { getCollaborationManager, type CollaborationUser } from '@/lib/collaboration';

interface CollaborationPanelProps {
  sessionId: string | undefined;
  userId: string | undefined;
  userData?: { email?: string | undefined; displayName?: string | undefined };
  isPro: boolean;
  onClose?: () => void;
}

export default function CollaborationPanel({
  sessionId,
  userId,
  userData,
  isPro,
  onClose,
}: CollaborationPanelProps) {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');

  useEffect(() => {
    if (!sessionId || !userId || !isPro) return;

    const manager = getCollaborationManager();
    
    manager.joinSession(sessionId, userId, userData || {}, isPro).then(success => {
      setIsActive(success);
    });

    manager.onSessionChange(() => {
      // Update users list
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
  }, [sessionId, userId, userData, isPro]);

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert('Collaboration link copied!');
    }
  };

  if (!isPro) {
    return (
      <div className="bg-teal-950/20 border border-teal-900/60 rounded-lg p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-2">
          <Users className="h-4 w-4" /> Pro Feature
        </div>
        <p className="text-sm text-zinc-400">Real-time collaboration is available for Pro users only.</p>
      </div>
    );
  }

  if (!isActive) {
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
        <button
          onClick={() => {
            if (sessionId && userId) {
              const manager = getCollaborationManager();
              manager.joinSession(sessionId, userId, userData || {}, true).then(success => {
                setIsActive(success);
              });
            }
          }}
          className="w-full h-9 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
        >
          <Share2 className="h-4 w-4" /> Enable Collaboration
        </button>
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
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {users.length === 0 ? (
          <p className="text-xs text-zinc-500">No other users in this session</p>
        ) : (
          users.map((user) => (
            <div
              key={user.uid}
              className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-100 truncate">
                  {user.displayName || user.email || 'Anonymous'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {user.uid === userId ? '(You)' : 'Collaborator'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={copyShareLink}
        className="w-full h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
      >
        <Share2 className="h-3 w-3" /> Copy Share Link
      </button>

      {shareLink && (
        <p className="mt-2 text-[10px] text-zinc-500 truncate">{shareLink}</p>
      )}
    </div>
  );
}
