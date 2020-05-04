import React from 'react';

import { Size } from '~client/types/graph';
import * as Styled from './styles';

export type GraphRef = React.MutableRefObject<HTMLDivElement | null>;

export type GraphProps = {
  outerProperties?: object;
  svgProperties?: object;
  before?: React.FC;
  after?: React.FC;
};

export type Props = Size & GraphProps;

const GraphWithoutRef: React.RefForwardingComponent<HTMLDivElement, Props> = (
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
