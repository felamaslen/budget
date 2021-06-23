import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { compose } from '@typed/compose';
import { desaturate, lighten, rem } from 'polished';

import { FormField } from '~client/components/form-field/styles';
import * as GainStyles from '~client/components/fund-gain-info/styles';
import { breakpoint } from '~client/styled/mixins';
import { FlexCenter, Flex, FlexColumn } from '~client/styled/shared';
import { colors, breakpoints } from '~client/styled/variables';

type GainProps = { profit: boolean; loss: boolean };

export const ListHeadFunds = styled(FlexCenter)`
  flex: 0 0 auto;
  flex-flow: column;
  width: 100%;
  ${breakpoint(breakpoints.mobile)} {
    flex: 1;
    flex: 0 0 330px;
    flex-flow: row;
    height: 100%;
    width: auto;

    ${FormField} {
      width: auto;
    }
  }
  ${breakpoint(breakpoints.tablet)} {
    flex: 0 0 322px;
  }
`;

const getGainColor = (isMobile: boolean) => ({ profit, loss }: GainProps): string => {
  if (isMobile) {
    if (profit) {
      return colors.profit.translucent ?? '';
    }
    if (loss) {
      return colors.loss.translucent ?? '';
    }
  }
  if (profit) {
    return colors.profit.light;
  }
  if (loss) {
    return colors.loss.light;
  }
  return colors.transparent;
};

const getGainColorLight = (isMobile: boolean) => ({ profit, loss }: GainProps): string =>
  compose(desaturate(0.6), lighten(0.1))(getGainColor(isMobile)({ profit, loss }));

export const OverallGain = styled(GainStyles.PriceChangeHighlight)<GainProps>`
  align-items: center;
  display: flex;
  width: 100%;
  height: ${rem(42)};
  text-transform: none;
  background-color: ${getGainColor(true)};
  background-image: linear-gradient(to right, transparent, ${getGainColorLight(true)} 70%);

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
    padding: 0 ${rem(8)} 0 ${rem(8)};
    width: auto;
    height: 100%;
    background-color: transparent;
    background-image: linear-gradient(
      to right,
      transparent,
      ${getGainColor(false)} 5%,
      ${getGainColor(false)} 60%,
      transparent 100%
    );
  }
`;

export const Main = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-flow: column;
  margin-left: ${rem(8)};
  margin-right: ${rem(8)};
  ${breakpoint(breakpoints.mobile)} {
    margin-left: 0;
    margin-right: 0;
  }
`;

export const Value = styled(GainStyles.Value)`
  color: ${colors.black};
  font-size: ${rem(24)};
  line-height: ${rem(28)};
  margin-right: 0;
  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
    font-size: ${rem(16)};
    line-height: ${rem(20)};
  }
`;

export const XIRR = styled(GainStyles.BreakdownValue)`
  font-size: ${rem(12)};
  line-height: ${rem(12)};
  ${breakpoint(breakpoints.mobile)} {
    font-size: ${rem(10)};
    font-weight: bold;
    line-height: ${rem(12)};
    margin: 0;
  }
`;

export const Breakdown = styled(GainStyles.Breakdown)`
  flex: 0 0 auto;
`;

export const Overall = styled(GainStyles.Overall)`
  flex: 0 0 auto;
`;

export const DayGainOuter = styled(GainStyles.DayGainOuter)`
  flex: 0 0 auto;
  margin: 0 ${rem(8)};
`;

const breakdownStyle = css`
  background: none;
  text-align: right;
  font-size: ${rem(16)};
  line-height: ${rem(20)};

  ${breakpoint(breakpoints.mobile)} {
    font-size: ${rem(12)};
    line-height: ${rem(16)};
  }
`;

const breakdownStyleDay = css`
  ${breakdownStyle};
  font-weight: normal;
`;

export const GainAbs = styled(GainStyles.GainAbs)`
  ${breakdownStyle};
`;
export const Gain = styled(GainStyles.Gain)`
  ${breakdownStyle};
`;
export const DayGainAbs = styled(GainStyles.DayGainAbs)`
  ${breakdownStyleDay};
`;
export const DayGain = styled(GainStyles.DayGain)`
  ${breakdownStyleDay};
`;

export const ViewOptions = styled(FlexColumn)`
  height: 100%;

  input,
  select,
  span {
    font-size: ${rem(12)} !important;
  }
  input {
    margin: 0 ${rem(4)};
  }
`;

export const CacheAge = styled.span``;

export const Toggles = styled(Flex)`
  align-items: center;
  white-space: nowrap;
`;
