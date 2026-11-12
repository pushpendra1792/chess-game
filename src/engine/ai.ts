import { Chess } from 'chess.js';
import type { Move, PieceSymbol, Square } from 'chess.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type AiMove = {
  from: Square;
  to: Square;
  promotion?: 'q';
};

const DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const MATE_SCORE = 100_000;
/** Easy picks randomly among moves this close to the best move. */
const EASY_MARGIN = 60;

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20_000,
};

/*
 * Piece-square tables from the classic "simplified evaluation function".
 * Rows are written from rank 8 (top) to rank 1 (bottom); Black mirrors them.
 */
const PAWN_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_TABLE = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10,
  -10, 0, 10, 10, 10, 10, 0, -10,
  -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 5, 0, 0, 0, 0, 5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const ROOK_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0,
  5, 10, 10, 10, 10, 10, 10, 5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  0, 0, 0, 5, 5, 0, 0, 0,
];

const QUEEN_TABLE = [
  -20, -10, -10, -5, -5, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 5, 5, 5, 0, -10,
  -5, 0, 5, 5, 5, 5, 0, -5,
  0, 0, 5, 5, 5, 5, 0, -5,
  -10, 5, 5, 5, 5, 5, 0, -10,
  -10, 0, 5, 0, 0, 0, 0, -10,
  -20, -10, -10, -5, -5, -10, -10, -20,
];

const KING_TABLE = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20, 20, 0, 0, 0, 0, 20, 20,
  20, 30, 30, 0, 0, 30, 30, 20,
];

const PIECE_SQUARE_TABLES: Record<PieceSymbol, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_TABLE,
};

function evaluateBoard(chess: Chess): number {
  const board = chess.board();
  let score = 0;

  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const piece = board[row][column];

      if (!piece) {
        continue;
      }

      const table = PIECE_SQUARE_TABLES[piece.type];
      const index =
        piece.color === 'w' ? row * 8 + column : (7 - row) * 8 + column;
      const value = PIECE_VALUES[piece.type] + table[index];

      score += piece.color === 'w' ? value : -value;
    }
  }

  return score;
}

/** Captures and promotions first, so alpha-beta prunes more branches. */
function orderMoves(chess: Chess): Move[] {
  return chess
    .moves({ verbose: true })
    // The computer always promotes to a queen.
    .filter((move) => !move.promotion || move.promotion === 'q')
    .sort((a, b) => movePriority(b) - movePriority(a));
}

function movePriority(move: Move): number {
  let priority = 0;

  if (move.captured) {
    priority += 10 * PIECE_VALUES[move.captured] - PIECE_VALUES[move.piece];
  }

  if (move.promotion) {
    priority += PIECE_VALUES[move.promotion];
  }

  return priority;
}

function playMove(chess: Chess, move: Move) {
  chess.move({
    from: move.from,
    to: move.to,
    ...(move.promotion ? { promotion: move.promotion } : {}),
  });
}

/**
 * Negamax with alpha-beta pruning. Scores are from the side to move.
 * A checkmate is worth more the sooner it happens.
 */
function search(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  ply: number
): number {
  // At the horizon, use chess.js's cheap terminal checks (no SAN generation).
  if (depth <= 0) {
    if (chess.isCheckmate()) {
      return -(MATE_SCORE - ply);
    }

    // Threefold repetition cannot occur within a 3-ply search.
    if (
      chess.isStalemate() ||
      chess.isInsufficientMaterial() ||
      chess.isDrawByFiftyMoves()
    ) {
      return 0;
    }

    const perspective = chess.turn() === 'w' ? 1 : -1;
    return perspective * evaluateBoard(chess);
  }

  const moves = orderMoves(chess);

  if (moves.length === 0) {
    return chess.isCheckmate() ? -(MATE_SCORE - ply) : 0;
  }

  if (chess.isInsufficientMaterial() || chess.isDrawByFiftyMoves()) {
    return 0;
  }

  let best = -Infinity;
  let nextAlpha = alpha;

  for (const move of moves) {
    playMove(chess, move);
    const score = -search(chess, depth - 1, -beta, -nextAlpha, ply + 1);
    chess.undo();

    if (score > best) {
      best = score;
    }

    if (score > nextAlpha) {
      nextAlpha = score;
    }

    if (nextAlpha >= beta) {
      break;
    }
  }

  return best;
}

/** Lets React paint the "Thinking..." state between root moves. */
function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function findBestMove(
  fen: string,
  difficulty: Difficulty
): Promise<AiMove | null> {
  const chess = new Chess(fen);
  const moves = orderMoves(chess);

  if (moves.length === 0) {
    return null;
  }

  // Give the UI a frame to show the thinking indicator before searching.
  await yieldToUi();

  const depth = DEPTH[difficulty];
  const scored: { move: Move; score: number }[] = [];
  let bestMove: Move | null = null;
  let bestScore = -Infinity;
  let alpha = -Infinity;

  for (let index = 0; index < moves.length; index += 1) {
    if (index > 0 && difficulty !== 'easy') {
      await yieldToUi();
    }

    const move = moves[index];
    playMove(chess, move);
    const score = -search(
      chess,
      depth - 1,
      -Infinity,
      difficulty === 'easy' ? Infinity : -alpha,
      1
    );
    chess.undo();

    if (difficulty === 'easy') {
      scored.push({ move, score });
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    if (score > alpha) {
      alpha = score;
    }
  }

  if (!bestMove) {
    return null;
  }

  if (difficulty === 'easy') {
    const candidates = scored.filter((entry) => entry.score >= bestScore - EASY_MARGIN);
    bestMove = candidates[Math.floor(Math.random() * candidates.length)].move;
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    ...(bestMove.promotion ? { promotion: 'q' as const } : {}),
  };
}
