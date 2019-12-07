import styled from 'styled-components';
import { darken } from 'polished';

import { colors, breakpoints, sizes } from '~/styled/variables';
import { rem, breakpoint } from '~/styled/mixins';

export const Header = styled.header`
  display: flex;
  flex: 0 0 ${rem(sizes.heightHeaderMobile)};
  flex-flow: column;
  z-index: 10;
  background: ${colors.white};
  color: ${colors.white};

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 ${rem(sizes.heightHeader)};
    flex-flow: row-reverse;
    justify-content: space-between;
    background: linear-gradient(to bottom, ${colors.primary}, ${darken(0.2, colors.primary)});
    box-shadow: 0 0 6px ${colors.shadowMedium};
  }
`;
