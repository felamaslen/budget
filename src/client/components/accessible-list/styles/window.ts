import styled from '@emotion/styled';
import { rem } from 'polished';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints } from '~client/styled/variables';

export const InfiniteWindow = styled.div`
  flex: 1;
  padding-bottom: ${rem(48)};

  ${breakpoint(breakpoints.mobile)} {
    padding-bottom: 0;
  }
`;
