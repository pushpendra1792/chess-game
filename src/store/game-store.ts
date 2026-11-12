import { create } from 'zustand';

import {
  createGame,
  getLegalTargets,
  getMoveTo,
  readGame,
  type BoardGrid,
  type CapturedPieces,
  type Color,
  type GameStatus,
  type LastMove,
  type PromotionPiece,
  type Square,
} from '@/engine/chess';

export type { PromotionPiece } from '@/engine/chess';

export type PendingPromotion = {
  from: Square;
  to: Square;
};

type GameSnapshot = {
  board: BoardGrid;
  turn: Color;
  fen: string;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: LastMove | null;
  history: string[];
  captured: CapturedPieces;
  status: GameStatus;
  checkSquare: Square | null;
  moveCount: number;
  pendingPromotion: PendingPromotion | null;
};

type GameActions = {
  tapSquare: (square: Square) => void;
  selectSquare: (square: Square) => void;
  dropSquare: (square: Square) => void;
  cancelSelection: () => void;
  undo: () => void;
  newGame: () => void;
  promote: (piece: PromotionPiece) => void;
  cancelPromotion: () => void;
};

export type GameStore = GameSnapshot & GameActions;

/**
 * The Chess instance lives outside of React state and is the single source of
 * truth for the rules. The store only publishes a snapshot for rendering.
 */
let game = createGame();

function createSnapshot(): GameSnapshot {
  return {
    ...readGame(game),
    fen: game.fen(),
    selectedSquare: null,
    legalMoves: [],
    pendingPromotion: null,
  };
}

export const useGameStore = create<GameStore>((set, get) => {
  const applyMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    try {
      game.move({
        from,
        to,
        ...(promotion ? { promotion } : {}),
      });
    } catch {
      set({ pendingPromotion: null, selectedSquare: null, legalMoves: [] });
      return;
    }

    set(createSnapshot());
  };

  const attemptMove = (from: Square, to: Square) => {
    const target = getMoveTo(game, from, to);

    if (!target) {
      set({ selectedSquare: null, legalMoves: [] });
      return;
    }

    if (target.promotion) {
      set({
        pendingPromotion: { from, to },
        selectedSquare: null,
        legalMoves: [],
      });
      return;
    }

    applyMove(from, to);
  };

  return {
    ...createSnapshot(),

    newGame: () => {
      game = createGame();
      set(createSnapshot());
    },

    tapSquare: (square) => {
      const { selectedSquare, legalMoves, status, pendingPromotion } = get();

      if (pendingPromotion || status.isOver) {
        return;
      }

      if (selectedSquare) {
        if (selectedSquare === square) {
          set({ selectedSquare: null, legalMoves: [] });
          return;
        }

        if (legalMoves.includes(square)) {
          attemptMove(selectedSquare, square);
          return;
        }
      }

      const piece = game.get(square);

      if (piece && piece.color === game.turn()) {
        set({
          selectedSquare: square,
          legalMoves: getLegalTargets(game, square),
        });
        return;
      }

      set({ selectedSquare: null, legalMoves: [] });
    },

    selectSquare: (square) => {
      const { status, pendingPromotion } = get();

      if (pendingPromotion || status.isOver) {
        return;
      }

      const piece = game.get(square);

      if (piece && piece.color === game.turn()) {
        set({
          selectedSquare: square,
          legalMoves: getLegalTargets(game, square),
        });
        return;
      }

      set({ selectedSquare: null, legalMoves: [] });
    },

    dropSquare: (square) => {
      const { selectedSquare, legalMoves, status, pendingPromotion } = get();

      if (pendingPromotion || status.isOver || !selectedSquare) {
        set({ selectedSquare: null, legalMoves: [] });
        return;
      }

      if (legalMoves.includes(square)) {
        attemptMove(selectedSquare, square);
        return;
      }

      set({ selectedSquare: null, legalMoves: [] });
    },

    cancelSelection: () => {
      set({ selectedSquare: null, legalMoves: [] });
    },

    undo: () => {
      const { history, pendingPromotion } = get();

      if (pendingPromotion) {
        set({ pendingPromotion: null, selectedSquare: null, legalMoves: [] });
        return;
      }

      if (history.length === 0) {
        return;
      }

      game.undo();
      set(createSnapshot());
    },

    promote: (piece) => {
      const { pendingPromotion } = get();

      if (!pendingPromotion) {
        return;
      }

      applyMove(pendingPromotion.from, pendingPromotion.to, piece);
    },

    cancelPromotion: () => {
      set({ pendingPromotion: null, selectedSquare: null, legalMoves: [] });
    },
  };
});
