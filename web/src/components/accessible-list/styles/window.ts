import styled from 'styled-components';
import { rem, breakpoint } from '~client/styled/mixins';
import { breakpoints } from '~client/styled/variables';

export const InfiniteWindow = styled.div`
  flex: 1;
  padding-bottom: ${rem(48)};

  ${breakpoint(breakpoints.mobile)} {
    padding-bottom: 0;
  }
`;
