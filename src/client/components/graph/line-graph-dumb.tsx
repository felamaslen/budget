import { forwardRef, ForwardRefRenderFunction } from 'react';

import type { HoverEffect, HLPoint } from './hooks';
import { RenderedLineGroup } from './rendered-line';
import { Graph, GraphProps, Props as SizedGraphProps } from './shared';
import { HighlightPoint } from '~client/components/highlight-point';
import type { Dimensions, Calc, DrawProps, Line } from '~client/types';

export type SiblingProps = DrawProps & Pick<Props, 'hlPoint'>;

type SiblingType = React.ReactElement | React.FC<SiblingProps>;

type Props = GraphProps & {
  dimensions: Dimensions;
  calc: Calc;
  lines: Line[];
  hlPoint?: HLPoint;
  BeforeLines?: SiblingType;
  AfterLines?: SiblingType;
  hoverEffect?: HoverEffect;
};
export type { Props as LineGraphDumbProps };

type SiblingWrapperProps = {
  Sibling?: SiblingType;
} & Pick<Props, 'dimensions' | 'calc' | 'hlPoint'>;

const LineSibling: React.FC<SiblingWrapperProps> = ({ Sibling, dimensions, calc, hlPoint }) => {
  if (!Sibling) {
    return null;
  }
  if (typeof Sibling !== 'function') {
    return Sibling;
  }
  return <Sibling {...dimensions} {...calc} hlPoint={hlPoint} />;
};

const LineGraphDumbWithoutRef: ForwardRefRenderFunction<HTMLDivElement, Props> = (
  {
    Before,
    After,
    dimensions,
    calc,
    lines,
    hlPoint,
    BeforeLines,
    AfterLines,
    outerProperties,
    svgProperties,
    hoverEffect,
  },
  graphRef,
) => {
  const AfterWithHighlightPoint = (
    <>
      {After}
      {hoverEffect && (
        <HighlightPoint
          calc={calc}
          minY={dimensions.minY}
          maxY={dimensions.maxY}
          width={dimensions.width}
          height={dimensions.height}
          hlPoint={hlPoint}
          hoverEffect={hoverEffect}
          padding={dimensions.padding}
        />
      )}
    </>
  );

  const graphProps: SizedGraphProps = {
    Before,
    After: AfterWithHighlightPoint,
    outerProperties,
    svgProperties,
    ...dimensions,
    ...calc,
  };

  if (!lines.length) {
    return <Graph ref={graphRef} {...graphProps} />;
  }

  return (
    <Graph ref={graphRef} {...graphProps}>
      <LineSibling Sibling={BeforeLines} dimensions={dimensions} calc={calc} hlPoint={hlPoint} />
      <RenderedLineGroup lines={lines} {...dimensions} {...calc} />
      <LineSibling Sibling={AfterLines} dimensions={dimensions} calc={calc} hlPoint={hlPoint} />
    </Graph>
  );
};

export const LineGraphDumb = forwardRef(LineGraphDumbWithoutRef);
