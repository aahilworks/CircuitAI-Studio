import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { ensureProAccessSynced } from '@/lib/server/subscription';
import { requireAuthUser } from '@/lib/server/auth';

interface SaveProjectBody {
  userId?: string;
  sessionId?: string;
  title?: string;
  board?: string;
  projectData?: unknown;
  messages?: unknown[];
}

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

export async function POST(req: Request) {
  try {
    // Security: Require authentication
    const authUser = await requireAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." }, 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { userId, sessionId, title, board, projectData, messages } = (await req.json()) as SaveProjectBody;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "Missing identity tracking parameters: userId or sessionId" }, 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Security: Ensure userId matches authenticated user
    if (userId !== authUser.uid) {
      return NextResponse.json(
        { error: "User ID mismatch." }, 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const isPro = await ensureProAccessSynced(userId, userData);

    // 1. Update/Save the specific chat session
    const sessionRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('chatSessions')
      .doc(sessionId);

    await sessionRef.set({
      title: title || "New Compilation Workspace",
      target_board: board || "Arduino Uno",
      lastUpdated: new Date().toISOString(),
      projectData: projectData || null,
      messages: messages || [],
      isPro,
    }, { merge: true });

    await userRef.set({ lastActive: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ success: true, sessionId });
  } catch (error: unknown) {
    console.error("Database initialization matrix fault:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
