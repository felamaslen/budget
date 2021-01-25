import styled from '@emotion/styled';
import { rem } from 'polished';

import { FundRow } from '~client/components/page-funds/styles';
import { GRAPH_FUND_ITEM_HEIGHT_LARGE, GRAPH_FUND_ITEM_WIDTH_LARGE } from '~client/constants';
import { breakpoint } from '~client/styled/mixins';
import { FlexCenter } from '~client/styled/shared';
import { colors, breakpoints } from '~client/styled/variables';

export const Popout = styled(FlexCenter)`
  align-self: flex-start;
  background: ${colors.translucent.light.mediumLight};
  font-size: ${rem(11)};
  height: ${rem(GRAPH_FUND_ITEM_HEIGHT_LARGE)};
  justify-content: center;
  left: 0;
  position: absolute;
  width: ${rem(GRAPH_FUND_ITEM_WIDTH_LARGE)};
  z-index: 3;

  & > div {
    flex: 1;
  }

  ${FundRow}:nth-last-of-type(-n + 3) & {
    top: initial;
    bottom: 0;
  }

  ${breakpoint(breakpoints.mobile)} {
    &:focus {
      svg {
        background: ${colors.translucent.light.mediumLight};
        box-shadow: 0 3px 7px ${colors.shadow.light};
      }
    }
  }
`;
