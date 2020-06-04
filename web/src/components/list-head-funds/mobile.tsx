import React from 'react';

import * as Styled from './styles';
import { formatOptionsAbsolute, formatOptionsRelative } from '~client/components/fund-gain-info';
import { GraphFunds } from '~client/components/graph-funds';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { CachedValue } from '~client/types';

type Props = {
  totalCost: number;
  cachedValue: CachedValue;
  onReloadPrices: () => void;
};

export const ListHeadFundsMobile: React.FC<Props> = ({
  totalCost,
  cachedValue: { value, dayGain, dayGainAbs },
  onReloadPrices,
}) => (
  <Styled.ListHeadFunds>
    <Styled.OverallGain
      as="a"
      role="button"
      profit={value > totalCost}
      loss={value < totalCost}
      onClick={onReloadPrices}
    >
      <Styled.Value>{formatCurrency(value)}</Styled.Value>
      {totalCost && (
        <Styled.Breakdown>
          <Styled.Overall>
            <Styled.GainAbs gain={(value - totalCost) / totalCost}>
              {formatCurrency(value - totalCost, formatOptionsAbsolute)}
            </Styled.GainAbs>
            <Styled.Gain gain={value - totalCost}>
              {formatPercent((value - totalCost) / totalCost, formatOptionsRelative)}
            </Styled.Gain>
          </Styled.Overall>
          <Styled.DayGainOuter>
            <Styled.DayGainAbs gain={dayGain}>
              {formatCurrency(dayGainAbs, formatOptionsAbsolute)}
            </Styled.DayGainAbs>
            <Styled.DayGain gain={dayGain}>
              {formatPercent(dayGain, formatOptionsRelative)}
            </Styled.DayGain>
          </Styled.DayGainOuter>
        </Styled.Breakdown>
      )}
    </Styled.OverallGain>
    <GraphFunds isMobile />
  </Styled.ListHeadFunds>
);
