import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme/colors';

type GameOverModalProps = {
  visible: boolean;
  result: string;
  onNewGame: () => void;
  onViewBoard: () => void;
};

export function GameOverModal({
  visible,
  result,
  onNewGame,
  onViewBoard,
}: GameOverModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onViewBoard}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="View board"
          onPress={onViewBoard}
        />

        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.kicker}>Game over</Text>
          <Text style={styles.result}>{result}</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View the final board"
              onPress={onViewBoard}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}>
              <Text style={styles.secondaryButtonText}>View Board</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start a new game"
              onPress={onNewGame}
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>New Game</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.backdrop,
  },
  card: {
    width: '86%',
    maxWidth: 340,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  kicker: {
    marginBottom: spacing.xs,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  result: {
    marginBottom: spacing.lg,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  primaryButtonPressed: {
    backgroundColor: colors.accentPressed,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentText,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
