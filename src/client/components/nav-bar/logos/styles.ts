import styled from '@emotion/styled';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const StrokedPath = styled.path`
  fill: none;
  stroke: ${colors.black};
  ${breakpoint(breakpoints.mobile)} {
    stroke: ${colors.white};
  }
`;

export const FilledPath = styled.path`
  fill: ${colors.black};
  ${breakpoint(breakpoints.mobile)} {
    fill: ${colors.white};
  }
`;
