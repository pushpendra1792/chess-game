import { Chess, SQUARES } from 'chess.js';
import type { Color, Move, PieceSymbol, Square } from 'chess.js';

export type { Color, PieceSymbol, Square };

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

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

export type LastMove = {
  from: Square;
  to: Square;
  /** Present only for castling, so both pieces can be animated. */
  rook?: { from: Square; to: Square };
};

export type GameStatusKind = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export type GameStatus = {
  kind: GameStatusKind;
  isOver: boolean;
  turn: Color;
  winner: Color | null;
  message: string;
};

/**
 * Pieces captured by each side. `w` contains pieces taken by White,
 * `b` contains pieces taken by Black.
 */
export type CapturedPieces = {
  w: PieceSymbol[];
  b: PieceSymbol[];
};

export type GameReading = {
  board: BoardGrid;
  turn: Color;
  lastMove: LastMove | null;
  history: string[];
  captured: CapturedPieces;
  status: GameStatus;
  checkSquare: Square | null;
  moveCount: number;
};

const CAPTURE_ORDER: Record<PieceSymbol, number> = {
  q: 0,
  r: 1,
  b: 2,
  n: 3,
  p: 4,
  k: 5,
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

export function squareToRowColumn(square: Square): { row: number; column: number } {
  const index = SQUARES.indexOf(square);
  return { row: Math.floor(index / 8), column: index % 8 };
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

export function getKingSquare(chess: Chess, color: Color): Square | null {
  const [king] = chess.findPiece({ type: 'k', color });
  return king ?? null;
}

/**
 * chess.js marks castles with the 'k' (kingside) and 'q' (queenside) flags.
 * The rook squares are derived from those flags only for the slide animation.
 */
function getCastlingRookMove(move: Move): { from: Square; to: Square } | undefined {
  const kingSide = move.flags.includes('k');
  const queenSide = move.flags.includes('q');

  if (!kingSide && !queenSide) {
    return undefined;
  }

  const rank = move.color === 'w' ? '1' : '8';

  return {
    from: `${kingSide ? 'h' : 'a'}${rank}` as Square,
    to: `${kingSide ? 'f' : 'd'}${rank}` as Square,
  };
}

export function getCapturedPieces(history: Move[]): CapturedPieces {
  const captured: CapturedPieces = { w: [], b: [] };

  for (const move of history) {
    if (move.captured) {
      captured[move.color].push(move.captured);
    }
  }

  captured.w.sort((a, b) => CAPTURE_ORDER[a] - CAPTURE_ORDER[b]);
  captured.b.sort((a, b) => CAPTURE_ORDER[a] - CAPTURE_ORDER[b]);

  return captured;
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

/**
 * One pass over chess.js produces everything the UI needs: the board,
 * SAN move list, captures, last move, check state and status.
 */
export function readGame(chess: Chess): GameReading {
  const history = chess.history({ verbose: true });
  const last = history[history.length - 1];

  return {
    board: getBoardGrid(chess),
    turn: chess.turn(),
    lastMove: last
      ? { from: last.from, to: last.to, rook: getCastlingRookMove(last) }
      : null,
    history: history.map((move) => move.san),
    captured: getCapturedPieces(history),
    status: getGameStatus(chess),
    checkSquare: chess.isCheck() ? getKingSquare(chess, chess.turn()) : null,
    moveCount: history.length,
  };
}
