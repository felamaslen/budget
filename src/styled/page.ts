import styled from 'styled-components';

import { breakpoint } from '~/styled/mixins';
import { breakpoints } from '~/styled/variables';
import { FlexColumn } from '~/styled/layout';

export const Page = styled(FlexColumn)`
  min-height: 0;
  width: 100%;
  flex: 1 1 0;
  overflow-y: auto;
  overflow-x: hidden;

  ${breakpoint(breakpoints.tablet)} {
    flex-flow: row;
    position: relative;
  }
`;
