import { useState, useCallback, useMemo } from 'react';
import { throttle } from 'throttle-debounce';

import { getPixY, getStackedData, isConstantColor } from '../helpers';
import { NULL } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import type { Point, Line, Calc, LineColor } from '~client/types';

function getHlColor(color: LineColor, point: Point, index: number): string {
  if (isConstantColor(color)) {
    return color;
  }
  if (typeof color === 'function') {
    return color(point, index);
  }

  return colors.black;
}

type Position = {
  posX: number;
  posY: number;
};

type Closest = {
  distX: number;
  distY: number;
  lineIndex: number;
  point: Point;
  secondary?: boolean;
  index: number;
};

export type HoverEffect = {
  labelX: (value: number) => string;
  labelY: (value: number) => string;
  labelY2?: (value: number) => string;
  labelWidth?: number;
};

export type HLPoint = {
  valX: number;
  valY: number;
  secondary?: boolean;
  color: string;
};

function getClosest(lines: Line[], position: Position, calc: Calc): Closest | null {
  if (!position) {
    return null;
  }

  const { posX, posY } = position;

  return lines.reduce<Closest | null>((red, line, lineIndex) => {
    if (line.hover === false) {
      return red;
    }

    const pixY = getPixY(calc, line.secondary);

    return getStackedData(line.data, line.stack).reduce<Closest | null>((last, point, index) => {
      const distX = Math.abs(calc.pixX(point[0]) - posX);
      const distY = Math.abs(pixY(point[1]) - posY);
      if (last && !(distX < last.distX || (distX === last.distX && distY < last.distY))) {
        return last;
      }

      return {
        distX,
        distY,
        lineIndex,
        point,
        secondary: line.secondary,
        index,
      };
    }, red);
  }, null);
}

type Props = {
  lines: Line[];
  isMobile?: boolean;
  calc: Calc;
  hoverEffect?: HoverEffect;
};
export { Props as HoverProps };

export type HookResult = [
  HLPoint | undefined,
  (o: { pageX: number; pageY: number; currentTarget: HTMLElement }) => void,
  () => void,
];

export function useHover({ lines, isMobile, calc, hoverEffect }: Props): HookResult {
  const [hlPoint, setHlPoint] = useState<HLPoint | undefined>();

  const onHover = useCallback(
    (position: Position): void => {
      if (!(calc && lines && !isMobile)) {
        return;
      }

      const closest = getClosest(lines, position, calc);
      if (!closest) {
        setHlPoint(undefined);
        return;
      }

      const { lineIndex, point, secondary, index } = closest;
      const color = getHlColor(lines[lineIndex].color, point, index);
      const [valX, valY] = point;

      setHlPoint({ valX, valY, secondary, color });
    },
    [lines, isMobile, calc],
  );

  const onMouseMove = useMemo(() => {
    const handler = throttle(10, true, (pageX, pageY, currentTarget) => {
      const { left, top } = currentTarget.getBoundingClientRect();

      onHover({
        posX: pageX - left,
        posY: pageY - top,
      });
    });

    return ({
      pageX,
      pageY,
      currentTarget,
    }: {
      pageX: number;
      pageY: number;
      currentTarget: HTMLElement;
    }): void => handler(pageX, pageY, currentTarget);
  }, [onHover]);

  const onMouseLeave = useCallback(() => setHlPoint(undefined), []);

  if (!hoverEffect) {
    return [undefined, NULL, NULL];
  }

  return [hlPoint, onMouseMove, onMouseLeave];
}