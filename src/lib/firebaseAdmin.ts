import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

interface FirebaseServiceAccount {
  project_id?: string;
  projectId?: string;
  client_email?: string;
  clientEmail?: string;
  private_key?: string;
  privateKey?: string;
}

function getPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;

  // Unquote if wrapped in extra quotes, and convert literal \n to actual line breaks
  return key
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n');
}

function getServiceAccount(): { projectId: string; clientEmail: string; privateKey: string } {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const parsed = JSON.parse(serviceAccountKey.trim().replace(/^["']|["']$/g, '')) as FirebaseServiceAccount;
    const projectId = parsed.project_id || parsed.projectId;
    const clientEmail = parsed.client_email || parsed.clientEmail;
    const privateKey = (parsed.private_key || parsed.privateKey)?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      return { projectId, clientEmail, privateKey };
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing required Firebase Admin credentials.');
  }

  return { projectId, clientEmail, privateKey };
}

if (!getApps().length) {
  const { projectId, clientEmail, privateKey } = getServiceAccount();

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId, // Explicitly target project
  });
}

// If your database in console is named "(default)", use getFirestore()
// If it has a custom name in Firebase Console, pass it: getFirestore('database-name')
export const adminDb = getFirestore();
