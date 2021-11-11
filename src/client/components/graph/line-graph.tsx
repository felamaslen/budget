import { HTMLAttributes, useMemo, useRef } from 'react';

import { genPixelCompute, defaultPadding } from './helpers';
import { useHover } from './hooks';
import { LineGraphDumb, LineGraphDumbProps } from './line-graph-dumb';
import { getTickSize, normaliseTickSize } from '~client/modules/format';
import { Dimensions, Calc, RangeY, Line } from '~client/types/graph';

type Props = Pick<
  LineGraphDumbProps,
  | 'Before'
  | 'After'
  | 'BeforeLines'
  | 'AfterLines'
  | 'lines'
  | 'outerProperties'
  | 'svgProperties'
  | 'hoverEffect'
> &
  Dimensions & {
    isMobile?: boolean;
  };
export { Props as LineGraphProps };

function normaliseSecondAxis(
  minY: number,
  maxY: number,
  minY2: number,
  maxY2: number,
  capped = false,
): RangeY {
  // adjusts Y2 range so that each tick on each axis is a round number
  if (maxY2 === maxY || maxY2 === minY2) {
    return { minY2, maxY2, minY, maxY };
  }

  const tickSizePrimary = getTickSize(minY, maxY);

  const minYNext = Math.floor(minY / tickSizePrimary) * tickSizePrimary;
  const maxYNext = Math.ceil(maxY / tickSizePrimary) * tickSizePrimary;

  const numTicks = Math.ceil((maxYNext - minYNext) / tickSizePrimary);

  const tickSizeSecondary = capped
    ? (maxY2 - minY2) / numTicks
    : normaliseTickSize((maxY2 - minY2) / numTicks);

  const minY2Next = Math.floor(minY2 / tickSizeSecondary) * tickSizeSecondary;
  const maxY2Next = minY2Next + tickSizeSecondary * numTicks;

  const y2Shift = maxY2Next / maxY2 >= 0 ? 0 : -maxY2Next;

  return {
    minY: minYNext,
    maxY: maxYNext,
    minY2: minY2Next + y2Shift,
    maxY2: maxY2Next + y2Shift,
  };
}

export const LineGraph: React.FC<Props> = ({
  Before,
  After,
  BeforeLines,
  AfterLines,
  lines,
  width,
  height,
  padding = defaultPadding,
  minX,
  maxX,
  minY,
  maxY,
  minY2 = minY,
  maxY2 = maxY,
  y2Capped = false,
  outerProperties,
  svgProperties,
  isMobile,
  hoverEffect,
}) => {
  const graphRef = useRef<HTMLDivElement>(null);

  const linesSliced = useMemo<Line[]>(
    () =>
      lines.map<Line>((line) => {
        if (!line.sliceAtFirstPositive) {
          return line;
        }

        const firstPositiveIndex = Math.max(
          0,
          line.data.findIndex(([, value]) => value > 0) - line.sliceAtFirstPositive,
        );

        return {
          ...line,
          data: line.data.slice(firstPositiveIndex),
          stack: line.stack?.map((data) => data.slice(firstPositiveIndex)),
        };
      }),
    [lines],
  );

  const dimensions = useMemo<Dimensions>(
    () => ({
      width,
      height,
      padding,
      ...normaliseSecondAxis(minY, maxY, minY2, maxY2, y2Capped),
      minX,
      maxX,
    }),
    [width, height, padding, minY, maxY, minY2, maxY2, minX, maxX, y2Capped],
  );

  const calc = useMemo<Calc>(() => genPixelCompute(dimensions), [dimensions]);

  const hover = useHover({
    lines: linesSliced,
    isMobile,
    graphRef,
    calc,
    hoverEffect,
  });

  const outerPropertiesMemo = useMemo<HTMLAttributes<HTMLDivElement>>(
    () => ({ ...(hover?.events ?? {}), ...outerProperties }),
    [hover?.events, outerProperties],
  );

  if (!calc) {
    return null;
  }

  return (
    <LineGraphDumb
      ref={graphRef}
      Before={Before}
      BeforeLines={BeforeLines}
      AfterLines={AfterLines}
      After={After}
      dimensions={dimensions}
      lines={linesSliced}
      calc={calc}
      hlPoint={hover?.hlPoint}
      hoverEffect={hoverEffect}
      outerProperties={outerPropertiesMemo}
      svgProperties={svgProperties}
    />
  );
};
