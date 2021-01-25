import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { GRAPH_FUND_ITEM_WIDTH } from '~client/constants';
import { breakpoint } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

type FundGraphProps = {
  sold: boolean;
  popout: boolean;
};
const fundGraphStyles = ({ sold, popout }: FundGraphProps): SerializedStyles => css`
  align-items: center;
  display: flex;
  justify-content: center;
  position: relative;

  ${breakpoint(breakpoints.mobile)} {
    height: 100%;
    flex: 0 0 ${rem(GRAPH_FUND_ITEM_WIDTH)};
    outline: none;
    z-index: ${popout ? 3 : 2};

    &:focus {
      box-shadow: inset 0 0 1px 1px ${colors.blue};
    }

    ${sold &&
    css`
      filter: grayscale(100%);
      z-index: initial;
    `}
  }
`;
export const FundGraph = styled.div<FundGraphProps>(fundGraphStyles);
