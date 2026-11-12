import { create } from 'zustand';

import { findBestMove, type Difficulty } from '@/engine/ai';
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

export type { Difficulty } from '@/engine/ai';
export type { PromotionPiece } from '@/engine/chess';

export type GameMode = 'two-player' | 'computer';

export type PendingPromotion = {
  from: Square;
  to: Square;
};

export type StartGameOptions = {
  mode: GameMode;
  difficulty?: Difficulty;
  humanColor?: Color;
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

type GameSettings = {
  mode: GameMode;
  difficulty: Difficulty;
  humanColor: Color;
  isComputerThinking: boolean;
};

type GameActions = {
  startGame: (options: StartGameOptions) => void;
  tapSquare: (square: Square) => void;
  selectSquare: (square: Square) => void;
  dropSquare: (square: Square) => void;
  cancelSelection: () => void;
  undo: () => void;
  newGame: () => void;
  promote: (piece: PromotionPiece) => void;
  cancelPromotion: () => void;
  playComputerMove: () => Promise<void>;
};

export type GameStore = GameSnapshot & GameSettings & GameActions;

/**
 * The Chess instance lives outside of React state and is the single source of
 * truth for the rules. The store only publishes a snapshot for rendering.
 */
let game = createGame();

/** Incremented whenever a new position is started, to discard stale AI results. */
let gameId = 0;

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

  const isHumanTurn = () => {
    const { mode, humanColor } = get();
    return mode !== 'computer' || game.turn() === humanColor;
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
    mode: 'two-player',
    difficulty: 'medium',
    humanColor: 'w',
    isComputerThinking: false,

    startGame: (options) => {
      gameId += 1;
      game = createGame();
      set({
        ...createSnapshot(),
        mode: options.mode,
        difficulty: options.difficulty ?? 'medium',
        humanColor: options.humanColor ?? 'w',
        isComputerThinking: false,
      });
    },

    newGame: () => {
      gameId += 1;
      game = createGame();
      set({ ...createSnapshot(), isComputerThinking: false });
    },

    tapSquare: (square) => {
      const { selectedSquare, legalMoves, status, pendingPromotion } = get();

      if (!isHumanTurn() || pendingPromotion || status.isOver) {
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

      if (!isHumanTurn() || pendingPromotion || status.isOver) {
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

      if (!isHumanTurn() || pendingPromotion || status.isOver || !selectedSquare) {
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
      const { history, pendingPromotion, mode, isComputerThinking } = get();

      if (pendingPromotion) {
        set({ pendingPromotion: null, selectedSquare: null, legalMoves: [] });
        return;
      }

      if (isComputerThinking || history.length === 0) {
        return;
      }

      // In computer mode take back both the computer's reply and the human move.
      const plies = mode === 'computer' ? 2 : 1;

      for (let index = 0; index < plies && game.history().length > 0; index += 1) {
        game.undo();
      }

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

    playComputerMove: async () => {
      const state = get();

      if (state.mode !== 'computer' || state.isComputerThinking || state.status.isOver) {
        return;
      }

      if (game.turn() === state.humanColor) {
        return;
      }

      const activeGameId = gameId;
      set({ isComputerThinking: true, selectedSquare: null, legalMoves: [] });

      const move = await findBestMove(game.fen(), state.difficulty);

      // A new game may have been started while the search was running.
      if (activeGameId !== gameId) {
        return;
      }

      if (
        get().mode !== 'computer' ||
        get().status.isOver ||
        game.turn() === get().humanColor
      ) {
        set({ isComputerThinking: false });
        return;
      }

      if (move) {
        applyMove(move.from, move.to, move.promotion);
      }

      set({ isComputerThinking: false });
    },
  };
});
