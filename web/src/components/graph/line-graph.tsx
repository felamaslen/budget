import React, { useRef, useState, useEffect, useMemo } from 'react';
import { genPixelCompute, defaultPadding } from '~client/components/graph/helpers';
import { LineGraphDumb, Props as GraphProps } from '~client/components/graph/line-graph-dumb';
import { Dimensions, Calc, RangeY } from '~client/types/graph';
import { getTickSize, normaliseTickSize } from '~client/modules/format';

import { useZoom, ZoomEffect } from './hooks/zoom';
import { useHover } from './hooks/hover';

export type Props = Pick<
  GraphProps,
  | 'name'
  | 'before'
  | 'beforeLines'
  | 'afterLines'
  | 'after'
  | 'lines'
  | 'outerProperties'
  | 'svgProperties'
  | 'hoverEffect'
> &
  Dimensions & {
    isMobile?: boolean;
    zoomEffect?: ZoomEffect;
  };

function normaliseSecondAxis(minY: number, maxY: number, minY2: number, maxY2: number): RangeY {
  // adjusts Y2 range so that each tick on each axis is a round number
  if (maxY2 === maxY || maxY2 === minY2) {
    return { minY2, maxY2, minY, maxY };
  }

  const tickSizePrimary = getTickSize(minY, maxY, 5);
  const minYNext = Math.floor(minY / tickSizePrimary) * tickSizePrimary;
  const maxYNext = Math.ceil(maxY / tickSizePrimary) * tickSizePrimary;

  const numTicks = Math.ceil((maxYNext - minYNext) / tickSizePrimary);

  const tickSizeSecondary = normaliseTickSize((maxY2 - minY2) / numTicks);

  const minY2Next = Math.floor(minY2 / tickSizeSecondary) * tickSizeSecondary;
  const maxY2Next = minY2Next + tickSizeSecondary * numTicks;

  const y2Shift = maxY2Next / maxY2 >= 0 ? 0 : -maxY2Next;

  const result = {
    minY: minYNext,
    maxY: maxYNext,
    minY2: minY2Next + y2Shift,
    maxY2: maxY2Next + y2Shift,
  };

  return result;
}

export const LineGraph: React.FC<Props> = ({
  name,
  before,
  beforeLines,
  afterLines,
  after,
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
  outerProperties,
  svgProperties,
  isMobile,
  hoverEffect,
  zoomEffect,
}) => {
  const graphRef = useRef<HTMLDivElement>(null);

  const dimensions = useMemo<Dimensions>(
    () => ({
      width,
      height,
      padding,
      ...normaliseSecondAxis(minY, maxY, minY2, maxY2),
      minX,
      maxX,
    }),
    [width, height, padding, minY, maxY, minY2, maxY2, minX, maxX],
  );

  const [calc, setCalc] = useState<Calc>(genPixelCompute(dimensions));

  useEffect(() => {
    setCalc(genPixelCompute(dimensions));
  }, [dimensions]);

  const [hlPoint, onMouseMove, onMouseLeave] = useHover({
    lines,
    isMobile,
    calc,
    hoverEffect,
  });

  const [, zoomedDimensions] = useZoom({
    dimensions,
    lines,
    isMobile,
    graphRef,
    calc,
    setCalc,
    zoomEffect,
  });

  const outerPropertiesProc = useMemo(
    () => ({
      onMouseMove,
      onMouseOver: onMouseMove,
      onMouseLeave,
      ...outerProperties,
    }),
    [onMouseMove, onMouseLeave, outerProperties],
  );

  if (!calc) {
    return null;
  }

  const graphProps = {
    name,
    before,
    beforeLines,
    afterLines,
    after,
    dimensions: zoomedDimensions,
    lines,
    calc,
    hlPoint,
    hoverEffect,
    outerProperties: outerPropertiesProc,
    svgProperties,
  };

  return <LineGraphDumb ref={graphRef} {...graphProps} />;
};
