import React from 'react';

import * as Styled from './styles';
import { formatOptionsAbsolute, formatOptionsRelative } from '~client/components/FundGainInfo';
import { Period } from '~client/constants/graph';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { CachedValue } from '~client/selectors';

export * from './mobile';

type Props = {
  totalCost: number;
  viewSoldFunds: boolean;
  period: Period;
  cachedValue: CachedValue;
  onViewSoldToggle: () => void;
  onReloadPrices: () => void;
};

export const ListHeadFunds: React.FC<Props> = ({
  totalCost,
  viewSoldFunds,
  cachedValue: { value, ageText, dayGain, dayGainAbs },
  onReloadPrices,
  onViewSoldToggle,
}) => (
  <Styled.ListHeadFunds title={ageText}>
    <Styled.OverallGain
      as="a"
      role="button"
      profit={value > totalCost}
      loss={value < totalCost}
      onClick={onReloadPrices}
    >
      <Styled.Value>{formatCurrency(value, formatOptionsAbsolute)}</Styled.Value>
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
    <input type="checkbox" checked={viewSoldFunds} onChange={onViewSoldToggle} />
    <span>View sold</span>
  </Styled.ListHeadFunds>
);
