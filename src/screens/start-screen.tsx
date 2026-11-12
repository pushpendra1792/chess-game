import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Difficulty } from '@/engine/ai';
import type { Color } from '@/engine/chess';
import { useGameStore, type GameMode } from '@/store/game-store';
import { radius, spacing } from '@/theme/colors';
import { useTheme } from '@/theme/use-theme';

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const PLAYER_COLORS: { value: Color; label: string }[] = [
  { value: 'w', label: 'White' },
  { value: 'b', label: 'Black' },
];

type ChoiceProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof import('@/theme/use-theme').useTheme>['colors'];
};

function Choice({ label, selected, onPress, colors }: ChoiceProps) {
  const styles = useMemo(() => createChoiceStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected ? styles.choiceSelected : styles.choiceIdle,
        pressed && styles.choicePressed,
      ]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StartScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<GameMode>('computer');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [humanColor, setHumanColor] = useState<Color>('w');

  const startGame = useGameStore((state) => state.startGame);

  const handleStart = () => {
    startGame({ mode, difficulty, humanColor });
    router.push('/game');
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Chess</Text>
          <Text style={styles.subtitle}>Choose how you want to play.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Mode</Text>
          <View style={styles.row}>
            <Choice
              label="vs Computer"
              selected={mode === 'computer'}
              onPress={() => setMode('computer')}
              colors={colors}
            />
            <Choice
              label="Two Players"
              selected={mode === 'two-player'}
              onPress={() => setMode('two-player')}
              colors={colors}
            />
          </View>

          {mode === 'computer' ? (
            <>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.row}>
                {DIFFICULTIES.map((option) => (
                  <Choice
                    key={option.value}
                    label={option.label}
                    selected={difficulty === option.value}
                    onPress={() => setDifficulty(option.value)}
                    colors={colors}
                  />
                ))}
              </View>

              <Text style={styles.label}>Play as</Text>
              <View style={styles.row}>
                {PLAYER_COLORS.map((option) => (
                  <Choice
                    key={option.value}
                    label={option.label}
                    selected={humanColor === option.value}
                    onPress={() => setHumanColor(option.value)}
                    colors={colors}
                  />
                ))}
              </View>
            </>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start game"
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}>
            <Text style={styles.startText}>Start Game</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={12}
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}>
            <Text style={styles.settingsText}>Settings</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createChoiceStyles(colors: ReturnType<typeof import('@/theme/use-theme').useTheme>['colors']) {
  return StyleSheet.create({
    choice: {
      flex: 1,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: radius.button,
    },
    choiceIdle: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    choiceSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    choicePressed: {
      opacity: 0.75,
    },
    choiceText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    choiceTextSelected: {
      color: colors.accentText,
    },
  });
}

function createStyles(colors: ReturnType<typeof import('@/theme/use-theme').useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing.xl,
      padding: spacing.lg,
    },
    hero: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    title: {
      fontSize: 40,
      fontWeight: '700',
      letterSpacing: -1,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    card: {
      gap: spacing.sm,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.surface,
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    label: {
      marginTop: spacing.sm,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    startButton: {
      marginTop: spacing.md,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.button,
      backgroundColor: colors.accent,
    },
    startButtonPressed: {
      backgroundColor: colors.accentPressed,
    },
    startText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accentText,
    },
    settingsButton: {
      marginTop: spacing.sm,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    settingsButtonPressed: {
      backgroundColor: colors.surfaceMuted,
    },
    settingsText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });
}