import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CapturedTray } from '@/components/captured-tray';
import { ChessBoard } from '@/components/chess-board';
import { GameOverModal } from '@/components/game-over-modal';
import { MoveList } from '@/components/move-list';
import { PromotionPicker } from '@/components/promotion-picker';
import type { Square } from '@/engine/chess';
import { useGameStore } from '@/store/game-store';
import { colors, radius, spacing } from '@/theme/colors';

const SCREEN_PADDING = spacing.lg;
const VERTICAL_CHROME = 340;
const FALLBACK_BOARD_SIZE = 300;

export function GameScreen() {
  const [boardSize, setBoardSize] = useState(FALLBACK_BOARD_SIZE);
  const [dismissedFen, setDismissedFen] = useState<string | null>(null);

  const board = useGameStore((state) => state.board);
  const turn = useGameStore((state) => state.turn);
  const selectedSquare = useGameStore((state) => state.selectedSquare);
  const legalMoves = useGameStore((state) => state.legalMoves);
  const lastMove = useGameStore((state) => state.lastMove);
  const checkSquare = useGameStore((state) => state.checkSquare);
  const moveCount = useGameStore((state) => state.moveCount);
  const history = useGameStore((state) => state.history);
  const captured = useGameStore((state) => state.captured);
  const status = useGameStore((state) => state.status);
  const fen = useGameStore((state) => state.fen);
  const pendingPromotion = useGameStore((state) => state.pendingPromotion);

  const tapSquare = useGameStore((state) => state.tapSquare);
  const selectSquare = useGameStore((state) => state.selectSquare);
  const dropSquare = useGameStore((state) => state.dropSquare);
  const cancelSelection = useGameStore((state) => state.cancelSelection);
  const undo = useGameStore((state) => state.undo);
  const newGame = useGameStore((state) => state.newGame);
  const promote = useGameStore((state) => state.promote);
  const cancelPromotion = useGameStore((state) => state.cancelPromotion);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const { width: contentWidth, height: contentHeight } = event.nativeEvent.layout;
    const availableWidth = contentWidth - SCREEN_PADDING * 2;
    const availableHeight = contentHeight - VERTICAL_CHROME;
    const nextSize = Math.max(200, Math.floor(Math.min(availableWidth, availableHeight)));

    setBoardSize(nextSize);
  };

  // Read the store at drop time so a fast drag never sees stale legal moves.
  const isDropLegal = (from: Square, to: Square) => {
    const state = useGameStore.getState();
    return state.selectedSquare === from && state.legalMoves.includes(to);
  };

  const turnLabel = turn === 'w' ? 'White' : 'Black';
  const disabled = status.isOver || pendingPromotion !== null;
  const canUndo = history.length > 0;
  const showGameOver = status.isOver && dismissedFen !== fen;

  const startNewGame = () => {
    setDismissedFen(null);
    newGame();
  };

  const handleUndo = () => {
    setDismissedFen(null);
    undo();
  };

  const statusColor =
    status.kind === 'check'
      ? colors.check
      : status.kind === 'playing'
        ? colors.text
        : colors.accent;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content} onLayout={handleContentLayout}>
          <View style={[styles.header, { width: boardSize }]}>
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

          <CapturedTray
            label="Black took"
            playerColor="b"
            capturedColor="w"
            pieces={captured.b}
            width={boardSize}
          />

          <View style={[styles.boardFrame, { width: boardSize, height: boardSize }]}>
            <ChessBoard
              size={boardSize}
              board={board}
              turn={turn}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              checkSquare={checkSquare}
              moveCount={moveCount}
              disabled={disabled}
              onSquarePress={tapSquare}
              onSelectSquare={selectSquare}
              onDropSquare={dropSquare}
              onCancelSelection={cancelSelection}
              isDropLegal={isDropLegal}
            />
          </View>

          <CapturedTray
            label="White took"
            playerColor="w"
            capturedColor="b"
            pieces={captured.w}
            width={boardSize}
          />

          <Text style={[styles.status, { color: statusColor }]}>{status.message}</Text>

          <MoveList moves={history} width={boardSize} />

          <View style={[styles.actions, { width: boardSize }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Undo last move"
              disabled={!canUndo}
              onPress={handleUndo}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
                !canUndo && styles.buttonDisabled,
              ]}>
              <Text style={[styles.secondaryButtonText, !canUndo && styles.buttonTextDisabled]}>
                Undo
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start a new game"
              onPress={startNewGame}
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>New Game</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <PromotionPicker
        visible={pendingPromotion !== null}
        color={turn}
        onSelect={promote}
        onCancel={cancelPromotion}
      />

      <GameOverModal
        visible={showGameOver}
        result={status.message}
        onNewGame={startNewGame}
        onViewBoard={() => setDismissedFen(fen)}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.text,
  },
  turnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
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
    zIndex: 10,
    borderRadius: radius.board,
    backgroundColor: colors.boardLight,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  status: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
});
