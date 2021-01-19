import { useState, useCallback, useMemo, HTMLAttributes, RefObject, CSSProperties } from 'react';
import { throttle } from 'throttle-debounce';

import { getPixY, getStackedData, isConstantColor } from '../helpers';
import { LabelBaseProps } from '~client/components/highlight-point/styles';
import { colors } from '~client/styled/variables';
import type { Point, Line, Calc, LineColor } from '~client/types';

function getHlColor(color: LineColor | undefined, point: Point, index: number): string {
  if (!color) {
    return colors.transparent;
  }
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
  key: string;
  group: string;
  point: Point;
  unstackedPoint: Point;
  secondary?: boolean;
  index: number;
};

type PointProps = Pick<Closest, 'point' | 'unstackedPoint'>;

export type LabelProps = LabelBaseProps & {
  name: string;
  main: PointProps;
  compare?: PointProps;
  posX: number;
  style?: CSSProperties;
};

export type HoverEffect = {
  Label: React.FC<LabelProps>;
};

export type HLPoint = {
  main: PointProps;
  compare?: PointProps;
  key: string;
  group: string;
  secondary?: boolean;
  color: string;
};

function reduceClosestPoint(lines: Line[], calc: Calc, { posX, posY }: Position): Closest | null {
  return lines
    .filter(({ hover = true }) => hover)
    .reduce<Closest | null>((last, line) => {
      const pixY = getPixY(calc, line.secondary);

      return getStackedData(line.data, line.stack).reduce<Closest | null>(
        (next, point, index): Closest | null => {
          const distX = Math.abs(calc.pixX(point[0]) - posX);
          const distY = Math.abs(pixY(point[1]) - posY);
          if (next && !(distX < next.distX || (distX === next.distX && distY < next.distY))) {
            return next;
          }

          return {
            distX,
            distY,
            key: line.key,
            group: line.name,
            point,
            unstackedPoint: line.data[index],
            secondary: line.secondary,
            index,
          };
        },
        last,
      );
    }, null);
}

function getClosest(
  lines: Line[],
  calc: Calc,
  position: Position,
  compareFrom?: string,
): Closest | null {
  const filteredLines = compareFrom ? lines.filter((line) => line.name === compareFrom) : lines;
  return reduceClosestPoint(filteredLines, calc, position);
}

type Props = {
  lines: Line[];
  isMobile?: boolean;
  calc: Calc;
  graphRef: RefObject<HTMLElement>;
  hoverEffect?: HoverEffect;
};
export { Props as HoverProps };

export type HookResult = {
  hlPoint: HLPoint | undefined;
  events: HTMLAttributes<Element>;
};

const getMousePosition = (pageX: number, pageY: number, graphRef: Props['graphRef']): Position => {
  if (!graphRef.current) {
    return { posX: 0, posY: 0 };
  }
  const { left, top } = graphRef.current.getBoundingClientRect();
  return { posX: pageX - left, posY: pageY - top };
};

export function useHover({
  lines,
  isMobile,
  graphRef,
  calc,
  hoverEffect,
}: Props): HookResult | null {
  const [hlPoint, setHlPoint] = useState<HLPoint | undefined>();

  const getClosestPoint = useCallback(
    (position: Position, compareFrom?: string): Closest | null =>
      isMobile ? null : getClosest(lines, calc, position, compareFrom),
    [calc, lines, isMobile],
  );

  const onHover = useCallback(
    (position: Position): void => {
      setHlPoint((last): HLPoint | undefined => {
        const compareFrom = last?.compare ? last.group : undefined;
        const closest = getClosestPoint(position, compareFrom);
        if (!closest) {
          return undefined;
        }

        const { key, group, point, unstackedPoint, secondary, index } = closest;
        const color = getHlColor(lines.find((line) => line.key === key)?.color, point, index);

        if (last?.compare) {
          return { ...last, compare: { point, unstackedPoint } };
        }
        return { main: { point, unstackedPoint }, key, group, secondary, color };
      });
    },
    [lines, getClosestPoint],
  );

  const onMouseMove = useMemo(
    () =>
      throttle(10, true, (event: React.MouseEvent) => {
        onHover(getMousePosition(event.pageX, event.pageY, graphRef));
      }),
    [onHover, graphRef],
  );

  const onMouseLeave = useCallback(
    () => setHlPoint((last) => (last?.compare ? last : undefined)),
    [],
  );

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      setHlPoint((last) => {
        if (!last) {
          return undefined;
        }
        const closest = getClosestPoint(getMousePosition(event.pageX, event.pageY, graphRef));
        if (!closest) {
          return undefined;
        }
        const { point, unstackedPoint } = closest;
        return { ...last, main: { point, unstackedPoint }, compare: { point, unstackedPoint } };
      });
    },
    [getClosestPoint, graphRef],
  );

  const onMouseUp = useCallback(() => setHlPoint(undefined), []);

  if (!hoverEffect) {
    return null;
  }
  return {
    hlPoint,
    events: { onMouseMove, onMouseOver: onMouseMove, onMouseLeave, onMouseDown, onMouseUp },
  };
}
