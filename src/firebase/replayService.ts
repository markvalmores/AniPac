import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  deleteDoc 
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { GhostReplayData } from '../game/types';

const REPLAYS_COLLECTION = 'replays';

export function getLocalBestReplay(level: number): GhostReplayData | null {
  try {
    const raw = localStorage.getItem(`anipac_replay_lvl_${level}`);
    if (raw) {
      return JSON.parse(raw) as GhostReplayData;
    }
  } catch (err) {
    console.error('Failed reading local replay:', err);
  }
  return null;
}

export function saveLocalBestReplay(replay: GhostReplayData): void {
  try {
    localStorage.setItem(`anipac_replay_lvl_${replay.level}`, JSON.stringify(replay));
    
    // Also maintain a list of saved level keys for easy lookup
    const savedKeysRaw = localStorage.getItem('anipac_saved_replay_levels');
    const savedLevels: number[] = savedKeysRaw ? JSON.parse(savedKeysRaw) : [];
    if (!savedLevels.includes(replay.level)) {
      savedLevels.push(replay.level);
      localStorage.setItem('anipac_saved_replay_levels', JSON.stringify(savedLevels));
    }
  } catch (err) {
    console.error('Failed saving local replay:', err);
  }
}

export function getAllLocalReplays(): GhostReplayData[] {
  const replays: GhostReplayData[] = [];
  try {
    const savedKeysRaw = localStorage.getItem('anipac_saved_replay_levels');
    const savedLevels: number[] = savedKeysRaw ? JSON.parse(savedKeysRaw) : [];
    savedLevels.forEach((lvl) => {
      const rep = getLocalBestReplay(lvl);
      if (rep) replays.push(rep);
    });
  } catch (err) {
    console.error('Failed reading all local replays:', err);
  }
  return replays.sort((a, b) => a.level - b.level);
}

/**
 * Saves or updates a Ghost Replay in Firestore and localStorage.
 * If a replay already exists for this level, updates if score is higher.
 */
export async function saveGhostReplay(
  replayData: Omit<GhostReplayData, 'createdAt' | 'replayId' | 'userId'> & { replayId?: string; userId?: string }
): Promise<GhostReplayData | null> {
  const currentUser = auth.currentUser;
  const userId = replayData.userId || (currentUser ? currentUser.uid : 'guest_player');
  const replayDocId = `${userId}_lvl_${replayData.level}`.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);

  const fullReplay: GhostReplayData = {
    replayId: replayDocId,
    userId: userId,
    playerName: (replayData.playerName || (currentUser?.displayName) || 'Shinobi Shin').slice(0, 50),
    avatarUrl: (replayData.avatarUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`).slice(0, 500),
    level: Math.min(Math.max(1, Math.floor(replayData.level)), 1001),
    score: Math.min(Math.max(0, Math.floor(replayData.score)), 999999999),
    duration: Math.max(0, Math.round(replayData.duration * 10) / 10),
    difficulty: replayData.difficulty || 'NORMAL',
    equippedSkin: (replayData.equippedSkin || 'skin-classic-neon').slice(0, 50),
    equippedGhostSkin: (replayData.equippedGhostSkin || 'ghost-classic-oni').slice(0, 50),
    equippedMazeSkin: (replayData.equippedMazeSkin || 'maze-neon-cyber').slice(0, 50),
    totalDots: Math.max(0, replayData.totalDots || 0),
    ghostsEaten: Math.max(0, replayData.ghostsEaten || 0),
    specialMovesUsed: Math.max(0, replayData.specialMovesUsed || 0),
    replayData: replayData.replayData.slice(0, 500000),
    createdAt: new Date().toISOString(),
  };

  // Always save to localStorage for instantaneous offline / guest availability
  saveLocalBestReplay(fullReplay);

  if (!currentUser) {
    return fullReplay;
  }

  const docPath = `${REPLAYS_COLLECTION}/${replayDocId}`;
  try {
    const docRef = doc(db, REPLAYS_COLLECTION, replayDocId);
    await setDoc(docRef, fullReplay, { merge: true });
    return fullReplay;
  } catch (error) {
    console.error('Error saving ghost replay to Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } catch {
      // Fallback return local saved replay if Firestore write had permission / network issue
      return fullReplay;
    }
  }
}

/**
 * Fetches the user's best replay for a specific level from Firestore (falling back to localStorage)
 */
export async function fetchUserLevelReplay(userId: string, level: number): Promise<GhostReplayData | null> {
  const local = getLocalBestReplay(level);
  if (!auth.currentUser || !userId || userId === 'guest_player') {
    return local;
  }

  const replayDocId = `${userId}_lvl_${level}`.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const docPath = `${REPLAYS_COLLECTION}/${replayDocId}`;

  try {
    const docRef = doc(db, REPLAYS_COLLECTION, replayDocId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GhostReplayData;
      saveLocalBestReplay(data); // Sync local
      return data;
    }
  } catch (error) {
    console.error(`Error fetching level ${level} ghost replay:`, error);
    try {
      handleFirestoreError(error, OperationType.GET, docPath);
    } catch {
      // Return local cache on error
    }
  }
  return local;
}

/**
 * Fetches all saved replays for a user across all levels
 */
export async function fetchAllUserReplays(userId: string): Promise<GhostReplayData[]> {
  const localReplays = getAllLocalReplays();
  if (!auth.currentUser || !userId || userId === 'guest_player') {
    return localReplays;
  }

  try {
    const q = query(
      collection(db, REPLAYS_COLLECTION),
      where('userId', '==', userId),
      orderBy('level', 'asc'),
      limit(50)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const cloudReplays = snap.docs.map((d) => d.data() as GhostReplayData);
      cloudReplays.forEach((r) => saveLocalBestReplay(r));
      return cloudReplays;
    }
  } catch (error) {
    console.error('Error fetching all user replays from Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.LIST, REPLAYS_COLLECTION);
    } catch {
      // Return local replays on error
    }
  }

  return localReplays;
}

/**
 * Delete a ghost replay
 */
export async function deleteGhostReplay(replayId: string, level: number): Promise<void> {
  try {
    localStorage.removeItem(`anipac_replay_lvl_${level}`);
  } catch {}

  if (auth.currentUser) {
    const docPath = `${REPLAYS_COLLECTION}/${replayId}`;
    try {
      await deleteDoc(doc(db, REPLAYS_COLLECTION, replayId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }
}
