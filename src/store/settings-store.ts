import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BoardThemeId } from '@/theme/colors';

export type SettingsState = {
  boardTheme: BoardThemeId;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showLegalMoves: boolean;
  setBoardTheme: (boardTheme: BoardThemeId) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setShowLegalMoves: (enabled: boolean) => void;
};

/**
 * Preferences live outside the game store because they survive games and are
 * persisted to the device. AsyncStorage keeps them across app launches.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      boardTheme: 'classic',
      soundEnabled: true,
      hapticsEnabled: true,
      showLegalMoves: true,

      setBoardTheme: (boardTheme) => set({ boardTheme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setShowLegalMoves: (showLegalMoves) => set({ showLegalMoves }),
    }),
    {
      name: 'chess-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        boardTheme: state.boardTheme,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        showLegalMoves: state.showLegalMoves,
      }),
    }
  )
);

/** True once the persisted settings have been read from AsyncStorage. */
export function useSettingsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useSettingsStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // If already hydrated, the callback fires synchronously, so we don't need
    // a separate check. The initial false state covers the brief moment before.
    return unsubscribe;
  }, []);

  return hydrated;
}
