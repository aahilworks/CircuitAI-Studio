'use client';

import { doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  private userDocRef: any = null;
  private sessionDocRef: any = null;
  private usersCollectionRef: any = null;
  private listeners: Array<() => void> = [];
  private currentUsers: CollaborationUser[] = [];
  private unsubscribeUsers: (() => void) | null = null;

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
      // Use proper Firestore path structure with even segments
      const sessionDocRef = doc(db, 'collaborationSessions', sessionId);
      this.sessionDocRef = sessionDocRef;

      const userColor = getUserColor(userId);
      const userDocRef = doc(db, 'collaborationSessions', sessionId, 'users', userId);
      this.userDocRef = userDocRef;

      console.log('[Collaboration] Checking if session exists...');
      const sessionSnapshot = await getDoc(sessionDocRef);
      if (!sessionSnapshot.exists()) {
        console.log('[Collaboration] Creating new session...');
        await setDoc(sessionDocRef, {
          ownerId: userId,
          isActive: true,
          createdAt: Date.now(),
        });
      } else {
        console.log('[Collaboration] Session already exists');
      }

      console.log('[Collaboration] Adding user to session...');
      await setDoc(userDocRef, {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName,
        color: userColor,
        lastActive: Date.now(),
      });

      console.log('[Collaboration] Setting up user listener...');
      // Listen to session document for user updates
      this.unsubscribeUsers = onSnapshot(
        sessionDocRef,
        async (snapshot) => {
          try {
            const sessionData = snapshot.data();
            if (sessionData && sessionData.users) {
              this.currentUsers = Object.values(sessionData.users) as CollaborationUser[];
              console.log('[Collaboration] Users updated:', this.currentUsers.length);
              this.notifyListeners();
            } else {
              // Try to get users from subcollection
              const usersSnapshot = await getDoc(userDocRef);
              if (usersSnapshot.exists()) {
                this.currentUsers = [usersSnapshot.data() as CollaborationUser];
                console.log('[Collaboration] Users updated (subcollection):', this.currentUsers.length);
                this.notifyListeners();
              }
            }
          } catch (error) {
            console.error('[Collaboration] Error processing user update:', error);
          }
        }
      );

      console.log('[Collaboration] Session joined successfully');
      return true;
    } catch (error) {
      console.error('[Collaboration] Error joining session:', error);
      this.cleanup();
      return false;
    }
  }

  updateCursor(x: number, y: number) {
    if (!this.userDocRef || !this.userId) return;
    
    try {
      updateDoc(this.userDocRef, {
        cursor: { x, y },
        lastActive: Date.now(),
      });
    } catch (error) {
      console.error('[Collaboration] Error updating cursor:', error);
    }
  }

  async leaveSession() {
    try {
      if (this.userDocRef) {
        await deleteDoc(this.userDocRef);
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
    if (this.unsubscribeUsers) {
      this.unsubscribeUsers();
      this.unsubscribeUsers = null;
    }
    this.sessionId = null;
    this.userId = null;
    this.userDocRef = null;
    this.sessionDocRef = null;
    this.usersCollectionRef = null;
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
