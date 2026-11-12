import { Pressable, StyleSheet, View } from 'react-native';

import { ChessPiece } from '@/components/chess-piece';
import { squareAt, type BoardGrid, type PieceSymbol, type Square } from '@/engine/chess';
import { colors } from '@/theme/colors';

type ChessBoardProps = {
  size: number;
  board: BoardGrid;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquarePress: (square: Square) => void;
};

const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

export function ChessBoard({
  size,
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  onSquarePress,
}: ChessBoardProps) {
  const cellSize = size / 8;
  const pieceSize = cellSize * 0.86;
  const dotSize = Math.max(6, Math.round(cellSize * 0.26));
  const ringInset = Math.max(2, Math.round(cellSize * 0.07));
  const legalSet = new Set(legalMoves);

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((piece, columnIndex) => {
            const square = squareAt(rowIndex, columnIndex);
            const isLight = (rowIndex + columnIndex) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isLegal = legalSet.has(square);
            const isLastMove = lastMove?.from === square || lastMove?.to === square;
            const isCapture = isLegal && piece !== null;
            const label = piece
              ? `${square}, ${piece.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[piece.type]}`
              : `${square}, empty`;

            return (
              <Pressable
                key={square}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => onSquarePress(square)}
                style={[
                  styles.square,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: isLight ? colors.boardLight : colors.boardDark,
                  },
                ]}>
                {isLastMove && (
                  <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.lastMove]} />
                )}
                {isSelected && (
                  <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.selected]} />
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

                {piece && <ChessPiece type={piece.type} color={piece.color} size={pieceSize} />}

                {isLegal && !isCapture && (
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
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 6,
    overflow: 'hidden',
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
  captureRing: {
    borderColor: colors.moveRing,
  },
});
