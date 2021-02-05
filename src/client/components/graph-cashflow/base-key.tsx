import React from 'react';
import { FONT_GRAPH_TITLE } from '~client/constants/graph';
import { colors } from '~client/styled/variables';

export type Props = {
  title: string;
  height?: number;
  width?: number;
  children?: React.ReactNode;
};

const [fontSize, fontFamily] = FONT_GRAPH_TITLE;

export const BaseKey: React.FC<Props> = ({ title, children, height = 60, width = 200 }) => (
  <g>
    <rect x={45} y={8} width={width} height={height} fill={colors.translucent.light.dark} />

    <text
      x={65}
      y={10}
      color={colors.black}
      alignmentBaseline="hanging"
      fontSize={fontSize}
      fontFamily={fontFamily}
    >
      {title}
    </text>
    {children}
  </g>
);
