import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Firestore
} from 'firebase/firestore';
import { UserProfile, Expedition, DiscoveryRecord, LeaderboardUser } from '../types';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Local storage key for custom Firebase settings
const FB_CONFIG_STORAGE_KEY = 'ecodex_firebase_config';

export const getSavedFirebaseConfig = (): FirebaseConfigParams | null => {
  try {
    const raw = localStorage.getItem(FB_CONFIG_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
};

export const saveFirebaseConfig = (cfg: FirebaseConfigParams) => {
  localStorage.setItem(FB_CONFIG_STORAGE_KEY, JSON.stringify(cfg));
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const initFirebase = (customConfig?: FirebaseConfigParams) => {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.apiKey || config.apiKey === 'DEMO_MODE') {
    return { app: null, auth: null, db: null, isDemo: true };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db, isDemo: false };
  } catch (err) {
    console.warn('Firebase initialization error, continuing in local mode:', err);
    return { app: null, auth: null, db: null, isDemo: true };
  }
};

// Auto-init on load
initFirebase();

// Auth helpers
export const loginWithGoogle = async (): Promise<{ user: Partial<FirebaseUser> | null; isNew: boolean }> => {
  if (auth) {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userDocRef = doc(db!, 'users', cred.user.uid);
    const snapshot = await getDoc(userDocRef);
    return { user: cred.user, isNew: !snapshot.exists() };
  } else {
    // Offline / Demo Fallback
    const demoUser = {
      uid: 'demo_user_' + Date.now().toString().slice(-4),
      displayName: 'Nature Explorer',
      email: 'explorer@ecodex.org'
    };
    return { user: demoUser as unknown as FirebaseUser, isNew: true };
  }
};

export const loginWithEmail = async (email: string, pass: string): Promise<FirebaseUser | { uid: string; email: string }> => {
  if (auth) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } else {
    return {
      uid: 'email_user_' + Math.abs(email.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
      email
    };
  }
};

export const registerWithEmail = async (email: string, pass: string): Promise<FirebaseUser | { uid: string; email: string }> => {
  if (auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } else {
    return {
      uid: 'email_user_' + Date.now(),
      email
    };
  }
};

export const logoutUser = async () => {
  if (auth) {
    await signOut(auth);
  }
};

// Firestore User Profile helpers
export const saveUserProfileToFirestore = async (profile: UserProfile): Promise<void> => {
  if (db) {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    } catch (e) {
      console.warn('Firestore user save failed:', e);
    }
  }
  // Always update local cache
  localStorage.setItem(`ecodex_user_${profile.uid}`, JSON.stringify(profile));
  localStorage.setItem('ecodex_active_uid', profile.uid);
};

export const getUserProfileFromFirestore = async (uid: string): Promise<UserProfile | null> => {
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Firestore user fetch failed:', e);
    }
  }
  const cached = localStorage.getItem(`ecodex_user_${uid}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return null;
};

// Pending Offline Sync Keys
const PENDING_EXPEDITIONS_KEY = 'ecodex_pending_expeditions';
const PENDING_DISCOVERIES_KEY = 'ecodex_pending_discoveries';
const PENDING_PROFILE_KEY = 'ecodex_pending_profile';

const getPendingItems = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setPendingItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const getPendingSyncCount = (): number => {
  const exps = getPendingItems<Expedition>(PENDING_EXPEDITIONS_KEY);
  const discs = getPendingItems<DiscoveryRecord>(PENDING_DISCOVERIES_KEY);
  const prof = localStorage.getItem(PENDING_PROFILE_KEY);
  return exps.length + discs.length + (prof ? 1 : 0);
};

// Save Expedition to Firestore 'expeditions' collection with Offline Queue
export const logExpeditionToFirestore = async (expedition: Expedition): Promise<void> => {
  // 1. Always cache locally in device history
  const history = getLocalExpeditions();
  history.unshift(expedition);
  localStorage.setItem('ecodex_expedition_history', JSON.stringify(history.slice(0, 50)));

  // 2. If online and DB connected, push to cloud
  if (navigator.onLine && db) {
    try {
      await addDoc(collection(db, 'expeditions'), expedition);
      return;
    } catch (e) {
      console.warn('Firestore expedition log failed, queueing for offline sync:', e);
    }
  }

  // 3. Queue for sync when internet returns
  const pending = getPendingItems<Expedition>(PENDING_EXPEDITIONS_KEY);
  pending.push(expedition);
  setPendingItems(PENDING_EXPEDITIONS_KEY, pending);
};

export const getLocalExpeditions = (): Expedition[] => {
  try {
    const raw = localStorage.getItem('ecodex_expedition_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Save Discovery to Firestore 'discoveries' collection with Offline Queue
export const logDiscoveryToFirestore = async (discovery: DiscoveryRecord): Promise<void> => {
  // 1. Always cache locally in device history
  const history = getLocalDiscoveries();
  history.unshift(discovery);
  localStorage.setItem('ecodex_discovery_history', JSON.stringify(history.slice(0, 50)));

  // 2. If online and DB connected, push to cloud
  if (navigator.onLine && db) {
    try {
      await addDoc(collection(db, 'discoveries'), discovery);
      return;
    } catch (e) {
      console.warn('Firestore discovery log failed, queueing for offline sync:', e);
    }
  }

  // 3. Queue for sync when internet returns
  const pending = getPendingItems<DiscoveryRecord>(PENDING_DISCOVERIES_KEY);
  pending.push(discovery);
  setPendingItems(PENDING_DISCOVERIES_KEY, pending);
};

export const getLocalDiscoveries = (): DiscoveryRecord[] => {
  try {
    const raw = localStorage.getItem('ecodex_discovery_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Sync with Firebase when internet returns
export const syncPendingWithFirebase = async (): Promise<{
  syncedExpeditions: number;
  syncedDiscoveries: number;
  syncedProfile: boolean;
  success: boolean;
}> => {
  if (!navigator.onLine) {
    return { syncedExpeditions: 0, syncedDiscoveries: 0, syncedProfile: false, success: false };
  }

  const pendingExpeditions = getPendingItems<Expedition>(PENDING_EXPEDITIONS_KEY);
  const pendingDiscoveries = getPendingItems<DiscoveryRecord>(PENDING_DISCOVERIES_KEY);
  const pendingProfileRaw = localStorage.getItem(PENDING_PROFILE_KEY);

  let syncedExpeditions = 0;
  let syncedDiscoveries = 0;
  let syncedProfile = false;

  try {
    // 1. Push pending expeditions
    if (db && pendingExpeditions.length > 0) {
      for (const exp of pendingExpeditions) {
        await addDoc(collection(db, 'expeditions'), exp);
        syncedExpeditions++;
      }
      setPendingItems(PENDING_EXPEDITIONS_KEY, []);
    } else if (pendingExpeditions.length > 0) {
      syncedExpeditions = pendingExpeditions.length;
      setPendingItems(PENDING_EXPEDITIONS_KEY, []);
    }

    // 2. Push pending discoveries
    if (db && pendingDiscoveries.length > 0) {
      for (const disc of pendingDiscoveries) {
        await addDoc(collection(db, 'discoveries'), disc);
        syncedDiscoveries++;
      }
      setPendingItems(PENDING_DISCOVERIES_KEY, []);
    } else if (pendingDiscoveries.length > 0) {
      syncedDiscoveries = pendingDiscoveries.length;
      setPendingItems(PENDING_DISCOVERIES_KEY, []);
    }

    // 3. Push pending user profile
    if (pendingProfileRaw) {
      const profile = JSON.parse(pendingProfileRaw) as UserProfile;
      if (db) {
        await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
      }
      localStorage.removeItem(PENDING_PROFILE_KEY);
      syncedProfile = true;
    }

    return {
      syncedExpeditions,
      syncedDiscoveries,
      syncedProfile,
      success: true
    };
  } catch (err) {
    console.warn('Sync with Firebase partial error:', err);
    return {
      syncedExpeditions,
      syncedDiscoveries,
      syncedProfile,
      success: false
    };
  }
};

// Firestore 'reports' collection (e.g. reporting rare sightings / conservation flags)
export const submitReportToFirestore = async (report: {
  userId: string;
  speciesName: string;
  location: string;
  notes: string;
  timestamp: string;
}) => {
  if (db && navigator.onLine) {
    try {
      await addDoc(collection(db, 'reports'), report);
      return true;
    } catch (e) {
      console.warn('Firestore report save error:', e);
    }
  }
  return true;
};
