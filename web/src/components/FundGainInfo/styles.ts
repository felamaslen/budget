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
  text-overflow: none;
`;

export const Value = styled.span`
  width: 68px;
  text-align: left;
  flex: 1 1 0;
  font-weight: bold;
  font-size: ${rem(18)};
  color: ${colors['slightly-dark']};
  overflow: visible !important;
`;

export const Breakdown = styled(InlineFlex)`
  flex: 2 1 0;
`;
export const Overall = styled(Column)<SoldProps>`
  font-weight: bold;
  flex-flow: ${({ isSold }): 'row' | 'column' => (isSold ? 'row' : 'column')};
`;

export const DayGainOuter = styled(Column)``;

const BreakdownValue = styled.span`
  color: ${profitColor()};
  flex: 1 0 0;
  font-size: ${rem(13)};
  line-height: 24px;
  height: 24px;
  background: ${colors['translucent-l6']};
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
export const Gain = styled(BreakdownValue)``;

const breakdownDay = css`
  color: ${profitColor(desaturate(0.5))};
`;

export const DayGainAbs = styled(BreakdownAbs)`
  ${breakdownDay};
`;
export const DayGain = styled(BreakdownValue)`
  ${breakdownDay};
`;

export const Text = styled.span.attrs(({ color }) => ({
  style: { backgroundColor: color },
}))<{ color: string }>`
  padding: 0;
  height: 100%;
  ${breakpoint(breakpoints.mobile)} {
    background: ${colors['medium-slightly-dark']};
    & > span {
      float: left;
      padding: 0 1px;
      overflow: hidden;
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

export const FundGainInfo = styled.span<ProfitProps & SoldProps>`
  flex: 0 0 200px;
  z-index: 1;
  color: ${profitColor()};

  ${breakpoint(breakpoints.mobile)} {
    display: flex;

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
