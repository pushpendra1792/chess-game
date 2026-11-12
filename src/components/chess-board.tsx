/* eslint-disable react-hooks/immutability, react-hooks/refs -- Reanimated shared values are deliberately mutable, and gesture callbacks read the latest board values from refs outside of render. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ChessPiece } from '@/components/chess-piece';
import {
  squareAt,
  squareToRowColumn,
  type BoardGrid,
  type BoardPiece,
  type Color,
  type LastMove,
  type PieceSymbol,
  type Square,
} from '@/engine/chess';
import type { ThemeColors } from '@/theme/colors';
import { useTheme } from '@/theme/use-theme';

type ChessBoardProps = {
  size: number;
  board: BoardGrid;
  turn: Color;
  selectedSquare: Square | null;
  legalMoves: Square[];
  showLegalMoves: boolean;
  lastMove: LastMove | null;
  checkSquare: Square | null;
  moveCount: number;
  disabled: boolean;
  onSquarePress: (square: Square) => void;
  onSelectSquare: (square: Square) => void;
  onDropSquare: (square: Square) => void;
  onCancelSelection: () => void;
  isDropLegal: (from: Square, to: Square) => boolean;
};

type DragState = {
  from: Square;
  piece: BoardPiece;
};

const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

const SLIDE_DURATION = 190;
const DROP_DURATION = 90;
const SNAP_BACK_DURATION = 160;

export function ChessBoard({
  size,
  board,
  turn,
  selectedSquare,
  legalMoves,
  showLegalMoves,
  lastMove,
  checkSquare,
  moveCount,
  disabled,
  onSquarePress,
  onSelectSquare,
  onDropSquare,
  onCancelSelection,
  isDropLegal,
}: ChessBoardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const cellSize = size / 8;
  const pieceSize = cellSize * 0.86;
  const dotSize = Math.max(6, Math.round(cellSize * 0.26));
  const ringInset = Math.max(2, Math.round(cellSize * 0.07));
  const legalSet = new Set(legalMoves);

  const [drag, setDrag] = useState<DragState | null>(null);

  const boardRef = useRef(board);
  const turnRef = useRef(turn);
  const disabledRef = useRef(disabled);
  const dragRef = useRef<DragState | null>(null);
  const suppressMoveRef = useRef<LastMove | null>(null);
  const previousMoveCountRef = useRef(moveCount);

  useEffect(() => {
    boardRef.current = board;
    turnRef.current = turn;
    disabledRef.current = disabled;
  }, [board, turn, disabled]);

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const grabX = useSharedValue(0);
  const grabY = useSharedValue(0);

  const slideX = useSharedValue(0);
  const slideY = useSharedValue(0);
  const slideActive = useSharedValue(0);

  const rookSlideX = useSharedValue(0);
  const rookSlideY = useSharedValue(0);
  const rookSlideActive = useSharedValue(0);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
  }));

  const slideStyle = useAnimatedStyle(() => ({
    opacity: slideActive.value,
    transform: [{ translateX: slideX.value }, { translateY: slideY.value }],
  }));

  const slideCoverStyle = useAnimatedStyle(() => ({
    opacity: slideActive.value,
  }));

  const rookSlideStyle = useAnimatedStyle(() => ({
    opacity: rookSlideActive.value,
    transform: [{ translateX: rookSlideX.value }, { translateY: rookSlideY.value }],
  }));

  const rookCoverStyle = useAnimatedStyle(() => ({
    opacity: rookSlideActive.value,
  }));

  const beginDrag = (row: number, column: number) => {
    if (disabledRef.current) {
      return;
    }

    const piece = boardRef.current[row]?.[column];

    if (!piece || piece.color !== turnRef.current) {
      return;
    }

    const next = { from: piece.square, piece };
    dragRef.current = next;
    setDrag(next);
    onSelectSquare(piece.square);
  };

  const finishDrop = (dragState: DragState, to: Square) => {
    if (dragRef.current !== dragState) {
      return;
    }

    dragRef.current = null;
    setDrag(null);
    suppressMoveRef.current = { from: dragState.from, to };
    onDropSquare(to);
  };

  const snapBack = (dragState: DragState) => {
    const from = squareToRowColumn(dragState.from);

    dragX.value = withTiming(from.column * cellSize, { duration: SNAP_BACK_DURATION });
    dragY.value = withTiming(from.row * cellSize, { duration: SNAP_BACK_DURATION });
    onCancelSelection();

    setTimeout(() => {
      if (dragRef.current === dragState) {
        dragRef.current = null;
        setDrag(null);
      }
    }, SNAP_BACK_DURATION);
  };

  const handleDrop = (row: number, column: number) => {
    const dragState = dragRef.current;

    if (!dragState) {
      return;
    }

    if (row < 0 || row > 7 || column < 0 || column > 7) {
      snapBack(dragState);
      return;
    }

    const to = squareAt(row, column);

    if (to === dragState.from || !isDropLegal(dragState.from, to)) {
      snapBack(dragState);
      return;
    }

    const target = squareToRowColumn(to);

    // Drop the floating piece onto the centre of the target square, then
    // commit the move. The board suppresses its own slide for this move.
    dragX.value = withTiming(target.column * cellSize, { duration: DROP_DURATION });
    dragY.value = withTiming(target.row * cellSize, { duration: DROP_DURATION });

    setTimeout(() => {
      finishDrop(dragState, to);
    }, DROP_DURATION);
  };

  const handleGestureCancel = () => {
    const dragState = dragRef.current;

    if (dragState) {
      snapBack(dragState);
    }
  };

  const handleSquarePress = (square: Square) => {
    if (dragRef.current) {
      return;
    }

    onSquarePress(square);
  };

  // Runs before paint so the sliding piece starts on its old square instead of
  // flashing once on the destination square.
  useLayoutEffect(() => {
    const previous = previousMoveCountRef.current;
    previousMoveCountRef.current = moveCount;

    slideActive.value = 0;
    rookSlideActive.value = 0;

    if (moveCount !== previous + 1 || !lastMove) {
      // Undo/new game: never let a previous drag suppress a future move.
      suppressMoveRef.current = null;
      return;
    }

    const suppressed = suppressMoveRef.current;
    suppressMoveRef.current = null;

    if (suppressed && suppressed.from === lastMove.from && suppressed.to === lastMove.to) {
      return;
    }

    const from = squareToRowColumn(lastMove.from);
    const to = squareToRowColumn(lastMove.to);
    const movedPiece = board[to.row][to.column];

    if (!movedPiece) {
      return;
    }

    slideX.value = from.column * cellSize;
    slideY.value = from.row * cellSize;
    slideActive.value = 1;
    slideX.value = withTiming(to.column * cellSize, { duration: SLIDE_DURATION });
    slideY.value = withTiming(to.row * cellSize, { duration: SLIDE_DURATION });

    const rookMove = lastMove.rook;

    if (rookMove) {
      const rookFrom = squareToRowColumn(rookMove.from);
      const rookTo = squareToRowColumn(rookMove.to);

      if (board[rookTo.row][rookTo.column]) {
        rookSlideX.value = rookFrom.column * cellSize;
        rookSlideY.value = rookFrom.row * cellSize;
        rookSlideActive.value = 1;
        rookSlideX.value = withTiming(rookTo.column * cellSize, { duration: SLIDE_DURATION });
        rookSlideY.value = withTiming(rookTo.row * cellSize, { duration: SLIDE_DURATION });
      }
    }

    const timer = setTimeout(() => {
      slideActive.value = 0;
      rookSlideActive.value = 0;
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [
    board,
    cellSize,
    lastMove,
    moveCount,
    rookSlideActive,
    rookSlideX,
    rookSlideY,
    slideActive,
    slideX,
    slideY,
  ]);

  const slideTarget = lastMove ? squareToRowColumn(lastMove.to) : null;
  const slidePiece = slideTarget ? board[slideTarget.row][slideTarget.column] : null;

  const rookTarget = lastMove?.rook ? squareToRowColumn(lastMove.rook.to) : null;
  const rookPiece = rookTarget ? board[rookTarget.row][rookTarget.column] : null;

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(8)
    .onStart((event) => {
      const startX = event.x - event.translationX;
      const startY = event.y - event.translationY;
      const column = Math.floor(startX / cellSize);
      const row = Math.floor(startY / cellSize);

      if (row < 0 || row > 7 || column < 0 || column > 7) {
        return;
      }

      grabX.value = startX - column * cellSize;
      grabY.value = startY - row * cellSize;
      dragX.value = column * cellSize;
      dragY.value = row * cellSize;

      runOnJS(beginDrag)(row, column);
    })
    .onUpdate((event) => {
      dragX.value = event.x - grabX.value;
      dragY.value = event.y - grabY.value;
    })
    .onFinalize((event, success) => {
      if (!success) {
        runOnJS(handleGestureCancel)();
        return;
      }

      const centerX = event.x - grabX.value + cellSize / 2;
      const centerY = event.y - grabY.value + cellSize / 2;
      const column = Math.floor(centerX / cellSize);
      const row = Math.floor(centerY / cellSize);

      if (row < 0 || row > 7 || column < 0 || column > 7) {
        runOnJS(handleDrop)(-1, -1);
        return;
      }

      runOnJS(handleDrop)(row, column);
    });

  return (
    <GestureDetector gesture={pan}>
      <View
        collapsable={false}
        style={[styles.container, { width: size, height: size }]}>
        <View style={styles.boardClip}>
          {board.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((piece, columnIndex) => {
                const square = squareAt(rowIndex, columnIndex);
                const isSelected = selectedSquare === square;
                const isLegal = legalSet.has(square);
                const isLastMove =
                  lastMove?.from === square ||
                  lastMove?.to === square ||
                  lastMove?.rook?.from === square ||
                  lastMove?.rook?.to === square;
                const isCapture = showLegalMoves && isLegal && piece !== null;
                const isCheck = checkSquare === square;
                const isDragged = drag?.from === square;
                const label = piece
                  ? `${square}, ${piece.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[piece.type]}`
                  : `${square}, empty`;

                return (
                  <Pressable
                    key={square}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    disabled={disabled}
                    onPress={() => handleSquarePress(square)}
                    style={[
                      styles.square,
                      {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor:
                          (rowIndex + columnIndex) % 2 === 0
                            ? colors.boardLight
                            : colors.boardDark,
                      },
                    ]}>
                    {isLastMove && (
                      <View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFill, styles.lastMove]}
                      />
                    )}
                    {isSelected && (
                      <View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFill, styles.selected]}
                      />
                    )}
                    {isCheck && (
                      <View
                        pointerEvents="none"
                        style={[StyleSheet.absoluteFill, styles.check]}
                      />
                    )}

                    {isCapture && (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.centered,
                          styles.captureRing,
                          {
                            margin: ringInset,
                            borderWidth: Math.max(2, Math.round(cellSize * 0.07)),
                            borderRadius: cellSize / 2,
                          },
                        ]}
                      />
                    )}

                    {piece && !isDragged && (
                      <ChessPiece type={piece.type} color={piece.color} size={pieceSize} />
                    )}

                    {showLegalMoves && isLegal && !isCapture && (
                      <View style={styles.centered} pointerEvents="none">
                        <View
                          style={{
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotSize / 2,
                            backgroundColor: colors.moveDot,
                          }}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {slideTarget && slidePiece && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slideCover,
              {
                left: slideTarget.column * cellSize,
                top: slideTarget.row * cellSize,
                width: cellSize,
                height: cellSize,
                backgroundColor:
                  (slideTarget.row + slideTarget.column) % 2 === 0
                    ? colors.boardLight
                    : colors.boardDark,
              },
              slideCoverStyle,
            ]}
          />
        )}

        {slideTarget && slidePiece && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pieceOverlay,
              { width: cellSize, height: cellSize },
              slideStyle,
            ]}>
            <ChessPiece type={slidePiece.type} color={slidePiece.color} size={pieceSize} />
          </Animated.View>
        )}

        {rookTarget && rookPiece && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slideCover,
              {
                left: rookTarget.column * cellSize,
                top: rookTarget.row * cellSize,
                width: cellSize,
                height: cellSize,
                backgroundColor:
                  (rookTarget.row + rookTarget.column) % 2 === 0
                    ? colors.boardLight
                    : colors.boardDark,
              },
              rookCoverStyle,
            ]}
          />
        )}

        {rookTarget && rookPiece && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pieceOverlay,
              { width: cellSize, height: cellSize },
              rookSlideStyle,
            ]}>
            <ChessPiece type={rookPiece.type} color={rookPiece.color} size={pieceSize} />
          </Animated.View>
        )}

        {drag && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pieceOverlay,
              styles.dragPiece,
              { width: cellSize, height: cellSize },
              dragStyle,
            ]}>
            <ChessPiece type={drag.piece.type} color={drag.piece.color} size={pieceSize} />
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      position: 'relative',
    },
    boardClip: {
      flex: 1,
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: colors.boardLight,
    },
    row: {
      flex: 1,
      flexDirection: 'row',
    },
    square: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    centered: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lastMove: {
      backgroundColor: colors.squareLastMove,
    },
    selected: {
      backgroundColor: colors.squareSelected,
    },
    check: {
      backgroundColor: colors.squareCheck,
    },
    captureRing: {
      borderColor: colors.moveRing,
    },
    pieceOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 25,
    },
    slideCover: {
      position: 'absolute',
      zIndex: 20,
    },
    dragPiece: {
      zIndex: 30,
    },
  });
}
