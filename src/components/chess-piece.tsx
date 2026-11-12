import type { ReactNode } from 'react';
import { Circle, G, Path, Rect, Svg } from 'react-native-svg';
import type { Color, PieceSymbol } from 'chess.js';

import { useTheme } from '@/theme/use-theme';

type ChessPieceProps = {
  type: PieceSymbol;
  color: Color;
  size: number;
};

function renderPiece(type: PieceSymbol, fill: string, detail: string): ReactNode {
  switch (type) {
    case 'p':
      return (
        <>
          <Circle cx="22.5" cy="13.5" r="5.2" fill={fill} />
          <Path d="M18.4 19.4h8.2l-1 2.8h-6.2z" fill={fill} />
          <Path
            d="M19 22.2h7.2c1.7 3.1 2.9 6.8 3.8 10.3H15.2c.9-3.5 2.1-7.2 3.8-10.3z"
            fill={fill}
          />
          <Rect x="12.5" y="32.5" width="20" height="4.8" rx="2.4" fill={fill} />
        </>
      );

    case 'r':
      return (
        <>
          <Path d="M11 8.5h5v4h4v-4h5v4h4v-4h5v9.5H11z" fill={fill} />
          <Path d="M14.5 18h16l-1.6 4.5H16.1z" fill={fill} />
          <Path d="M16.1 22.5h12.8l2 10H14.1z" fill={fill} />
          <Rect x="10" y="32.5" width="25" height="4.8" rx="2.4" fill={fill} />
        </>
      );

    case 'n':
      return (
        <>
          <Path
            d="M14.5 37c0-5.5 1-10.2 4.2-13.2l-2.3-3.6 6.2-1.6L24 12.2l3.2 5.2 5.8 2c2.6.9 4 3.1 4 5.6 0 1.7-.7 3.3-2 4.4l-1 1V37z"
            fill={fill}
          />
          <Circle cx="30.4" cy="21.7" r="0.95" fill={detail} stroke="none" />
          <Path
            d="M20.8 26.5c.9-3 1.2-5.6 1.8-7.9"
            fill="none"
            stroke={detail}
            strokeWidth={1.1}
          />
          <Rect x="11.5" y="32.5" width="22" height="4.8" rx="2.4" fill={fill} />
        </>
      );

    case 'b':
      return (
        <>
          <Circle cx="22.5" cy="6.4" r="1.9" fill={fill} />
          <Path
            d="M22.5 8.4c5.6 3 7.8 8.4 5 13.4H17.5c-2.8-5-.6-10.4 5-13.4z"
            fill={fill}
          />
          <Path d="M22.5 12.2 25.6 18" fill="none" stroke={detail} strokeWidth={1.2} />
          <Rect x="15.5" y="21.8" width="14" height="3.2" rx="1.6" fill={fill} />
          <Path
            d="M17.6 25h9.8c2.2 2.4 3.5 5 4.4 7.5H13.2c.9-2.5 2.2-5.1 4.4-7.5z"
            fill={fill}
          />
          <Rect x="11" y="32.5" width="23" height="4.8" rx="2.4" fill={fill} />
        </>
      );

    case 'q':
      return (
        <>
          <Path d="M10 18.5 12.2 9.2l5.2 5.3L22.5 7l5.1 7.5 5.2-5.3L35 18.5z" fill={fill} />
          <Circle cx="12.2" cy="8.4" r="1.9" fill={fill} />
          <Circle cx="17.4" cy="13.7" r="1.9" fill={fill} />
          <Circle cx="22.5" cy="6.1" r="2" fill={fill} />
          <Circle cx="27.6" cy="13.7" r="1.9" fill={fill} />
          <Circle cx="32.8" cy="8.4" r="1.9" fill={fill} />
          <Rect x="12.5" y="18.5" width="20" height="3.2" rx="1.6" fill={fill} />
          <Path
            d="M15 21.7h15c2 3.5 3.2 7.1 4 10.8H11c.8-3.7 2-7.3 4-10.8z"
            fill={fill}
          />
          <Rect x="9" y="32.5" width="27" height="4.8" rx="2.4" fill={fill} />
        </>
      );

    case 'k':
      return (
        <>
          <Path d="M20.4 3.6h4.2v3.4h3.4v4.2h-3.4v3.3h-4.2v-3.3h-3.4V7h3.4z" fill={fill} />
          <Path
            d="M12.2 21.5c0-3.1 2.1-5.2 5.3-5.2h10c3.2 0 5.3 2.1 5.3 5.2L31.5 28H13.5z"
            fill={fill}
          />
          <Path d="M13.5 28h18l2 4.5h-22z" fill={fill} />
          <Rect x="9.5" y="32.5" width="26" height="4.8" rx="2.4" fill={fill} />
        </>
      );
  }
}

export function ChessPiece({ type, color, size }: ChessPieceProps) {
  const { colors } = useTheme();
  const isWhite = color === 'w';

  const fill = isWhite ? colors.whitePiece : colors.blackPiece;
  const stroke = isWhite ? colors.whitePieceStroke : colors.blackPieceStroke;
  const detail = isWhite ? colors.whitePieceDetail : colors.blackPieceDetail;

  return (
    <Svg width={size} height={size} viewBox="0 0 45 45">
      <G stroke={stroke} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round">
        {renderPiece(type, fill, detail)}
      </G>
    </Svg>
  );
}
