import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(config).every(
  (value) => typeof value === 'string' && value.trim().length > 0,
);

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let cachedAccessToken: string | null = null;

if (isFirebaseConfigured) {
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
  authInstance = getAuth(firebaseApp);
  void setPersistence(authInstance, browserLocalPersistence);
}

/** Nullable until VITE_FIREBASE_* values are supplied at build time. */
export const auth = authInstance;

export const firebaseSetupMessage = 'لم يتم إعداد Firebase بعد. أضف متغيرات VITE_FIREBASE_* ثم أعد بناء التطبيق.';

const requireAuth = (): Auth => {
  if (!authInstance) throw new Error(firebaseSetupMessage);
  return authInstance;
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void,
) => {
  if (!authInstance) {
    onAuthFailure?.();
    return () => undefined;
  }
  return onAuthStateChanged(authInstance, async (user) => {
    if (!user) {
      cachedAccessToken = null;
      onAuthFailure?.();
      return;
    }
    cachedAccessToken = await user.getIdToken();
    onAuthSuccess?.(user, cachedAccessToken);
  });
};

export const registerWithEmail = async (name: string, email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
  if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
  cachedAccessToken = await credential.user.getIdToken();
  return credential.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
  cachedAccessToken = await credential.user.getIdToken();
  return credential.user;
};

export const resetEmailPassword = async (email: string) => {
  await sendPasswordResetEmail(requireAuth(), email.trim());
};

export const getAccessToken = (): string | null => cachedAccessToken;

export const logout = async (): Promise<void> => {
  if (authInstance) await signOut(authInstance);
  cachedAccessToken = null;
};
