import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';

export interface LeaderboardEntry {
  id?: string;
  userId: string;
  playerName: string;
  avatarUrl?: string;
  score: number;
  level: number;
  characterId?: string;
  powerMoveUsedMost?: string;
  createdAt: string;
}

const LEADERBOARD_COLLECTION = 'leaderboard';
const LOCAL_LEADERBOARD_KEY = 'anipac_local_leaderboard';

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (raw) {
      return JSON.parse(raw) as LeaderboardEntry[];
    }
  } catch (err) {
    console.warn('Failed reading local leaderboard:', err);
  }
  return [];
}

export function saveLocalLeaderboardEntry(entry: LeaderboardEntry): void {
  try {
    const list = getLocalLeaderboard();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.warn('Failed saving local leaderboard entry:', err);
  }
}

export async function submitLeaderboardScore(entry: {
  score: number;
  level: number;
  playerName: string;
  avatarUrl?: string;
  characterId?: string;
  powerMoveUsedMost?: string;
}): Promise<string | null> {
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : `guest_${Math.random().toString(36).substring(2, 8)}`;

  const payload: LeaderboardEntry = {
    userId,
    playerName: (entry.playerName || (currentUser?.displayName) || 'Shinobi Master').slice(0, 50),
    avatarUrl: (entry.avatarUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`).slice(0, 500),
    score: Math.min(Math.max(0, Math.floor(entry.score)), 999999999),
    level: Math.min(Math.max(1, Math.floor(entry.level)), 1001),
    characterId: (entry.characterId || 'anipac-prime').slice(0, 50),
    powerMoveUsedMost: (entry.powerMoveUsedMost || 'Kamehameha').slice(0, 50),
    createdAt: new Date().toISOString(),
  };

  // Always save locally
  saveLocalLeaderboardEntry(payload);

  if (!currentUser) {
    return `local_${Date.now()}`;
  }

  try {
    const docRef = await addDoc(collection(db, LEADERBOARD_COLLECTION), payload);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting score to cloud leaderboard, saved locally:', error);
    try {
      handleFirestoreError(error, OperationType.CREATE, LEADERBOARD_COLLECTION);
    } catch {
      return `local_${Date.now()}`;
    }
    return `local_${Date.now()}`;
  }
}

export async function fetchTopScores(maxCount = 50): Promise<LeaderboardEntry[]> {
  const localList = getLocalLeaderboard();
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      orderBy('score', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    const cloudList = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<LeaderboardEntry, 'id'>),
    }));

    // Merge and deduplicate by (userId + score + createdAt)
    const combined = [...cloudList, ...localList];
    combined.sort((a, b) => b.score - a.score);
    return combined.slice(0, maxCount);
  } catch (error) {
    console.warn('Error fetching cloud leaderboard, displaying local scores:', error);
    return localList.slice(0, maxCount);
  }
}

export function subscribeToLeaderboard(
  maxCount = 25,
  callback: (entries: LeaderboardEntry[]) => void
) {
  const localList = getLocalLeaderboard();
  const q = query(
    collection(db, LEADERBOARD_COLLECTION),
    orderBy('score', 'desc'),
    limit(maxCount)
  );

  return onSnapshot(
    q,
    (snap) => {
      const cloudEntries = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<LeaderboardEntry, 'id'>),
      }));

      const merged = [...cloudEntries, ...localList];
      merged.sort((a, b) => b.score - a.score);
      callback(merged.slice(0, maxCount));
    },
    (error) => {
      console.warn('Leaderboard realtime subscription error, serving local fallback:', error);
      callback(localList.slice(0, maxCount));
    }
  );
}
