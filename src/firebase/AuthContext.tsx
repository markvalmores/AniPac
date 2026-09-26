import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { DailyMission, GameDifficulty, RenderPerspective, ShonenPowerType } from '../game/types';
import { generateDailyMissions } from '../game/constants';

export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  highScore: number;
  maxLevelReached: number;
  totalGhostsEaten: number;
  specialMovesUsed: number;
  favoriteTheme: string;
  pacCoins: number;
  equippedSkin: string;
  equippedGhostSkin: string;
  equippedMazeSkin: string;
  equippedPowers: ShonenPowerType[];
  unlockedItems: string[];
  dailyMissionsDate?: string;
  dailyMissionsData?: string;
  selectedDifficulty?: GameDifficulty;
  renderPerspective?: RenderPerspective;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  dailyMissions: DailyMission[];
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (customName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateStats: (score: number, level: number, ghostsEaten: number, specialMoves: number, coinsEarned?: number) => Promise<void>;
  setFavoriteTheme: (theme: string) => Promise<void>;
  equipSkin: (type: 'PAC' | 'GHOST' | 'MAZE', skinId: string) => Promise<void>;
  equipPowerMove: (slotIndex: number, powerId: ShonenPowerType) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  unlockGachaItems: (itemIds: string[], coinsCost: number) => Promise<void>;
  claimDailyMissionReward: (missionId: string) => Promise<void>;
  updateMissionProgress: (category: 'DOTS' | 'GHOSTS' | 'POWERS' | 'STAGES' | 'SCORE' | 'DIFFICULTY', amount: number) => void;
  setDifficulty: (diff: GameDifficulty) => Promise<void>;
  setPerspective: (persp: RenderPerspective) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_PROFILE_STORAGE_KEY = 'anipac_guest_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);

  const todayKey = new Date().toISOString().split('T')[0];

  const getOrCreateGuestProfile = (customName?: string): UserProfile => {
    try {
      const saved = localStorage.getItem(GUEST_PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserProfile;
        if (customName && customName.trim()) {
          parsed.displayName = customName.trim().slice(0, 50);
          localStorage.setItem(GUEST_PROFILE_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading local guest profile:', e);
    }

    const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
    const guestName = customName?.trim() || `Shinobi_${guestId.slice(-4)}`;
    const freshMissions = generateDailyMissions(todayKey);

    const defaultProfile: UserProfile = {
      userId: guestId,
      displayName: guestName.slice(0, 50),
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
      highScore: 0,
      maxLevelReached: 1,
      totalGhostsEaten: 0,
      specialMovesUsed: 0,
      favoriteTheme: 'tokyo-neon',
      pacCoins: 500, // Starting Gacha Coins!
      equippedSkin: 'skin-classic-neon',
      equippedGhostSkin: 'ghost-classic-oni',
      equippedMazeSkin: 'maze-neon-cyber',
      equippedPowers: ['SUPER_SAIYAN', 'KAMEHAMEHA', 'DOMAIN_EXPANSION', 'BANKAI_SLASH', 'RASENGAN_VACUUM', 'GEAR_5_BOUNCE'],
      unlockedItems: [
        'skin-classic-neon', 
        'ghost-classic-oni', 
        'maze-neon-cyber', 
        'SUPER_SAIYAN', 
        'KAMEHAMEHA', 
        'DOMAIN_EXPANSION', 
        'BANKAI_SLASH', 
        'RASENGAN_VACUUM', 
        'GEAR_5_BOUNCE'
      ],
      dailyMissionsDate: todayKey,
      dailyMissionsData: JSON.stringify(freshMissions),
      selectedDifficulty: 'NORMAL',
      renderPerspective: '2D_NEON',
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(GUEST_PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
    } catch {}

    return defaultProfile;
  };

  const saveLocalGuestProfile = (updatedProfile: UserProfile) => {
    try {
      localStorage.setItem(GUEST_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn('Failed saving guest profile locally:', e);
    }
  };

  const initGuestMissions = () => {
    const saved = localStorage.getItem(`anipac_missions_${todayKey}`);
    if (saved) {
      try {
        setDailyMissions(JSON.parse(saved));
        return;
      } catch {}
    }
    const generated = generateDailyMissions(todayKey);
    setDailyMissions(generated);
    try {
      localStorage.setItem(`anipac_missions_${todayKey}`, JSON.stringify(generated));
    } catch {}
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        const guest = getOrCreateGuestProfile();
        setProfile(guest);
        initGuestMissions();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (currentUser: User) => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // Check daily missions date reset
        if (data.dailyMissionsDate !== todayKey || !data.dailyMissionsData) {
          const freshMissions = generateDailyMissions(todayKey);
          const updated: Partial<UserProfile> = {
            dailyMissionsDate: todayKey,
            dailyMissionsData: JSON.stringify(freshMissions),
            updatedAt: new Date().toISOString(),
          };
          await updateDoc(userDocRef, updated);
          setProfile({ ...data, ...updated });
          setDailyMissions(freshMissions);
        } else {
          setProfile(data);
          try {
            setDailyMissions(JSON.parse(data.dailyMissionsData));
          } catch {
            setDailyMissions(generateDailyMissions(todayKey));
          }
        }
      } else {
        // Initial new user profile with 500 starting Pac-Coins for gacha!
        const initialName = currentUser.displayName || `Shinobi_${currentUser.uid.slice(0, 5)}`;
        const freshMissions = generateDailyMissions(todayKey);
        const newProfile: UserProfile = {
          userId: currentUser.uid,
          displayName: initialName.slice(0, 50),
          photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
          highScore: 0,
          maxLevelReached: 1,
          totalGhostsEaten: 0,
          specialMovesUsed: 0,
          favoriteTheme: 'tokyo-neon',
          pacCoins: 500, // Starting Gacha Coins!
          equippedSkin: 'skin-classic-neon',
          equippedGhostSkin: 'ghost-classic-oni',
          equippedMazeSkin: 'maze-neon-cyber',
          equippedPowers: ['SUPER_SAIYAN', 'KAMEHAMEHA', 'DOMAIN_EXPANSION', 'BANKAI_SLASH', 'RASENGAN_VACUUM', 'GEAR_5_BOUNCE'],
          unlockedItems: [
            'skin-classic-neon', 
            'ghost-classic-oni', 
            'maze-neon-cyber', 
            'SUPER_SAIYAN', 
            'KAMEHAMEHA', 
            'DOMAIN_EXPANSION', 
            'BANKAI_SLASH', 
            'RASENGAN_VACUUM', 
            'GEAR_5_BOUNCE'
          ],
          dailyMissionsDate: todayKey,
          dailyMissionsData: JSON.stringify(freshMissions),
          selectedDifficulty: 'NORMAL',
          renderPerspective: '2D_NEON',
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
        setDailyMissions(freshMissions);
      }
    } catch (error) {
      console.warn('Error loading profile from cloud, falling back to local:', error);
      const guest = getOrCreateGuestProfile();
      setProfile(guest);
      initGuestMissions();
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await loadUserProfile(result.user);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInAsGuest = async (customName?: string) => {
    // First update or create local guest profile immediately
    const guest = getOrCreateGuestProfile(customName);
    setProfile(guest);

    // Try optional anonymous Firebase auth (if enabled on project), but gracefully ignore if restricted
    try {
      const result = await signInAnonymously(auth);
      if (result.user) {
        const fallbackName = customName || guest.displayName;
        const userDocRef = doc(db, 'users', result.user.uid);
        const freshMissions = generateDailyMissions(todayKey);
        const newProfile: UserProfile = {
          ...guest,
          userId: result.user.uid,
          displayName: fallbackName.slice(0, 50),
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`,
          dailyMissionsDate: todayKey,
          dailyMissionsData: JSON.stringify(freshMissions),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      // Anonymous authentication may be disabled in the Firebase console (auth/admin-restricted-operation).
      // This is expected and normal — guest mode will use local persistence.
      console.info('Guest mode active locally (cloud anonymous auth not configured).');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      const guest = getOrCreateGuestProfile();
      setProfile(guest);
      initGuestMissions();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateStats = async (
    score: number, 
    level: number, 
    ghostsEaten: number, 
    specialMoves: number,
    coinsEarned = 0
  ) => {
    if (!profile) return;
    const newHighScore = Math.max(profile.highScore, score);
    const newMaxLevel = Math.max(profile.maxLevelReached, level);
    const updated: UserProfile = {
      ...profile,
      highScore: newHighScore,
      maxLevelReached: newMaxLevel,
      totalGhostsEaten: (profile.totalGhostsEaten || 0) + ghostsEaten,
      specialMovesUsed: (profile.specialMovesUsed || 0) + specialMoves,
      pacCoins: (profile.pacCoins || 0) + coinsEarned,
      updatedAt: new Date().toISOString(),
    };

    setProfile(updated);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          highScore: newHighScore,
          maxLevelReached: newMaxLevel,
          totalGhostsEaten: updated.totalGhostsEaten,
          specialMovesUsed: updated.specialMovesUsed,
          pacCoins: updated.pacCoins,
          updatedAt: updated.updatedAt,
        });
      } catch (error) {
        console.error('Error updating stats to cloud:', error);
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      saveLocalGuestProfile(updated);
    }
  };

  const setFavoriteTheme = async (theme: string) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      favoriteTheme: theme.slice(0, 50),
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          favoriteTheme: theme.slice(0, 50),
          updatedAt: updated.updatedAt,
        });
      } catch (error) {
        console.error('Error saving theme:', error);
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      saveLocalGuestProfile(updated);
    }
  };

  const equipSkin = async (type: 'PAC' | 'GHOST' | 'MAZE', skinId: string) => {
    if (!profile) return;
    const key = type === 'PAC' ? 'equippedSkin' : type === 'GHOST' ? 'equippedGhostSkin' : 'equippedMazeSkin';
    const updated: UserProfile = {
      ...profile,
      [key]: skinId,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          [key]: skinId,
          updatedAt: updated.updatedAt,
        });
      } catch (error) {
        console.error('Error equipping skin:', error);
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      saveLocalGuestProfile(updated);
    }
  };

  const equipPowerMove = async (slotIndex: number, powerId: ShonenPowerType) => {
    if (!profile) return;
    const currentList = [...(profile.equippedPowers || [])];
    currentList[slotIndex] = powerId;
    const updated: UserProfile = {
      ...profile,
      equippedPowers: currentList,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          equippedPowers: currentList,
          updatedAt: updated.updatedAt,
        });
      } catch (error) {
        console.error('Error equipping power move:', error);
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      saveLocalGuestProfile(updated);
    }
  };

  const addCoins = async (amount: number) => {
    if (!profile) return;
    const newCoins = Math.max(0, (profile.pacCoins || 0) + amount);
    const updated: UserProfile = {
      ...profile,
      pacCoins: newCoins,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          pacCoins: newCoins,
          updatedAt: updated.updatedAt,
        });
      } catch (error) {
        console.error('Error adding coins:', error);
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      saveLocalGuestProfile(updated);
    }
  };

  const unlockGachaItems = async (itemIds: string[], coinsCost: number) => {
    if (!profile) return;
    const existing = new Set(profile.unlockedItems || []);
    itemIds.forEach((id) => existing.add(id));
    const newUnlocked = Array.from(existing);
    const newCoins = Math.max(0, (profile.pacCoins || 0) - coinsCost);

    const updated: UserProfile = {
      ...profile,
      unlockedItems: newUnlocked,
      pacCoins: newCoins,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          unlockedItems: newUnlocked,
          pacCoins: newCoins,
          updatedAt: updated.updatedAt,
        });
      } catch (error) {
        console.error('Error unlocking gacha items:', error);
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      saveLocalGuestProfile(updated);
    }
  };

  const updateMissionProgress = (
    category: 'DOTS' | 'GHOSTS' | 'POWERS' | 'STAGES' | 'SCORE' | 'DIFFICULTY', 
    amount: number
  ) => {
    setDailyMissions((prev) => {
      let changed = false;
      const updated = prev.map((m) => {
        if (m.category === category && !m.completed) {
          const newProgress = Math.min(m.targetCount, m.currentProgress + amount);
          const isDone = newProgress >= m.targetCount;
          if (newProgress !== m.currentProgress) changed = true;
          return {
            ...m,
            currentProgress: newProgress,
            completed: isDone,
          };
        }
        return m;
      });

      if (changed) {
        try {
          localStorage.setItem(`anipac_missions_${todayKey}`, JSON.stringify(updated));
        } catch {}

        if (user && profile) {
          updateDoc(doc(db, 'users', user.uid), {
            dailyMissionsData: JSON.stringify(updated),
            updatedAt: new Date().toISOString(),
          }).catch(console.error);
        } else if (profile) {
          const updatedGuest: UserProfile = {
            ...profile,
            dailyMissionsData: JSON.stringify(updated),
            updatedAt: new Date().toISOString(),
          };
          saveLocalGuestProfile(updatedGuest);
        }
      }
      return updated;
    });
  };

  const claimDailyMissionReward = async (missionId: string) => {
    const mission = dailyMissions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed || !profile) return;

    const updatedMissions = dailyMissions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m
    );
    setDailyMissions(updatedMissions);
    try {
      localStorage.setItem(`anipac_missions_${todayKey}`, JSON.stringify(updatedMissions));
    } catch {}

    const newCoins = (profile.pacCoins || 0) + mission.rewardCoins;
    const updatedProfile: UserProfile = {
      ...profile,
      pacCoins: newCoins,
      dailyMissionsData: JSON.stringify(updatedMissions),
      updatedAt: new Date().toISOString(),
    };
    setProfile(updatedProfile);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          pacCoins: newCoins,
          dailyMissionsData: JSON.stringify(updatedMissions),
          updatedAt: updatedProfile.updatedAt,
        });
      } catch (err) {
        console.error('Error claiming reward:', err);
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      saveLocalGuestProfile(updatedProfile);
    }
  };

  const setDifficulty = async (diff: GameDifficulty) => {
    if (!profile) return;
    const updated = { ...profile, selectedDifficulty: diff, updatedAt: new Date().toISOString() };
    setProfile(updated);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          selectedDifficulty: diff,
          updatedAt: updated.updatedAt,
        });
      } catch (err) {
        console.error('Error setting difficulty in cloud:', err);
      }
    } else {
      saveLocalGuestProfile(updated);
    }
  };

  const setPerspective = async (persp: RenderPerspective) => {
    if (!profile) return;
    const updated = { ...profile, renderPerspective: persp, updatedAt: new Date().toISOString() };
    setProfile(updated);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          renderPerspective: persp,
          updatedAt: updated.updatedAt,
        });
      } catch (err) {
        console.error('Error setting perspective in cloud:', err);
      }
    } else {
      saveLocalGuestProfile(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        dailyMissions,
        signInWithGoogle,
        signInAsGuest,
        logout,
        updateStats,
        setFavoriteTheme,
        equipSkin,
        equipPowerMove,
        addCoins,
        unlockGachaItems,
        claimDailyMissionReward,
        updateMissionProgress,
        setDifficulty,
        setPerspective,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
