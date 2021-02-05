import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

export const Main = styled.span`
  ${breakpoint(breakpoints.mobile)} {
    position: absolute;
    left: 0;
    padding: 0 ${rem(2)};
    top: 0;
  }
`;

export const Hover = styled(Main)`
  display: none;
  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.translucent.light.mediumLight};
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
