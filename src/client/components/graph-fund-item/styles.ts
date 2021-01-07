import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import { FundRow } from '~client/components/page-funds/styles';
import { breakpoint } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

export const graphFundItemWidth = 100;
export const graphFundItemWidthLarge = 300;

type FundGraphProps = {
  sold: boolean;
  popout: boolean;
};
const fundGraphStyles = ({ popout, sold }: FundGraphProps): SerializedStyles => css`
  display: inline-block;

  ${breakpoint(breakpoints.mobile)} {
    height: 100%;
    flex: 0 0 ${rem(graphFundItemWidth)};
    outline: none;
    position: relative;
    z-index: 2;

    &:focus {
      box-shadow: inset 0 0 1px 1px ${colors.blue};

      ${popout &&
      css`
        z-index: 5;

        svg {
          position: absolute;
          background: ${colors.translucent.light.mediumLight};
          box-shadow: 0 3px 7px ${colors.shadow.light};
          width: ${rem(graphFundItemWidthLarge)};
          height: 120px;
        }
      `};
    }

    ${FundRow}:nth-last-of-type(-n + 3) & {
      svg {
        top: initial;
        bottom: 0;
      }
    }

    ${sold &&
    css`
      filter: grayscale(100%);
      z-index: initial;
    `}
  }
`;

export const FundGraph = styled.div<FundGraphProps>(fundGraphStyles);
