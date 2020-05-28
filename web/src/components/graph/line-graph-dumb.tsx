import React, { useMemo, forwardRef } from 'react';

import { HoverEffect, HLPoint } from './hooks/hover';
import { RenderedLine } from './rendered-line';
import { Graph, GraphProps } from './shared';
import { HighlightPoint } from '~client/components/HighlightPoint';
import { Dimensions, Calc, DrawProps, Line } from '~client/types/graph';

function useBeforeAfter(
  component: React.FC<DrawProps> | undefined,
  basicProps: DrawProps,
): React.ReactElement | null {
  return useMemo(() => (component ? component(basicProps) : null), [component, basicProps]);
}

type Props = GraphProps & {
  name: string;
  dimensions: Dimensions;
  calc: Calc;
  lines: Line[];
  hlPoint?: HLPoint;
  beforeLines?: React.FC<DrawProps>;
  afterLines?: React.FC<DrawProps>;
  hoverEffect?: HoverEffect;
};
export { Props as LineGraphDumbProps };

const LineGraphDumbWithoutRef: React.RefForwardingComponent<HTMLDivElement, Props> = (
  {
    name,
    before,
    after,
    dimensions,
    calc,
    lines,
    hlPoint,
    beforeLines,
    afterLines,
    outerProperties,
    svgProperties,
    hoverEffect,
  },
  graphRef,
) => {
  const basicProps = useMemo<DrawProps>(
    () => ({
      ...dimensions,
      ...calc,
    }),
    [dimensions, calc],
  );

  const graphProps = {
    name,
    before,
    after,
    outerProperties,
    svgProperties,
    ...basicProps,
  };

  const renderedLines = useMemo(
    () =>
      lines.map(({ key, ...line }) => (
        <RenderedLine key={key} line={line} {...dimensions} {...calc} />
      )),
    [dimensions, lines, calc],
  );

  const beforeLinesProc = useBeforeAfter(beforeLines, basicProps);
  const afterLinesProc = useBeforeAfter(afterLines, basicProps);

  if (!lines.length) {
    return <Graph ref={graphRef} {...graphProps} />;
  }

  return (
    <Graph ref={graphRef} {...graphProps}>
      {beforeLinesProc}
      {renderedLines}
      {afterLinesProc}
      {hoverEffect && (
        <HighlightPoint
          pixX={calc.pixX}
          pixY1={calc.pixY1}
          minY={dimensions.minY}
          maxY={dimensions.maxY}
          width={dimensions.width}
          height={dimensions.height}
          hlPoint={hlPoint}
          hoverEffect={hoverEffect}
        />
      )}
    </Graph>
  );
};

export const LineGraphDumb = forwardRef(LineGraphDumbWithoutRef);
