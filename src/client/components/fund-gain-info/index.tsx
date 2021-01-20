/** @jsx jsx */
import { jsx } from '@emotion/react';
import { FC } from 'react';

import * as Styled from './styles';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { GainsForRow } from '~client/selectors';

export const formatOptionsAbsolute = {
  brackets: true,
  abbreviate: true,
  precision: 1,
  noPence: true,
};

export const formatOptionsRelative = { brackets: true, precision: 2 };

type Props = {
  rowGains?: GainsForRow;
  isSold: boolean;
} & Styled.HighlightProps;

export const FundGainInfo: FC<Props> = ({ rowGains, isSold, highlight }) => {
  if (!rowGains) {
    return null;
  }
  const { value, gain, gainAbs, dayGain, dayGainAbs, color } = rowGains;
  return (
    <Styled.FundGainInfo gain={gain} isSold={isSold} isRow highlight={highlight}>
      <Styled.Text style={{ backgroundColor: color }}>
        <Styled.Value isRow>{formatCurrency(value, formatOptionsAbsolute)}</Styled.Value>
        <Styled.Breakdown isRow>
          <Styled.Overall isSold={isSold}>
            <Styled.GainAbs gain={gain}>
              {formatCurrency(gainAbs, formatOptionsAbsolute)}
            </Styled.GainAbs>
            <Styled.Gain isRow gain={gain}>
              {formatPercent(gain, formatOptionsRelative)}
            </Styled.Gain>
          </Styled.Overall>
          {!isSold && (
            <Styled.DayGainOuter>
              <Styled.DayGainAbs isRow gain={dayGain ?? 0}>
                {formatCurrency(dayGainAbs ?? 0, formatOptionsAbsolute)}
              </Styled.DayGainAbs>
              <Styled.DayGain isRow gain={dayGain ?? 0}>
                {formatPercent(dayGain ?? 0, formatOptionsRelative)}
              </Styled.DayGain>
            </Styled.DayGainOuter>
          )}
        </Styled.Breakdown>
      </Styled.Text>
    </Styled.FundGainInfo>
  );
};
