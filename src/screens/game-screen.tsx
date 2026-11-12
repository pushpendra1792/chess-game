import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChessBoard } from '@/components/chess-board';
import { useGameStore } from '@/store/game-store';
import { colors, radius, spacing } from '@/theme/colors';

const SCREEN_PADDING = spacing.lg;
const VERTICAL_CHROME = 250;

export function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const board = useGameStore((state) => state.board);
  const turn = useGameStore((state) => state.turn);
  const selectedSquare = useGameStore((state) => state.selectedSquare);
  const legalMoves = useGameStore((state) => state.legalMoves);
  const lastMove = useGameStore((state) => state.lastMove);
  const status = useGameStore((state) => state.status);
  const tapSquare = useGameStore((state) => state.tapSquare);
  const newGame = useGameStore((state) => state.newGame);

  const availableWidth = width - SCREEN_PADDING * 2;
  const availableHeight = height - insets.top - insets.bottom - VERTICAL_CHROME;
  const boardSize = Math.floor(Math.min(availableWidth, Math.max(200, availableHeight)));

  const turnLabel = turn === 'w' ? 'White' : 'Black';
  const statusColor =
    status.kind === 'check'
      ? colors.check
      : status.kind === 'playing'
        ? colors.text
        : colors.accent;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Chess</Text>

            <View style={styles.turnBadge}>
              <View
                style={[
                  styles.turnDot,
                  {
                    backgroundColor: turn === 'w' ? colors.whitePiece : colors.blackPiece,
                    borderColor:
                      turn === 'w' ? colors.whitePieceStroke : colors.blackPieceStroke,
                  },
                ]}
              />
              <Text style={styles.turnText}>{turnLabel}</Text>
            </View>
          </View>

          <View style={[styles.boardFrame, { width: boardSize, height: boardSize }]}>
            <ChessBoard
              size={boardSize}
              board={board}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              onSquarePress={tapSquare}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.status, { color: statusColor }]}>{status.message}</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start a new game"
              onPress={newGame}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
              <Text style={styles.buttonText}>New Game</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.text,
  },
  turnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  turnDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  turnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  boardFrame: {
    alignSelf: 'center',
    borderRadius: radius.board,
    backgroundColor: colors.boardLight,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    minWidth: 180,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.button,
    backgroundColor: colors.accent,
  },
  buttonPressed: {
    backgroundColor: colors.accentPressed,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentText,
  },
});
