import styled from 'styled-components';
import { GraphOuter } from '~client/components/graph/styles';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors, graphOverviewHeightMobile } from '~client/styled/variables';

export const GraphOverview = styled(GraphOuter)`
  flex: 0 0 auto;
  height: ${graphOverviewHeightMobile}px;
  box-shadow: 0 -2px 6px ${colors.shadow.light};
  z-index: 10;
  overflow: hidden;

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    flex: 0 0 300px;
    height: 300px;
    box-shadow: none;
  }
  ${breakpoint(breakpoints.tablet)} {
    flex: 0 1 520px;
    justify-content: center;
    align-items: center;
    overflow-y: auto;
    height: auto;
    max-height: 640px;
  }
`;
