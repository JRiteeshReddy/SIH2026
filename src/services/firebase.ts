import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
import { UserProfile, Expedition, DiscoveryRecord, LeaderboardUser, ConservationReport } from '../types';

// Read Firebase Web SDK Configuration strictly from Vite Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Singleton initialization for Firebase App, Auth, and Firestore
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const hasValidConfig = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.trim() !== '' && 
  firebaseConfig.apiKey !== 'DEMO_MODE' &&
  !firebaseConfig.apiKey.includes('placeholder')
);

if (hasValidConfig) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization error, continuing in local offline mode:', err);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.info('No live Firebase API key detected. Running in seamless local offline mode.');
}

export { app, auth, db };

// ==================================================
// AUTHENTICATION SERVICES
// ==================================================

/**
 * Format raw Firebase Auth errors into clean, human-readable UI messages.
 */
export const formatAuthError = (err: unknown): string => {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = (err as { code?: string })?.code || '';
  const message = (err as { message?: string })?.message || '';

  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser settings.';
    case 'auth/network-request-failed':
      return 'Network connection unavailable. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please try again later.';
    default:
      if (message.includes('popup')) return 'Google sign-in popup closed or blocked.';
      return message || 'Authentication failed. Please try again.';
  }
};

/**
 * Authenticate with Google OAuth popup.
 * Returns authenticated FirebaseUser.
 */
export const loginWithGoogle = async (): Promise<FirebaseUser> => {
  if (auth) {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  }
  // Seamless demo mode fallback
  const mockUser = {
    uid: 'google_explorer_' + Date.now().toString().slice(-4),
    email: 'nature.ranger@ecodex.org',
    displayName: 'Nature Ranger'
  } as unknown as FirebaseUser;
  localStorage.setItem('ecodex_active_uid', mockUser.uid);
  return mockUser;
};

/**
 * Sign in with Email and Password.
 * Returns authenticated FirebaseUser.
 */
export const loginWithEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
  if (auth) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }
  // Seamless demo mode fallback
  const mockUid = 'user_' + Math.abs(email.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0));
  const mockUser = {
    uid: mockUid,
    email,
    displayName: email.split('@')[0]
  } as unknown as FirebaseUser;
  localStorage.setItem('ecodex_active_uid', mockUser.uid);
  return mockUser;
};

/**
 * Register new user with Email and Password.
 * Returns created FirebaseUser with UID.
 */
export const registerWithEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
  if (auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }
  const mockUser = {
    uid: 'user_' + Date.now(),
    email,
    displayName: email.split('@')[0]
  } as unknown as FirebaseUser;
  localStorage.setItem('ecodex_active_uid', mockUser.uid);
  return mockUser;
};

/**
 * Send Password Reset Email.
 */
export const resetPasswordWithEmail = async (email: string): Promise<void> => {
  if (auth) {
    await sendPasswordResetEmail(auth, email);
  }
};

/**
 * Sign out current authenticated user.
 */
export const logoutUser = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
  localStorage.removeItem('ecodex_active_uid');
};

/**
 * Listen to Firebase Auth state updates across sessions/refreshes.
 */
export const subscribeToAuthState = (callback: (user: FirebaseUser | null) => void) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  // Local storage session fallback
  const activeUid = localStorage.getItem('ecodex_active_uid');
  if (activeUid) {
    const cachedProfileRaw = localStorage.getItem(`ecodex_user_${activeUid}`) || localStorage.getItem('ecodex_current_user');
    if (cachedProfileRaw) {
      try {
        const parsed = JSON.parse(cachedProfileRaw);
        callback({
          uid: parsed.uid || activeUid,
          email: parsed.email || 'explorer@ecodex.org',
          displayName: parsed.username || 'Explorer'
        } as unknown as FirebaseUser);
        return () => {};
      } catch {
        // ignore
      }
    }
    callback({
      uid: activeUid,
      email: 'explorer@ecodex.org',
      displayName: 'Explorer'
    } as unknown as FirebaseUser);
  } else {
    callback(null);
  }
  return () => {};
};

// ==================================================
// FIRESTORE USER PROFILES & OFFLINE QUEUE KEYS
// ==================================================

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

/**
 * Save / Update User Profile in Firestore under users/{uid}.
 */
export const saveUserProfileToFirestore = async (profile: UserProfile): Promise<boolean> => {
  const payload = {
    ...profile,
    updatedAt: new Date().toISOString()
  };

  // Cache locally
  localStorage.setItem(`ecodex_user_${profile.uid}`, JSON.stringify(payload));
  localStorage.setItem('ecodex_active_uid', profile.uid);

  if (navigator.onLine && db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'users', profile.uid), payload, { merge: true });
      return true;
    } catch (e) {
      console.warn('Firestore full user profile save failed (progression fields guarded by security rules):', e);
      // Fallback: update non-authoritative profile fields allowed by Firestore security rules
      try {
        const safeProfile = {
          uid: profile.uid,
          username: profile.username,
          email: profile.email,
          college: profile.college,
          avatar: profile.avatar,
          cityState: profile.cityState,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', profile.uid), safeProfile, { merge: true });
        return true;
      } catch (err) {
        console.warn('Fallback profile save failed, queueing offline:', err);
        localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(payload));
        return false;
      }
    }
  } else {
    localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(payload));
    return false;
  }
};

export type FetchProfileResult = 
  | { status: 'exists'; profile: UserProfile }
  | { status: 'missing'; profile: null }
  | { status: 'error'; error: Error };

/**
 * Fetch User Profile Result from Firestore users/{uid}.
 * Distinguishes confirmed non-existence ('missing') from network/permission errors ('error').
 */
export const fetchUserProfileResult = async (uid: string): Promise<FetchProfileResult> => {
  if (navigator.onLine && db) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        localStorage.setItem(`ecodex_user_${uid}`, JSON.stringify(data));
        return { status: 'exists', profile: data };
      } else {
        return { status: 'missing', profile: null };
      }
    } catch (e: unknown) {
      console.warn('Firestore user fetch failed with error:', e);
      return { status: 'error', error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  // If offline or in demo mode, check local cache
  const cached = localStorage.getItem(`ecodex_user_${uid}`) || localStorage.getItem('ecodex_current_user');
  if (cached) {
    try {
      const data = JSON.parse(cached) as UserProfile;
      return { status: 'exists', profile: data };
    } catch {
      // cache corrupted
    }
  }

  // If demo mode (no db configured), treat as missing so user proceeds to onboarding view
  if (!db) {
    return { status: 'missing', profile: null };
  }

  // If offline and no local cache, return network error state rather than treating as missing profile
  return { status: 'error', error: new Error('Network connection unavailable and no local profile cached.') };
};

/**
 * Legacy/Simple Fetch User Profile from Firestore users/{uid}.
 */
export const getUserProfileFromFirestore = async (uid: string): Promise<UserProfile | null> => {
  const result = await fetchUserProfileResult(uid);
  return result.status === 'exists' ? result.profile : null;
};

/**
 * Fetch Firestore-backed Leaderboard Users sorted by ecoXP
 */
export const fetchLeaderboardFromFirestore = async (): Promise<LeaderboardUser[]> => {
  if (navigator.onLine && db) {
    try {
      const q = query(collection(db, 'users'), orderBy('ecoXP', 'desc'), limit(50));
      const snap = await getDocs(q);
      const list: LeaderboardUser[] = [];
      let rank = 1;
      snap.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          uid: data.uid || docSnap.id,
          username: data.username || 'Explorer',
          college: data.college || 'EcoDex Academy',
          avatar: data.avatar || '🌿',
          cityState: data.cityState || 'India',
          rank: rank++,
          level: data.level || 1,
          ecoXP: data.ecoXP || 0,
          totalDistance: data.totalDistance || 0,
          speciesFound: data.speciesFound || 0,
          streak: data.streak || 1,
          achievementsCount: Array.isArray(data.achievements) ? data.achievements.length : (data.achievementsCount || 0)
        });
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn('Leaderboard fetch from Firestore failed, falling back to local:', e);
    }
  }
  return [];
};

// ==================================================
// EXPEDITIONS COLLECTION (expeditions/{expeditionId})
// ==================================================

export const logExpeditionToFirestore = async (expedition: Expedition): Promise<void> => {
  const currentUid = auth.currentUser?.uid || expedition.userId;
  const payload: Expedition = {
    ...expedition,
    userId: currentUid,
    createdAt: expedition.createdAt || new Date().toISOString()
  };

  // Always cache locally in device history
  const history = getLocalExpeditions();
  history.unshift(payload);
  localStorage.setItem('ecodex_expedition_history', JSON.stringify(history.slice(0, 50)));

  if (navigator.onLine && db && auth.currentUser) {
    try {
      await setDoc(doc(db, 'expeditions', expedition.id), payload);
      return;
    } catch (e) {
      console.warn('Firestore expedition log failed, queueing for offline sync:', e);
    }
  }

  // Queue for sync when internet returns
  const pending = getPendingItems<Expedition>(PENDING_EXPEDITIONS_KEY);
  pending.push(payload);
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

// ==================================================
// DISCOVERIES COLLECTION (discoveries/{discoveryId})
// ==================================================

export const logDiscoveryToFirestore = async (discovery: DiscoveryRecord): Promise<void> => {
  const currentUid = auth.currentUser?.uid || discovery.userId;
  const latVal = typeof discovery.latitude === 'number' ? discovery.latitude : (discovery.coordinates?.lat ?? 18.5204);
  const lngVal = typeof discovery.longitude === 'number' ? discovery.longitude : (discovery.coordinates?.lng ?? 73.8567);
  const confVal = typeof discovery.confidence === 'number' ? Math.min(1, Math.max(0, discovery.confidence)) : 0.95;

  // Ensure mandatory persisted fields matching security rules: userId, speciesId, latitude, longitude, confidence, timestamp
  const payload: DiscoveryRecord = {
    id: discovery.id,
    userId: currentUid,
    speciesId: discovery.speciesId,
    animalName: discovery.animalName || discovery.speciesName || 'Wildlife Sighting',
    rarity: discovery.rarity || 'Common',
    confidence: confVal,
    latitude: latVal,
    longitude: lngVal,
    timestamp: discovery.timestamp || new Date().toISOString(),
    ecoXP: discovery.ecoXP ?? discovery.xpAwarded ?? 20,
    expeditionId: discovery.expeditionId || null,
    createdAt: discovery.createdAt || new Date().toISOString(),
    localImageUri: discovery.localImageUri || discovery.photoUrl,
    locationName: discovery.locationName || 'Nature Sanctuary'
  };

  // Always cache locally in device history
  const history = getLocalDiscoveries();
  history.unshift(payload);
  localStorage.setItem('ecodex_discovery_history', JSON.stringify(history.slice(0, 50)));

  // Do NOT upload base64 or images to Firebase Storage (staying on Spark plan)
  if (navigator.onLine && db && auth.currentUser) {
    try {
      await setDoc(doc(db, 'discoveries', discovery.id), payload);
      return;
    } catch (e) {
      console.warn('Firestore discovery log failed, queueing for offline sync:', e);
    }
  }

  // Queue for offline sync
  const pending = getPendingItems<DiscoveryRecord>(PENDING_DISCOVERIES_KEY);
  pending.push(payload);
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

// ==================================================
// REPORTS COLLECTION (reports/{reportId})
// ==================================================

export const submitReportToFirestore = async (report: ConservationReport): Promise<boolean> => {
  const currentUserId = auth?.currentUser?.uid || report.reporterUserId;
  const payload: ConservationReport = {
    ...report,
    reporterUserId: currentUserId,
    createdAt: report.createdAt || new Date().toISOString(),
    status: report.status || 'pending'
  };

  if (navigator.onLine && db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'reports', report.id), payload);
      return true;
    } catch (e) {
      console.warn('Firestore report save error:', e);
      return false;
    }
  }
  return true;
};

// ==================================================
// OFFLINE QUEUE SYNCHRONIZATION WITH RETRY LOGIC
// ==================================================

/**
 * Synchronize pending items with Firebase.
 * IMPORTANT: Only remove items from the offline queue if the Firebase write ACTUALLY succeeds.
 * If write fails, item remains in queue for future retry.
 */
export const syncPendingWithFirebase = async (): Promise<{
  syncedExpeditions: number;
  syncedDiscoveries: number;
  syncedProfile: boolean;
  success: boolean;
}> => {
  if (!navigator.onLine || !db || !auth?.currentUser) {
    return { syncedExpeditions: 0, syncedDiscoveries: 0, syncedProfile: false, success: false };
  }

  const pendingExpeditions = getPendingItems<Expedition>(PENDING_EXPEDITIONS_KEY);
  const pendingDiscoveries = getPendingItems<DiscoveryRecord>(PENDING_DISCOVERIES_KEY);
  const pendingProfileRaw = localStorage.getItem(PENDING_PROFILE_KEY);

  let syncedExpeditions = 0;
  let syncedDiscoveries = 0;
  let syncedProfile = false;

  // 1. Synchronize Pending Expeditions
  if (pendingExpeditions.length > 0) {
    const remainingExpeditions: Expedition[] = [];
    for (const exp of pendingExpeditions) {
      try {
        await setDoc(doc(db, 'expeditions', exp.id), exp);
        syncedExpeditions++;
      } catch (err) {
        console.warn(`Expedition sync failed for ${exp.id}:`, err);
        remainingExpeditions.push(exp);
      }
    }
    setPendingItems(PENDING_EXPEDITIONS_KEY, remainingExpeditions);
  }

  // 2. Synchronize Pending Discoveries
  if (pendingDiscoveries.length > 0) {
    const remainingDiscoveries: DiscoveryRecord[] = [];
    for (const disc of pendingDiscoveries) {
      try {
        await setDoc(doc(db, 'discoveries', disc.id), disc);
        syncedDiscoveries++;
      } catch (err) {
        console.warn(`Discovery sync failed for ${disc.id}:`, err);
        remainingDiscoveries.push(disc);
      }
    }
    setPendingItems(PENDING_DISCOVERIES_KEY, remainingDiscoveries);
  }

  // 3. Synchronize Pending Profile
  if (pendingProfileRaw) {
    try {
      const profile = JSON.parse(pendingProfileRaw) as UserProfile;
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
      localStorage.removeItem(PENDING_PROFILE_KEY);
      syncedProfile = true;
    } catch (err) {
      console.warn('Profile sync failed:', err);
    }
  }

  return {
    syncedExpeditions,
    syncedDiscoveries,
    syncedProfile,
    success: true
  };
};
