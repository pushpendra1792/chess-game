import { Pressable, StyleSheet, Text, View, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { THEME_LIST, type BoardThemeId } from '@/theme/colors';
import { useSettingsStore } from '@/store/settings-store';
import { useTheme } from '@/theme/use-theme';
import { radius, spacing } from '@/theme/colors';

function ThemeOption({ themeId, label, selected, onPress }: {
  themeId: BoardThemeId;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeOption,
        selected && styles.themeOptionSelected,
        pressed && styles.themeOptionPressed,
      ]}>
      <View
        style={[
          styles.themeSwatch,
          {
            backgroundColor:
              selected ? colors.accent : colors.surfaceMuted,
            borderColor: selected ? colors.accent : colors.border,
          },
        ]}
      />
      <Text
        style={[
          styles.themeLabel,
          selected && styles.themeLabelSelected,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const {
    boardTheme,
    soundEnabled,
    hapticsEnabled,
    showLegalMoves,
    setBoardTheme,
    setSoundEnabled,
    setHapticsEnabled,
    setShowLegalMoves,
  } = useSettingsStore();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}>
          <Text style={[styles.backText, { color: colors.text }]}>‹ Back</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Board Theme</Text>

          <View style={styles.themeGrid}>
            {THEME_LIST.map((theme) => (
              <ThemeOption
                key={theme.id}
                themeId={theme.id}
                label={theme.label}
                selected={boardTheme === theme.id}
                onPress={() => setBoardTheme(theme.id)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gameplay</Text>

          <SettingRow label="Show legal move dots">
            <Switch
              value={showLegalMoves}
              onValueChange={setShowLegalMoves}
              thumbColor={colors.switchThumb}
              trackColor={{ false: colors.switchTrackOff, true: colors.accent }}
              accessibilityLabel="Show legal move dots"
            />
          </SettingRow>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Feedback</Text>

          <SettingRow label="Sound">
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              thumbColor={colors.switchThumb}
              trackColor={{ false: colors.switchTrackOff, true: colors.accent }}
              accessibilityLabel="Sound"
            />
          </SettingRow>

          <SettingRow label="Haptics">
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              thumbColor={colors.switchThumb}
              trackColor={{ false: colors.switchTrackOff, true: colors.accent }}
              accessibilityLabel="Haptics"
            />
          </SettingRow>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.card,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    minWidth: 80,
    maxWidth: 100,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.button,
  },
  themeOptionSelected: {
    borderWidth: 2,
  },
  themeOptionPressed: {
    opacity: 0.8,
  },
  themeSwatch: {
    width: 48,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  themeLabelSelected: {
    fontWeight: '700',
  },
});