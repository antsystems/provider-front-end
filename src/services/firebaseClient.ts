import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import type { User } from 'firebase/auth';

const firebaseConfig = {
  // API key embedded directly per user request
  apiKey: 'AIzaSyAaqgkXJXkntZBs7QQyss7Hy_HECyMXE2c',
  // add other fields as needed (authDomain, projectId) in .env.local
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { idToken, uid: cred.user.uid, user: cred.user } as { idToken: string; uid: string; user: User };
}