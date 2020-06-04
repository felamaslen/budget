import React from 'react';
import { FONT_AXIS_LABEL } from '~client/constants/graph';
import { colors } from '~client/styled/variables';
import { Pix, Dimensions } from '~client/types/graph';

type Props = Pix &
  Dimensions & {
    popout: boolean;
  };

export const Axes: React.FC<Props> = ({ popout, minX, minY, maxY, height, pixX, pixY1 }) => {
  if (!popout) {
    return null;
  }

  const range = maxY - minY;
  const increment = Math.round(Math.max(20, height / range) / (height / range) / 2) * 2;
  const start = Math.ceil(minY / increment) * increment;
  const numTicks = Math.ceil(range / increment);

  if (!numTicks) {
    return null;
  }

  const x0 = pixX(minX);
  const [fontSize, fontFamily] = FONT_AXIS_LABEL;

  const ticks = new Array(numTicks).fill(0).map((_, key) => {
    const tickValue = start + key * increment;
    const tickPos = Math.floor(pixY1(tickValue)) + 0.5;
    const tickName = `${tickValue.toFixed(1)}p`;

    return (
      <text
        key={tickName}
        x={x0}
        y={tickPos}
        color={colors.dark.light}
        fontSize={fontSize}
        fontFamily={fontFamily}
      >
        {tickName}
      </text>
    );
  });

  return <g>{ticks}</g>;
};
