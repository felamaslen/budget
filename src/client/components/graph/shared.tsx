import { forwardRef } from 'react';

import * as Styled from './styles';
import type { Size } from '~client/types';

export type GraphProps = {
  outerProperties?: React.HTMLAttributes<HTMLDivElement>;
  svgProperties?: React.HTMLAttributes<SVGElement>;
  Before?: React.ReactElement;
  After?: React.ReactElement;
  children?: React.ReactNode;
};

export type Props = Size & GraphProps;

export const Graph = forwardRef<HTMLDivElement, Props>(
  ({ width, height, svgProperties, outerProperties, Before, After, children }, ref) => (
    <Styled.Graph ref={ref} {...outerProperties} width={width} height={height}>
      {Before}
      <svg data-testid="graph-svg" width={width} height={height} {...svgProperties}>
        {children}
      </svg>
      {After}
    </Styled.Graph>
  ),
);
Graph.displayName = 'Graph';
