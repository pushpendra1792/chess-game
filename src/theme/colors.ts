export type BoardThemeId = 'classic' | 'wood' | 'blue' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  backdrop: string;
  shadow: string;

  boardLight: string;
  boardDark: string;
  squareSelected: string;
  squareLastMove: string;
  squareCheck: string;
  moveDot: string;
  moveRing: string;

  whitePiece: string;
  whitePieceStroke: string;
  whitePieceDetail: string;
  blackPiece: string;
  blackPieceStroke: string;
  blackPieceDetail: string;

  accent: string;
  accentPressed: string;
  accentText: string;
  check: string;
  switchTrackOff: string;
  switchThumb: string;
};

export type ThemeDefinition = {
  id: BoardThemeId;
  label: string;
  isDark: boolean;
  colors: ThemeColors;
};

export const THEMES: Record<BoardThemeId, ThemeDefinition> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    isDark: false,
    colors: {
      background: '#F4F1EA',
      surface: '#FFFFFF',
      surfaceMuted: '#EDE8DE',
      text: '#1E2329',
      textMuted: '#6B7178',
      border: '#D9D3C7',
      backdrop: 'rgba(18, 21, 26, 0.45)',
      shadow: '#000000',

      boardLight: '#EEEED2',
      boardDark: '#769656',
      squareSelected: 'rgba(255, 199, 61, 0.55)',
      squareLastMove: 'rgba(255, 199, 61, 0.32)',
      squareCheck: 'rgba(190, 38, 38, 0.5)',
      moveDot: 'rgba(30, 35, 41, 0.28)',
      moveRing: 'rgba(30, 35, 41, 0.45)',

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
      switchTrackOff: '#C9C3B7',
      switchThumb: '#FFFFFF',
    },
  },

  wood: {
    id: 'wood',
    label: 'Wood',
    isDark: false,
    colors: {
      background: '#F6EEE3',
      surface: '#FFFDF9',
      surfaceMuted: '#EFE2D2',
      text: '#2B2118',
      textMuted: '#7A6A59',
      border: '#DFCEB8',
      backdrop: 'rgba(30, 22, 14, 0.5)',
      shadow: '#000000',

      boardLight: '#F0D9B5',
      boardDark: '#B58863',
      squareSelected: 'rgba(214, 158, 46, 0.55)',
      squareLastMove: 'rgba(214, 158, 46, 0.32)',
      squareCheck: 'rgba(178, 34, 34, 0.55)',
      moveDot: 'rgba(50, 35, 20, 0.3)',
      moveRing: 'rgba(50, 35, 20, 0.48)',

      whitePiece: '#FAF3E6',
      whitePieceStroke: '#3A2A1A',
      whitePieceDetail: '#3A2A1A',
      blackPiece: '#3B2A1C',
      blackPieceStroke: '#1E140C',
      blackPieceDetail: 'rgba(255, 255, 255, 0.72)',

      accent: '#8A5A2B',
      accentPressed: '#6F4720',
      accentText: '#FFFFFF',
      check: '#B7443A',
      switchTrackOff: '#D6C3AA',
      switchThumb: '#FFFDF9',
    },
  },

  blue: {
    id: 'blue',
    label: 'Blue',
    isDark: false,
    colors: {
      background: '#EDF2F8',
      surface: '#FFFFFF',
      surfaceMuted: '#E1E9F2',
      text: '#16202B',
      textMuted: '#5D6B7A',
      border: '#C9D6E4',
      backdrop: 'rgba(12, 20, 30, 0.5)',
      shadow: '#000000',

      boardLight: '#DCE6F2',
      boardDark: '#4F74A3',
      squareSelected: 'rgba(255, 205, 80, 0.55)',
      squareLastMove: 'rgba(255, 205, 80, 0.34)',
      squareCheck: 'rgba(190, 50, 50, 0.5)',
      moveDot: 'rgba(20, 30, 45, 0.28)',
      moveRing: 'rgba(20, 30, 45, 0.45)',

      whitePiece: '#FCFCFA',
      whitePieceStroke: '#26313D',
      whitePieceDetail: '#26313D',
      blackPiece: '#26313D',
      blackPieceStroke: '#101720',
      blackPieceDetail: 'rgba(255, 255, 255, 0.72)',

      accent: '#2E5C8A',
      accentPressed: '#244970',
      accentText: '#FFFFFF',
      check: '#B7443A',
      switchTrackOff: '#B8C8D8',
      switchThumb: '#FFFFFF',
    },
  },

  dark: {
    id: 'dark',
    label: 'Dark',
    isDark: true,
    colors: {
      background: '#0F1318',
      surface: '#191F26',
      surfaceMuted: '#222A33',
      text: '#ECF1F5',
      textMuted: '#98A4B0',
      border: '#2C3641',
      backdrop: 'rgba(0, 0, 0, 0.65)',
      shadow: '#000000',

      boardLight: '#A3B1BF',
      boardDark: '#526274',
      squareSelected: 'rgba(255, 199, 61, 0.55)',
      squareLastMove: 'rgba(255, 199, 61, 0.3)',
      squareCheck: 'rgba(224, 74, 64, 0.55)',
      moveDot: 'rgba(255, 255, 255, 0.55)',
      moveRing: 'rgba(255, 255, 255, 0.75)',

      whitePiece: '#F7FAFC',
      whitePieceStroke: '#1A222C',
      whitePieceDetail: '#1A222C',
      blackPiece: '#1B232C',
      blackPieceStroke: '#0B1015',
      blackPieceDetail: 'rgba(255, 255, 255, 0.75)',

      accent: '#4FAE83',
      accentPressed: '#3E8F69',
      accentText: '#08110C',
      check: '#E06A5F',
      switchTrackOff: '#3A4652',
      switchThumb: '#ECF1F5',
    },
  },
};

export const THEME_LIST: ThemeDefinition[] = [
  THEMES.classic,
  THEMES.wood,
  THEMES.blue,
  THEMES.dark,
];

export const DEFAULT_BOARD_THEME: BoardThemeId = 'classic';

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
