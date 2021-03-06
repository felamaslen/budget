import styled from '@emotion/styled';
import { breakpoint } from '~client/styled/mixins';
import { Page as PageBase } from '~client/styled/shared/page';
import { breakpoints } from '~client/styled/variables';

export const Page = styled(PageBase)`
  ${breakpoint(breakpoints.mobileSmall)} {
    flex-flow: column;
    flex: 1 1 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  ${breakpoint(breakpoints.tablet)} {
    flex-flow: row;
  }
`;
