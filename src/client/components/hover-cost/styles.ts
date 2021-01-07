import styled from '@emotion/styled';
import { breakpoint } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

export const Main = styled.span``;

export const Hover = styled.span`
  display: none;
  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.translucent.light.mediumLight};
    position: absolute;
    left: 0;
    padding: 0 2px;
    top: 0;
  }
`;

export const HoverCost = styled.span<{ hover: boolean }>`
  outline: none;

  ${breakpoint(breakpoints.mobile)} {
    &:hover,
    &:focus {
      ${Main} {
        display: none;
      }
      ${Hover} {
        display: block;
      }
    }
  }
`;
