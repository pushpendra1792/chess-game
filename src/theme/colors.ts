export const colors = {
  background: '#F4F1EA',
  surface: '#FFFFFF',
  text: '#1E2329',
  textMuted: '#6B7178',
  border: '#D9D3C7',

  boardLight: '#F0D9B5',
  boardDark: '#B58863',
  squareSelected: 'rgba(255, 199, 61, 0.55)',
  squareLastMove: 'rgba(255, 199, 61, 0.32)',
  squareCheck: 'rgba(190, 38, 38, 0.5)',
  moveDot: 'rgba(30, 35, 41, 0.28)',
  moveRing: 'rgba(30, 35, 41, 0.45)',

  surfaceMuted: '#EDE8DE',
  backdrop: 'rgba(18, 21, 26, 0.45)',

  whitePiece: '#FCFCFA',
  whitePieceStroke: '#2A2E35',
  whitePieceDetail: '#2A2E35',
  blackPiece: '#2B3038',
  blackPieceStroke: '#12151A',
  blackPieceDetail: 'rgba(255, 255, 255, 0.72)',

  accent: '#2F6F4E',
  accentPressed: '#255A3F',
  accentText: '#FFFFFF',
  check: '#B7443A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  board: 10,
  card: 12,
  button: 12,
} as const;
