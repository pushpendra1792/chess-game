import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ChessPiece } from '@/components/chess-piece';
import type { Color, PromotionPiece } from '@/engine/chess';
import { radius, spacing, type ThemeColors } from '@/theme/colors';
import { useTheme } from '@/theme/use-theme';

type PromotionPickerProps = {
  visible: boolean;
  color: Color;
  onSelect: (piece: PromotionPiece) => void;
  onCancel: () => void;
};

const OPTIONS: { piece: PromotionPiece; label: string }[] = [
  { piece: 'q', label: 'Queen' },
  { piece: 'r', label: 'Rook' },
  { piece: 'b', label: 'Bishop' },
  { piece: 'n', label: 'Knight' },
];

export function PromotionPicker({ visible, color, onSelect, onCancel }: PromotionPickerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Cancel promotion"
          onPress={onCancel}
        />

        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title}>Promote pawn to</Text>

          <View style={styles.options}>
            {OPTIONS.map((option) => (
              <Pressable
                key={option.piece}
                accessibilityRole="button"
                accessibilityLabel={`Promote to ${option.label}`}
                onPress={() => onSelect(option.piece)}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                <ChessPiece type={option.piece} color={color} size={44} />
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [styles.cancel, pressed && styles.cancelPressed]}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      shadowColor: colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 12,
    },
    title: {
      marginBottom: spacing.md,
      fontSize: 17,
      fontWeight: '700',
      textAlign: 'center',
      color: colors.text,
    },
    options: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    option: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: 10,
      backgroundColor: colors.surfaceMuted,
    },
    optionPressed: {
      backgroundColor: colors.border,
    },
    optionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
    },
    cancel: {
      alignSelf: 'center',
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
    },
    cancelPressed: {
      opacity: 0.6,
    },
    cancelText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
    },
  });
}
