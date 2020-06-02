import { desaturate } from 'polished';
import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { StandardRow } from '~client/components/accessible-list/styles';
import { IDENTITY } from '~client/modules/data';
import { breakpoint, rem } from '~client/styled/mixins';
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
type SoldProps = { isSold: boolean };

const profitColor = (postProcess: (value: string) => string = IDENTITY) => ({
  gain,
}: ProfitProps): string => postProcess(gain >= 0 ? colors.profit : colors.loss);

const Column = styled.span`
  display: flex;
  flex: 1 0 0;
  flex-flow: column;
  overflow: visible;
  text-overflow: unset;
`;

export const Value = styled.span<{ isRow?: boolean }>`
  color: ${colors['slightly-dark']};
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
    background: ${({ isRow }): string => (isRow ? colors['translucent-l6'] : colors.transparent)};
    flex: 2 1 0;
  }
`;
export const Overall = styled(Column)<SoldProps>`
  flex: 0 0 50%;
  font-weight: bold;
  flex-flow: ${({ isSold }): 'row' | 'column' => (isSold ? 'row' : 'column')};
  max-width: 50%;

  ${breakpoint(breakpoints.mobile)} {
    max-width: initial;
  }
`;

export const DayGainOuter = styled(Column)`
  flex: 0 0 50%;
  ${breakpoint(breakpoints.mobile)} {
    flex: 1;
    padding-right: ${rem(8)};
  }
`;

const BreakdownValue = styled.span`
  color: ${profitColor()};
  text-align: right;

  ${breakpoint(breakpoints.mobile)} {
    flex: 1 0 0;
    font-size: ${rem(13)};
    line-height: 24px;
    height: 24px;
  }
`;

const BreakdownAbs = styled(BreakdownValue)<ProfitProps>`
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

const breakdownDay = css<ProfitProps & { isRow?: boolean }>`
  ${breakpoint(breakpoints.mobile)} {
    color: ${profitColor(desaturate(0.5))};
  }
`;

export const DayGainAbs = styled(BreakdownAbs)`
  ${breakdownDay};
`;
export const DayGain = styled(BreakdownValue)`
  ${breakdownDay};
  display: ${({ isRow }): 'block' | 'none' => (isRow ? 'none' : 'block')};
  ${breakpoint(breakpoints.mobile)} {
    display: block;
  }
`;

export const Text = styled.span.attrs(({ color }) => ({
  style: { backgroundColor: color },
}))<{ color: string }>`
  display: flex;
  height: 100%;
  overflow: hidden;
  padding: 0;

  @media only screen and (max-width: ${breakpoints.mobile}px) {
    background-color: transparent !important;
  }

  ${breakpoint(breakpoints.mobile)} {
    background: ${colors['medium-slightly-dark']};
    display: block;

    & > span {
      padding: 0 1px;
      text-overflow: ellipsis;
      text-align: center;
    }

    ${StandardRow} & {
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

export const FundGainInfo = styled.span<ProfitProps & SoldProps & { isRow?: boolean }>`
  color: ${profitColor()};
  width: ${({ isRow }): string => (isRow ? rem(180) : 'auto')};

  ${breakpoint(breakpoints.mobileSmall)} {
    width: ${({ isRow }): string => (isRow ? rem(216) : 'auto')};
  }

  ${breakpoint(breakpoints.mobile)} {
    display: flex;
    flex: 0 0 ${rem(200)};
    z-index: 1;

    ${({ isSold }): false | FlattenSimpleInterpolation =>
      isSold &&
      css`
        opacity: 0.5;
        font-style: italic;

        ${Value},
        ${Overall} {
          font-weight: normal;
        }
      `}
    }
  }
`;
