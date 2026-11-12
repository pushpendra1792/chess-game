import { THEMES, type ThemeDefinition } from '@/theme/colors';
import { useSettingsStore } from '@/store/settings-store';

/** The active theme, driven by the persisted board-theme setting. */
export function useTheme(): ThemeDefinition {
  const boardTheme = useSettingsStore((state) => state.boardTheme);
  return THEMES[boardTheme] ?? THEMES.classic;
}
