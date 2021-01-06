import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rem } from 'polished';

import type { FundProps } from './types';
import {
  StandardRow,
  StandardHeader,
  HeaderColumn,
  Base,
} from '~client/components/accessible-list/styles';
import { breakpoint } from '~client/styled/mixins';
import { FlexColumn } from '~client/styled/shared/layout';
import { Page } from '~client/styled/shared/page';
import { breakpoints, colors } from '~client/styled/variables';

export const fieldSizes = {
  item: 356,
  transactions: 104,
};

export const PageFunds = styled(Page)`
  flex: 1 0 0;
  flex-direction: column-reverse;
  height: 100%;

  ${breakpoint(breakpoints.mobile)} {
    flex-direction: column-reverse;
    overflow-y: auto;

    ${Base} {
      flex: 1;
    }
  }
  ${breakpoint(breakpoints.desktop)} {
    flex-direction: row;
  }
`;

export const FundRow = styled(StandardRow)<Partial<FundProps>>(
  ({ isSold = false }) => css`
    ${breakpoint(breakpoints.mobile)} {
      align-items: center;
      border: none;
      display: flex;
      height: ${rem(48)};
      line-height: ${rem(48)};

      &:nth-of-type(2n) {
        background-color: inherit;
      }

      ${isSold &&
      css`
        height: ${rem(24)};
        line-height: ${rem(24)};
        font-style: italic;
        color: ${colors.light.mediumDark};
      `};
    }
  `,
);

export const CashRow = styled(FundRow)`
  height: ${rem(48)};
`;

export const TargetAllocation = styled(FlexColumn)`
  align-items: center;
  height: 100%;
  margin: 0 ${rem(2)};
  width: ${rem(20)};

  svg {
    flex: 0 0 auto;
    margin: ${rem(6)} 0;
  }
  span {
    font-size: ${rem(10)};
    font-weight: bold;
    line-height: ${rem(16)};
  }
`;

export const FundRowMobile = styled(StandardRow)<{ isSold: boolean }>(
  ({ isSold }) => css`
    display: flex;
    align-items: center;

    ${isSold &&
    css`
      color: ${colors.medium.light};
    `};
  `,
);

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

    &:not(:first-of-type) {
      padding: 0;
    }
  }
`;

export const CashAllocation = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;

  ${breakpoint(breakpoints.mobile)} {
    border-right: 1px solid ${colors.light.mediumDark};
    flex: 0 0 ${rem(fieldSizes.item / 2)};
    flex-flow: column;
    height: ${rem(48)};
    width: auto;
  }
`;

const CashAllocationSection = styled.div`
  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 50%;
    line-height: ${rem(24)};
  }
`;

export const CashToInvest = styled(CashAllocationSection)`
  font-weight: bold;
`;
export const CashTarget = styled(CashAllocationSection)`
  align-items: center;
  display: flex;
  flex-flow: row;
  font-size: ${rem(12)};

  input {
    font-size: ${rem(12)} !important;
    line-height: inherit;
    height: 100% !important;
    width: ${rem(48)};
  }

  button {
    margin-left: ${rem(4)};
  }

  ${breakpoint(breakpoints.mobile)} {
    justify-content: space-between;
    padding: 0 ${rem(10)};
    width: 100%;
  }
`;
