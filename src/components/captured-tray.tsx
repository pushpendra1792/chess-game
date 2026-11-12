import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChessPiece } from '@/components/chess-piece';
import type { Color, PieceSymbol } from '@/engine/chess';
import { radius, spacing, type ThemeColors } from '@/theme/colors';
import { useTheme } from '@/theme/use-theme';

type CapturedTrayProps = {
  label: string;
  playerColor: Color;
  capturedColor: Color;
  pieces: PieceSymbol[];
  width: number;
};

export function CapturedTray({
  label,
  playerColor,
  capturedColor,
  pieces,
  width,
}: CapturedTrayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.tray, { width }]}>
      <View style={styles.labelGroup}>
        <View
          style={[
            styles.swatch,
            {
              backgroundColor:
                playerColor === 'w' ? colors.whitePiece : colors.blackPiece,
              borderColor:
                playerColor === 'w' ? colors.whitePieceStroke : colors.blackPieceStroke,
            },
          ]}
        />
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.pieces}>
        {pieces.length === 0 ? (
          <Text style={styles.empty}>No captures</Text>
        ) : (
          pieces.map((piece, index) => (
            <ChessPiece
              key={`${piece}-${index}`}
              type={piece}
              color={capturedColor}
              size={19}
            />
          ))
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    tray: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 32,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      backgroundColor: colors.surface,
    },
    labelGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    swatch: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    pieces: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 1,
    },
    empty: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });
}
