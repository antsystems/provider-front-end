import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import type { User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAaqgkXJXkntZBs7QQyss7Hy_HECyMXE2c',
  authDomain: 'mv20-a1a09.firebaseapp.com',
  projectId: 'mv20-a1a09',
  storageBucket: 'mv20-a1a09.appspot.com',
  messagingSenderId: '111793664073187114321',
  appId: '1:111793664073187114321:web:YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { idToken, uid: cred.user.uid, user: cred.user } as { idToken: string; uid: string; user: User };
}