import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { FundRow } from '~client/components/page-funds/styles';
import { breakpoint, rem } from '~client/styled/mixins';
import { colors, breakpoints } from '~client/styled/variables';

export const graphFundItemWidth = 100;
export const graphFundItemWidthLarge = 300;

export const FundGraph = styled.div<{
  sold: boolean;
  popout: boolean;
}>`
  display: inline-block;

  ${breakpoint(breakpoints.mobile)} {
    height: 100%;
    flex: 0 0 ${rem(graphFundItemWidth)};
    outline: none;
    position: relative;
    z-index: 2;

    &:focus {
      box-shadow: inset 0 0 1px 1px ${colors.blue};

      ${({ popout }): false | FlattenSimpleInterpolation =>
        popout &&
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

    ${FundRow}:nth-last-child(-n + 3) & {
      svg {
        top: initial;
        bottom: 0;
      }
    }

    ${({ sold }): false | FlattenSimpleInterpolation =>
      sold &&
      css`
        filter: grayscale(100%);
        z-index: initial;
      `}
  }
`;
