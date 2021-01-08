import { css, keyframes, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { desaturate, rem } from 'polished';

import { FundRow } from '~client/components/page-funds/styles';
import { IDENTITY } from '~client/modules/data';
import { breakpoint } from '~client/styled/mixins';
import { InlineFlex } from '~client/styled/shared';
import {
  breakpoints,
  upArrow,
  upArrowStrong,
  downArrow,
  downArrowStrong,
  colors,
} from '~client/styled/variables';

type ProfitProps = { gain: number };
type SoldProps = { isSold?: boolean };

const profitColor = (
  gain: ProfitProps['gain'],
  postProcess: (value: string) => string = IDENTITY,
): string => postProcess(gain >= 0 ? colors.profit.dark : colors.loss.dark);

const Column = styled.span`
  display: flex;
  flex: 1 0 0;
  flex-flow: column;
  overflow: visible;
  text-overflow: unset;
`;

export const Value = styled.span<{ isRow?: boolean }>`
  color: ${colors.dark.light};
  flex: 1;
  font-weight: bold;
  margin-right: ${rem(4)};
  text-align: ${({ isRow }): 'left' | 'right' => (isRow ? 'right' : 'left')};

  ${breakpoint(breakpoints.mobile)} {
    width: 68px;
    text-align: left;
    flex: 1 1 0;
    font-size: ${rem(18)};
    margin-right: ${rem(0)};
    overflow: visible !important;
  }
`;

export const Breakdown = styled(InlineFlex)<{ isRow?: boolean }>`
  flex: 2;

  ${breakpoint(breakpoints.mobile)} {
    background: ${({ isRow }): string =>
      isRow ? colors.translucent.light.dark : colors.transparent};
    flex: 2 1 0;
  }
`;

const overallStyles = ({ isSold }: SoldProps): SerializedStyles => css`
  flex: ${isSold ? '1' : '0 0 50%'};
  font-weight: bold;
  flex-flow: ${isSold ? 'row' : 'column'};
  max-width: 50%;

  ${breakpoint(breakpoints.mobile)} {
    max-width: ${isSold ? 100 : 50}%;
  }
`;
export const Overall = styled(Column)<SoldProps>(overallStyles);

export const DayGainOuter = styled(Column)`
  flex: 0 0 50%;
  ${breakpoint(breakpoints.mobile)} {
    flex: 1;
    padding-right: ${rem(8)};
  }
`;

export const BreakdownValue = styled.span<ProfitProps>(
  ({ gain }) => css`
    color: ${profitColor(gain)};
    text-align: right;

    ${breakpoint(breakpoints.mobile)} {
      flex: 1 0 0;
      font-size: ${rem(13)};
      line-height: 24px;
      height: 24px;
    }
  `,
);

const BreakdownAbs = styled(BreakdownValue)`
  &::before {
    content: ${({ gain }): string => {
      if (gain >= 0.1) {
        return upArrowStrong;
      }
      if (gain >= 0) {
        return upArrow;
      }
      if (gain > -0.05) {
        return downArrow;
      }

      return downArrowStrong;
    }};
    font-style: normal;
    margin-right: 0.2em;
  }
`;

export const GainAbs = styled(BreakdownAbs)``;
export const Gain = styled(BreakdownValue)<{ isRow?: boolean }>`
  display: ${({ isRow }): 'block' | 'none' => (isRow ? 'none' : 'block')};
  margin-right: ${rem(4)};
  ${breakpoint(breakpoints.mobile)} {
    display: block;
    margin-right: ${rem(0)};
  }
`;

const breakdownDay = (gain: ProfitProps['gain']): SerializedStyles => css`
  ${breakpoint(breakpoints.mobile)} {
    color: ${profitColor(gain, desaturate(0.5))};
  }
`;

type DayGainProps = ProfitProps & { isRow?: boolean };

export const DayGainAbs = styled(BreakdownAbs)<DayGainProps>(
  ({ gain }) => css`
    ${breakdownDay(gain)};
  `,
);

export const DayGain = styled(BreakdownValue)<DayGainProps>(
  ({ isRow, gain }) => css`
    ${breakdownDay(gain)};
    display: ${isRow ? 'none' : 'block'};
    ${breakpoint(breakpoints.mobile)} {
      display: block;
    }
  `,
);

export const Text = styled.span`
  align-items: center;
  display: flex;
  height: 100%;
  line-height: 100%;
  overflow: hidden;
  padding: 0;

  @media only screen and (max-width: ${breakpoints.mobile}px) {
    background-color: transparent !important;
  }

  ${breakpoint(breakpoints.mobile)} {
    background: ${colors.medium.mediumDark};
    display: block;

    & > span {
      padding: 0 1px;
      text-overflow: ellipsis;
      text-align: center;
    }

    ${FundRow} & {
      display: flex;
      margin-right: 0;
      padding: 0;
      width: 100%;
      & > span {
        padding: 0;
      }
    }
  }
`;

const priceChangePulse = keyframes`
from {
  opacity: 0.8;
}
to {
  opacity: 0;
}
`;

export type FundGainInfoProps = {
  isRow?: boolean;
  highlight?: -1 | 1 | 0;
};

export const highlightTimeMs = 10000;

export const FundGainInfo = styled.span<ProfitProps & SoldProps & FundGainInfoProps>(
  ({ isRow, gain, isSold, highlight = 0 }) => css`
    color: ${profitColor(gain)};
    width: ${isRow ? rem(180) : 'auto'};

    ${breakpoint(breakpoints.mobileSmall)} {
      width: ${isRow ? rem(216) : 'auto'};
    }

    ${breakpoint(breakpoints.mobile)} {
      display: flex;
      flex: 0 0 ${rem(200)};
      position: relative;
      z-index: 1;

      ${isSold &&
      css`
        opacity: 0.5;
        font-style: italic;

        ${Value},
        ${Overall} {
          font-weight: normal;
        }
      `}

      &::after {
        animation: ${priceChangePulse} ${highlightTimeMs}ms cubic-bezier(0.08, 0.89, 0.99, 0.71);
        background: ${profitColor(highlight)};
        content: '';
        display: ${highlight === 0 ? 'none' : 'block'};
        height: 100%;
        opacity: 0;
        position: absolute;
        width: 100%;
      }
    }
  `,
);
