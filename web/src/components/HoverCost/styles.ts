import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { colors, breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const HoverCost = styled.span<{ hover: boolean }>`
  ${breakpoint(breakpoints.mobile)} {
    position: absolute;
    top: 0;
    left: 0px;

    ${({ hover }): false | FlattenSimpleInterpolation =>
      hover &&
      css`
        left: -2px;
        padding: 0 2px;
        background: ${colors['translucent-l8']};
      `}
  }
`;
