import { create } from 'zustand';

import {
  createGame,
  getBoardGrid,
  getGameStatus,
  getLegalTargets,
  getMoveTo,
  type BoardGrid,
  type GameStatus,
  type Square,
} from '@/engine/chess';
import type { Color } from 'chess.js';

export type LastMove = {
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
  status: GameStatus;
};

type GameActions = {
  tapSquare: (square: Square) => void;
  newGame: () => void;
};

export type GameStore = GameSnapshot & GameActions;

/**
 * The Chess instance lives outside of React state and is the single source of
 * truth for the rules. The store only publishes a snapshot for rendering.
 */
let game = createGame();

function createSnapshot(): GameSnapshot {
  return {
    board: getBoardGrid(game),
    turn: game.turn(),
    fen: game.fen(),
    selectedSquare: null,
    legalMoves: [],
    lastMove: null,
    status: getGameStatus(game),
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createSnapshot(),

  newGame: () => {
    game = createGame();
    set(createSnapshot());
  },

  tapSquare: (square) => {
    const { selectedSquare, legalMoves, status } = get();

    if (status.isOver) {
      return;
    }

    if (selectedSquare) {
      if (selectedSquare === square) {
        set({ selectedSquare: null, legalMoves: [] });
        return;
      }

      if (legalMoves.includes(square)) {
        const target = getMoveTo(game, selectedSquare, square);

        if (target) {
          // Phase 1 always promotes to a queen; a promotion picker comes later.
          const move = game.move({
            from: selectedSquare,
            to: square,
            ...(target.promotion ? { promotion: 'q' } : {}),
          });

          set({
            board: getBoardGrid(game),
            turn: game.turn(),
            fen: game.fen(),
            selectedSquare: null,
            legalMoves: [],
            lastMove: { from: move.from, to: move.to },
            status: getGameStatus(game),
          });
          return;
        }
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
}));
