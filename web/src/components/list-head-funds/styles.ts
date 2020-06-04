import { compose } from '@typed/compose';
import { desaturate, lighten } from 'polished';
import styled, { css } from 'styled-components';

import { FormField } from '~client/components/form-field/styles';
import * as GainStyles from '~client/components/fund-gain-info/styles';
import { rem, breakpoint } from '~client/styled/mixins';
import { FlexCenter, Flex } from '~client/styled/shared';
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

export const OverallGain = styled(FlexCenter)<GainProps>`
  width: 100%;
  height: ${rem(42)};
  text-transform: none;
  background-color: ${getGainColor(true)};
  background-image: linear-gradient(to right, transparent, ${getGainColorLight(true)} 70%);

  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
    padding: 0 ${rem(16)} 0 ${rem(8)};
    width: auto;
    height: auto;
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

export const Value = styled(GainStyles.Value)`
  margin-left: ${rem(8)};
  flex: 1;
  font-size: ${rem(28)};
  color: ${colors.black};
  ${breakpoint(breakpoints.mobile)} {
    flex: 0 0 auto;
    font-size: ${rem(16)};
  }
`;

export const Breakdown = styled(GainStyles.Breakdown)`
  flex: 0 0 auto;
`;

export const Overall = styled(GainStyles.Overall).attrs({
  isSold: false,
})`
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

export const CacheAge = styled.span``;

export const ViewSold = styled(Flex)`
  font-size: ${rem(13)};
  margin-left: ${rem(4)};
  white-space: nowrap;
`;
