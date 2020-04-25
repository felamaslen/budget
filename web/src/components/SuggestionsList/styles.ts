import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { colors, breakpoints } from '~client/styled/variables';
import { breakpoint } from '~client/styled/mixins';

export const Suggestions = styled.ul`
  ${breakpoint(breakpoints.mobile)} {
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100%;
    z-index: 10;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: 0 3px 6px ${colors['shadow-l3'] as string};
    background: ${colors['translucent-l95'] as string};
  }
`;

export const Suggestion = styled.li<{ active: boolean }>`
  margin: 1px 0;
  padding: 2px;
  cursor: default;

  ${({ active }): false | FlattenSimpleInterpolation =>
    active &&
    css`
      background: ${colors.blue as string};
      color: ${colors.white as string};
    `}
`;
