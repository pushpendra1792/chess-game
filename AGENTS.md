# Chess Game

Expo SDK 58 + React Native + TypeScript chess app (Android first).

## Project rules

- **All chess rules come from `chess.js`** — legality, check, checkmate, draws, and SAN notation. Never hand-write or re-implement rules.
- Keep **game logic** (`src/engine`, `src/store`) separate from **UI** (`src/components`, `src/screens`). UI renders snapshots; it never decides moves.
- **Zustand** is the only state layer (`src/store/game-store.ts`). The `Chess` instance is the source of truth.
- Pieces are drawn as **SVG** with `react-native-svg` (`src/components/chess-piece.tsx`).
- Use tokens from `src/theme/colors.ts`; do not hard-code colors, spacing, or radii.
- Keep code simple and readable. Do not rewrite working parts.
- Expo APIs change between SDKs — check the SDK 58 docs before using an unfamiliar API.
- After every change run `npx tsc --noEmit` and `npx expo lint`.

## Folder structure

```
src/
  app/          Expo Router routes (_layout.tsx, index.tsx)
  screens/      Screen composition (game-screen.tsx)
  components/   Board, pieces, trays, move list, modals
  engine/       chess.js wrapper and derived game data
  store/        Zustand store and actions
  theme/        Colors, spacing, radius
```

## Finished features

**Phase 1**
- [x] Custom 8x8 board with SVG pieces
- [x] Tap to select, legal move dots, capture rings
- [x] Last-move highlight and alternating turns
- [x] New Game and check/checkmate/stalemate/draw status line

**Phase 2**
- [x] Drag and drop (tap-to-move preserved, illegal drops snap back)
- [x] Smooth slide animation, including the castling rook
- [x] Red king square when in check
- [x] Captured-piece trays for both sides
- [x] Scrollable move list in algebraic notation
- [x] Undo keeps board, trays, and move list in sync
- [x] Promotion picker (queen, rook, bishop, knight)

**Post-Phase 2**
- [x] Game over modal for checkmate, stalemate, and all draw types
