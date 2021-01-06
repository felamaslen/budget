import { readableColor } from 'polished';
import React from 'react';

import { defaultPadding, getPixY } from '~client/components/graph/helpers';
import { HoverEffect, HLPoint } from '~client/components/graph/hooks';
import { FONT_GRAPH_TITLE } from '~client/constants/graph';
import type { RangeY, Size, Padding, Calc } from '~client/types';

type Props = {
  hoverEffect: HoverEffect;
  hlPoint?: HLPoint;
  calc: Calc;
} & RangeY &
  Size;

type TextProps = {
  fontSize: number;
  fontFamily: string;
  fill: string;
  x: number;
  y: number;
  textAnchor: 'start' | 'end' | 'middle';
  alignmentBaseline: 'hanging' | 'middle' | 'baseline';
};

const [, fontFamily] = FONT_GRAPH_TITLE;
const fontSizeX = 10;
const fontSizeY = 12;

const isLabelAtTop = (posY: number, height: number): boolean => posY > height / 2;

function getLabelPosX(posX: number, width: number, padding: Padding, labelWidth: number): number {
  const posRight = width - padding[1] - labelWidth / 2;
  const posLeft = padding[3] + labelWidth / 2;

  return Math.max(posLeft, Math.min(posRight, posX));
}

export const HighlightPoint: React.FC<Props> = ({
  calc,
  minY,
  maxY,
  width,
  height,
  padding = defaultPadding,
  hoverEffect: { labelWidth = 88, labelX, labelY, labelY2 = labelY },
  hlPoint,
}) => {
  if (!hlPoint || maxY === minY) {
    return null;
  }

  const { valX, valY, color } = hlPoint;

  const posX = Math.floor(calc.pixX(valX)) + 0.5;
  const posY = Math.floor(getPixY(calc, hlPoint.secondary)(valY)) + 0.5;
  if (Number.isNaN(posX) || Number.isNaN(posY)) {
    return null;
  }

  const labelHeight = fontSizeX + fontSizeY + 4;

  const labelPosX = getLabelPosX(posX, width, padding, labelWidth);
  const labelPosY = isLabelAtTop(posY, height) ? padding[0] : height - padding[2] - labelHeight;

  const pathVertical = `M${posX},0 L${posX},${height}`;
  const pathHorizontal = `M0,${posY} L${width},${posY}`;

  const lineProps = { stroke: color, strokeDasharray: '3,2' };
  const textColor = readableColor(color);

  const textProps: TextProps = {
    x: labelPosX,
    y: labelPosY,
    fontSize: fontSizeY,
    fontFamily,
    fill: textColor,
    textAnchor: 'middle',
    alignmentBaseline: 'hanging',
  };

  const textPropsX: TextProps = {
    ...textProps,
    y: labelPosY + 3,
    fontSize: fontSizeX,
  };

  const textPropsY: TextProps = {
    ...textProps,
    y: labelPosY + fontSizeX + 3,
    fontSize: fontSizeY,
  };

  return (
    <g>
      <path d={pathVertical} {...lineProps} />
      <path d={pathHorizontal} {...lineProps} />
      <rect
        x={labelPosX - labelWidth / 2}
        y={labelPosY}
        width={labelWidth}
        height={labelHeight}
        fill={color}
      />
      <text {...textPropsX}>{labelX(valX)}</text>
      <text {...textPropsY}>{(hlPoint.secondary ? labelY2 : labelY)(valY)}</text>
    </g>
  );
};
