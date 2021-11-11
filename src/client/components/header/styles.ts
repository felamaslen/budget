import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';

export const Header = styled.header`
  display: flex;
  flex: 0 0 ${rem(32)};
  flex-flow: column;
  z-index: 10;
  color: ${colors.white};
  background: ${colors.white};

  ${breakpoint(breakpoints.mobileSmall)} {
    flex: 0 0 ${rem(36)};
  }

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${rem(32)};
    flex-flow: row-reverse;
    justify-content: space-between;
    background: linear-gradient(to bottom, ${colors.primary}, ${colors.primaryDark});
    box-shadow: 0 0 6px ${colors.shadow.mediumDark};
  }
`;
