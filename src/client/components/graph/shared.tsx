import React from 'react';

import * as Styled from './styles';
import { Size } from '~client/types/graph';

export type GraphProps = {
  outerProperties?: Record<string, unknown>;
  svgProperties?: Record<string, unknown>;
  before?: React.FC;
  after?: React.FC;
  children?: React.ReactNode;
};

export type Props = Size & GraphProps;

const GraphWithoutRef: React.ForwardRefRenderFunction<HTMLDivElement, Props> = (
  {
    width,
    height,
    svgProperties,
    outerProperties,
    before: Before = null,
    after: After = null,
    children,
  },
  ref,
) => (
  <Styled.Graph ref={ref} {...outerProperties} width={width} height={height}>
    {Before && <Before />}
    <svg data-testid="graph-svg" width={width} height={height} {...svgProperties}>
      {children}
    </svg>
    {After && <After />}
  </Styled.Graph>
);

export const Graph = React.forwardRef<HTMLDivElement, Props>(GraphWithoutRef);
