import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';

import { breakpoints, colors, sizes } from '~client/styled/variables';

export const Outer = styled.div`
  align-items: center;
  background: ${colors.translucent.light.mediumLight};
  display: flex;
  flex-flow: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: ${rem(36)};
  width: 100%;
  z-index: 500;

  ${breakpoint(breakpoints.mobile)} {
    top: ${rem(sizes.navbarHeight)};
  }
`;
