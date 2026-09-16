import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Connectivity validation
export async function validateFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    console.log('[Firestore] Connected successfully to', firebaseConfig.projectId);
    return true;
  } catch (error: any) {
    // If offline or permission denied, it still verifies reachability to database
    console.warn('[Firestore] Connection checked:', error?.message || error);
    return false;
  }
}
