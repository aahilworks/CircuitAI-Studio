'use client';

import { ref, onValue, onDisconnect, set, update, remove, get } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { hasActiveProAccess } from '@/lib/proAccess';

export interface CollaborationUser {
  uid: string;
  email?: string;
  displayName?: string;
  color: string;
  cursor?: { x: number; y: number };
  lastActive: number;
}

export interface CollaborationSession {
  sessionId: string;
  users: Record<string, CollaborationUser>;
  ownerId: string;
  isActive: boolean;
}

const USER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'
];

function getUserColor(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

export class CollaborationManager {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private userRef: any = null;
  private sessionRef: any = null;
  private usersRef: any = null;
  private listeners: Array<() => void> = [];
  private currentUsers: CollaborationUser[] = [];

  constructor() {
    this.setupCleanup();
  }

  private setupCleanup() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanup());
    }
  }

  async joinSession(
    sessionId: string,
    userId: string,
    userData: { email?: string; displayName?: string },
    isPro: boolean
  ): Promise<boolean> {
    console.log('[Collaboration] joinSession called', { sessionId, userId, isPro });
    
    if (!isPro) {
      console.warn('[Collaboration] Pro access required for collaboration');
      return false;
    }

    if (!sessionId || !userId) {
      console.error('[Collaboration] Missing required parameters', { sessionId, userId });
      return false;
    }

    this.sessionId = sessionId;
    this.userId = userId;

    try {
      const sessionRef = ref(rtdb, `collaboration/sessions/${sessionId}`);
      this.sessionRef = sessionRef;

      const userColor = getUserColor(userId);
      const userRef = ref(rtdb, `collaboration/sessions/${sessionId}/users/${userId}`);
      this.userRef = userRef;

      console.log('[Collaboration] Checking if session exists...');
      const sessionSnapshot = await get(sessionRef);
      if (!sessionSnapshot.exists()) {
        console.log('[Collaboration] Creating new session...');
        await set(sessionRef, {
          ownerId: userId,
          isActive: true,
          createdAt: Date.now(),
        });
      } else {
        console.log('[Collaboration] Session already exists');
      }

      console.log('[Collaboration] Adding user to session...');
      await set(userRef, {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName,
        color: userColor,
        lastActive: Date.now(),
      });

      console.log('[Collaboration] Setting up disconnect handler...');
      onDisconnect(userRef).remove();

      console.log('[Collaboration] Setting up user listener...');
      const usersRef = ref(rtdb, `collaboration/sessions/${sessionId}/users`);
      this.usersRef = usersRef;
      
      onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val() || {};
        this.currentUsers = Object.values(usersData) as CollaborationUser[];
        console.log('[Collaboration] Users updated:', this.currentUsers.length);
        this.notifyListeners();
      });

      console.log('[Collaboration] Session joined successfully');
      return true;
    } catch (error) {
      console.error('[Collaboration] Error joining session:', error);
      this.cleanup();
      return false;
    }
  }

  updateCursor(x: number, y: number) {
    if (!this.userRef || !this.userId) return;
    
    try {
      update(this.userRef, {
        cursor: { x, y },
        lastActive: Date.now(),
      });
    } catch (error) {
      console.error('[Collaboration] Error updating cursor:', error);
    }
  }

  async leaveSession() {
    try {
      if (this.userRef) {
        await remove(this.userRef);
      }
    } catch (error) {
      console.error('[Collaboration] Error leaving session:', error);
    }
    this.cleanup();
  }

  getSessionUsers(): CollaborationUser[] {
    return this.currentUsers;
  }

  onSessionChange(callback: () => void) {
    this.listeners.push(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  private cleanup() {
    if (this.userRef) {
      onDisconnect(this.userRef).cancel();
    }
    if (this.usersRef) {
      // Remove the listener
      onValue(this.usersRef, () => {});
    }
    this.sessionId = null;
    this.userId = null;
    this.userRef = null;
    this.sessionRef = null;
    this.usersRef = null;
    this.currentUsers = [];
    this.listeners = [];
  }

  isActive(): boolean {
    return this.sessionId !== null && this.userId !== null;
  }
}

// Singleton instance
let collaborationManager: CollaborationManager | null = null;

export function getCollaborationManager(): CollaborationManager {
  if (!collaborationManager) {
    collaborationManager = new CollaborationManager();
  }
  return collaborationManager;
}

export async function canEnableCollaboration(userData?: any): Promise<boolean> {
  if (!userData) return false;
  return hasActiveProAccess(userData);
}
