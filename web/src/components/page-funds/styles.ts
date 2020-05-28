import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { FundProps } from './types';
import {
  StandardRow,
  StandardHeader,
  HeaderColumn,
  Base,
} from '~client/components/accessible-list/styles';
import { rem, breakpoint } from '~client/styled/mixins';
import { Page } from '~client/styled/shared/page';
import { breakpoints, colors } from '~client/styled/variables';

export const fieldSizes = {
  item: 380,
  transactions: 104,
};

export const PageFunds = styled(Page)`
  flex: 1 0 0;
  flex-direction: column-reverse;
  height: 100%;

  ${breakpoint(breakpoints.mobile)} {
    flex-direction: column;
    overflow-y: auto;

    ${Base} {
      flex: 0 1 800px;
    }
  }
  ${breakpoint(breakpoints.desktop)} {
    flex-direction: row;
  }
`;

export const FundRow = styled(StandardRow)<Partial<FundProps>>`
  ${breakpoint(breakpoints.mobile)} {
    align-items: center;
    border: none;
    display: flex;
    height: ${rem(48)};
    line-height: ${rem(48)};
    position: relative;

    &:nth-child(2n) {
      background-color: inherit;
    }

    ${({ isSold = false }): false | FlattenSimpleInterpolation =>
      isSold &&
      css`
        height: ${rem(24)};
        line-height: ${rem(24)};
        font-style: italic;
        color: ${colors['slightly-light']};
      `};
  }
`;

export const FundRowMobile = styled(StandardRow)<{ isSold: boolean }>`
  display: flex;

  ${({ isSold }): false | FlattenSimpleInterpolation =>
    isSold &&
    css`
      color: ${colors['medium-light']};
    `};
`;

export const MobilePie = styled.div`
  align-items: center;
  display: inline-flex;
  margin-right: ${rem(4)};
`;

export const FundNameMobile = styled.span`
  color: inherit;
  flex: 1;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const FundValueMobile = styled.div`
  color: inherit;
  display: flex;
  flex: 0 0 auto;
  margin-left: 10px;
  flex: 0 0 auto;
  font-size: 90%;
`;

const PartMobile = styled.span`
  margin-right: 4px;
`;

export const CostMobile = styled(PartMobile)`
  flex: 0 0 auto;
  text-align: right;
`;
export const ValueMobile = styled(PartMobile)`
  width: 50px;
  flex: 0 0 auto;
  font-weight: bold;
  text-align: center;
`;

export const FundHeader = styled(StandardHeader)`
  ${breakpoint(breakpoints.mobile)} {
    align-items: center;
    display: flex;
    height: ${rem(34)};
  }
`;

export const FundHeaderColumn = styled(HeaderColumn)<{ column: string }>`
  ${breakpoint(breakpoints.mobile)} {
    border-right: none;
    flex: 0 0 ${({ column }): string => rem(Reflect.get(fieldSizes, column))};
    min-width: ${({ column }): string => rem(Reflect.get(fieldSizes, column))};
    overflow: visible;

    &:not(:first-child) {
      padding: 0;
    }
  }
`;
