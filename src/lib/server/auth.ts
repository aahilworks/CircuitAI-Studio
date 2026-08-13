import 'server-only';

import { getAuth } from 'firebase-admin/auth';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

export async function requireAuthUser(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
