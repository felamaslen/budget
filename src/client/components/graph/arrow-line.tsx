import React, { useMemo } from 'react';
import { getPixY, isConstantColor } from './helpers';
import { Arrow } from '~client/components/arrow';
import type { UnkeyedLine, RangeY, Pix, Point } from '~client/types';

type Props = Omit<UnkeyedLine, 'name'> & RangeY & Pix;

export const ArrowLine: React.FC<Props> = ({ data, color, pixY1, pixY2, secondary, ...props }) => {
  const pixY = getPixY({ pixY1, pixY2 }, secondary);

  const getColor = useMemo<(point: Point) => string>(() => {
    if (isConstantColor(color)) {
      return (): string => color;
    }
    if (typeof color === 'function') {
      return color;
    }

    return (): string => '#000';
  }, [color]);

  if (props.minY === 0 || props.maxY === 0) {
    return null;
  }

  const y0 = pixY(0);

  const arrows = data.map((point, key) => {
    const [xValue, yValue] = point;
    const sizeRatio = yValue > 0 ? yValue / props.maxY : yValue / props.minY;

    return (
      <Arrow
        key={key}
        pixY={pixY}
        startX={xValue}
        startY={0}
        length={Math.abs(pixY(yValue) - y0)}
        angle={Math.PI * (yValue < 0 ? 1.5 : 0.5)}
        arrowSize={sizeRatio}
        color={getColor(point)}
        fill
        strokeWidth={3 * sizeRatio}
        {...props}
      />
    );
  });

  return <g>{arrows}</g>;
};
