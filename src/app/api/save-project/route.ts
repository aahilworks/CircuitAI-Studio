import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')),
  });
}

const adminDb = getFirestore();

export async function POST(req: Request) {
  try {
    const { userId, sessionId, title, board, projectData, messages } = await req.json();

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "Missing identity tracking parameters: userId or sessionId" }, 
        { status: 400 }
      );
    }

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
      messages: messages || []
    }, { merge: true });

    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    console.error("Database initialization matrix fault:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
