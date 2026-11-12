import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CapturedTray } from '@/components/captured-tray';
import { ChessBoard } from '@/components/chess-board';
import { GameOverModal } from '@/components/game-over-modal';
import { MoveList } from '@/components/move-list';
import { PromotionPicker } from '@/components/promotion-picker';
import type { Square } from '@/engine/chess';
import { useGameFeedback } from '@/hooks/use-game-feedback';
import { useGameStore } from '@/store/game-store';
import { useSettingsStore } from '@/store/settings-store';
import { radius, spacing } from '@/theme/colors';
import { useTheme } from '@/theme/use-theme';

const SCREEN_PADDING = spacing.lg;
const VERTICAL_CHROME = 340;
const FALLBACK_BOARD_SIZE = 300;
/** Wait for the board's slide animation before the computer searches. */
const COMPUTER_MOVE_DELAY = 260;

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
  const mode = useGameStore((state) => state.mode);
  const humanColor = useGameStore((state) => state.humanColor);
  const isComputerThinking = useGameStore((state) => state.isComputerThinking);

  const tapSquare = useGameStore((state) => state.tapSquare);
  const selectSquare = useGameStore((state) => state.selectSquare);
  const dropSquare = useGameStore((state) => state.dropSquare);
  const cancelSelection = useGameStore((state) => state.cancelSelection);
  const undo = useGameStore((state) => state.undo);
  const newGame = useGameStore((state) => state.newGame);
  const promote = useGameStore((state) => state.promote);
  const cancelPromotion = useGameStore((state) => state.cancelPromotion);
  const playComputerMove = useGameStore((state) => state.playComputerMove);

  const showLegalMoves = useSettingsStore((state) => state.showLegalMoves);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useGameFeedback();

  const statusColor =
    status.kind === 'check'
      ? colors.check
      : status.kind === 'playing'
        ? colors.text
        : colors.accent;

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
  const isComputerTurn = mode === 'computer' && turn !== humanColor;
  const disabled = status.isOver || pendingPromotion !== null || isComputerTurn;
  const canUndo =
    history.length > 0 && !isComputerThinking && (!isComputerTurn || status.isOver);
  const showGameOver = status.isOver && dismissedFen !== fen;

  // Let the move animation finish before the engine starts searching.
  useEffect(() => {
    if (!isComputerTurn || status.isOver) {
      return;
    }

    const timer = setTimeout(() => {
      void playComputerMove();
    }, COMPUTER_MOVE_DELAY);

    return () => clearTimeout(timer);
  }, [isComputerTurn, playComputerMove, status.isOver]);

  const startNewGame = () => {
    setDismissedFen(null);
    newGame();
  };

  const handleUndo = () => {
    setDismissedFen(null);
    undo();
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content} onLayout={handleContentLayout}>
          <View style={[styles.header, { width: boardSize }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to start screen"
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed,
              ]}>
              <Text style={styles.menuText}>‹ Menu</Text>
            </Pressable>

            <View style={styles.turnBadge}>
              {isComputerThinking ? (
                <>
                  <ActivityIndicator size="small" color={colors.textMuted} />
                  <Text style={styles.turnText}>Thinking…</Text>
                </>
              ) : (
                <>
                  <View
                    style={[
                      styles.turnDot,
                      {
                        backgroundColor:
                          turn === 'w' ? colors.whitePiece : colors.blackPiece,
                        borderColor:
                          turn === 'w'
                            ? colors.whitePieceStroke
                            : colors.blackPieceStroke,
                      },
                    ]}
                  />
                  <Text style={styles.turnText}>{turnLabel}</Text>
                </>
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              hitSlop={8}
              onPress={() => router.push('/settings')}
              style={({ pressed }) => [
                styles.settingsButton,
                pressed && styles.settingsButtonPressed,
              ]}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </Pressable>
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
              showLegalMoves={showLegalMoves}
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

function createStyles(colors: ReturnType<typeof import('@/theme/use-theme').useTheme>['colors']) {
  return StyleSheet.create({
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
    menuButton: {
      paddingVertical: spacing.xs,
      paddingRight: spacing.sm,
    },
    menuButtonPressed: {
      opacity: 0.6,
    },
    menuText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textMuted,
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
    settingsButton: {
      padding: spacing.xs,
    },
    settingsButtonPressed: {
      opacity: 0.6,
    },
    settingsIcon: {
      fontSize: 20,
      color: colors.textMuted,
    },
  });
}
