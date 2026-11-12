import { Chess, SQUARES } from 'chess.js';
import type { Color, Move, PieceSymbol, Square } from 'chess.js';

export type { Color, PieceSymbol, Square };

export type BoardPiece = {
  square: Square;
  type: PieceSymbol;
  color: Color;
};

/**
 * Rows run from rank 8 (top) to rank 1 (bottom), matching the board's
 * visual orientation with White at the bottom.
 */
export type BoardGrid = (BoardPiece | null)[][];

export type GameStatusKind = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export type GameStatus = {
  kind: GameStatusKind;
  isOver: boolean;
  turn: Color;
  winner: Color | null;
  message: string;
};

export function createGame(): Chess {
  return new Chess();
}

export function getBoardGrid(chess: Chess): BoardGrid {
  return Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, column) => {
      const square = SQUARES[row * 8 + column];
      const piece = chess.get(square);

      return piece ? { square, type: piece.type, color: piece.color } : null;
    })
  );
}

export function squareAt(row: number, column: number): Square {
  return SQUARES[row * 8 + column];
}

/**
 * All destination squares for a piece, as reported by chess.js. A Set is used
 * because promotions can produce several moves with the same destination.
 */
export function getLegalTargets(chess: Chess, square: Square): Square[] {
  const targets = chess.moves({ square, verbose: true }).map((move) => move.to);
  return [...new Set(targets)];
}

export function getMoveTo(chess: Chess, from: Square, to: Square): Move | undefined {
  return chess.moves({ square: from, verbose: true }).find((move) => move.to === to);
}

export function getGameStatus(chess: Chess): GameStatus {
  const turn = chess.turn();
  const current = turn === 'w' ? 'White' : 'Black';
  const other = turn === 'w' ? 'Black' : 'White';

  if (chess.isCheckmate()) {
    return {
      kind: 'checkmate',
      isOver: true,
      turn,
      winner: turn === 'w' ? 'b' : 'w',
      message: `Checkmate — ${other} wins`,
    };
  }

  if (chess.isStalemate()) {
    return {
      kind: 'stalemate',
      isOver: true,
      turn,
      winner: null,
      message: 'Stalemate — draw',
    };
  }

  if (chess.isInsufficientMaterial()) {
    return {
      kind: 'draw',
      isOver: true,
      turn,
      winner: null,
      message: 'Draw — insufficient material',
    };
  }

  if (chess.isThreefoldRepetition()) {
    return {
      kind: 'draw',
      isOver: true,
      turn,
      winner: null,
      message: 'Draw — threefold repetition',
    };
  }

  if (chess.isDrawByFiftyMoves()) {
    return {
      kind: 'draw',
      isOver: true,
      turn,
      winner: null,
      message: 'Draw — fifty-move rule',
    };
  }

  if (chess.isDraw()) {
    return {
      kind: 'draw',
      isOver: true,
      turn,
      winner: null,
      message: 'Draw',
    };
  }

  if (chess.isCheck()) {
    return {
      kind: 'check',
      isOver: false,
      turn,
      winner: null,
      message: `${current} to move — check!`,
    };
  }

  return {
    kind: 'playing',
    isOver: false,
    turn,
    winner: null,
    message: `${current} to move`,
  };
}
