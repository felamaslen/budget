import React from 'react';

import * as Styled from './styles';
import { FormFieldSelect, SelectOptions } from '~client/components/FormField';
import { formatOptionsAbsolute, formatOptionsRelative } from '~client/components/FundGainInfo';
import { Sort, defaultSort, HeadProps } from '~client/components/page-funds/types';
import { Period } from '~client/constants/graph';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { CachedValue } from '~client/types';

export * from './mobile';

export type Props = {
  totalCost: number;
  viewSoldFunds: boolean;
  period: Period;
  cachedValue: CachedValue;
  onViewSoldToggle: () => void;
  onReloadPrices: () => void;
} & HeadProps;

const sortOptions: SelectOptions<Sort> = [
  { internal: { criteria: 'value', direction: 1 }, external: 'Value ↓' },
  { internal: { criteria: 'value', direction: -1 }, external: 'Value ↑' },
  { internal: { criteria: 'gain', direction: 1 }, external: 'Gain ↓' },
  { internal: { criteria: 'gain', direction: -1 }, external: 'Gain ↑' },
];

export const ListHeadFunds: React.FC<Props> = ({
  totalCost,
  viewSoldFunds,
  cachedValue: { value, ageText, dayGain, dayGainAbs },
  onReloadPrices,
  onViewSoldToggle,
  sort = defaultSort,
  setSort,
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
    <FormFieldSelect options={sortOptions} value={sort} onChange={setSort} />
    <Styled.ViewSold>
      <input type="checkbox" checked={viewSoldFunds} onChange={onViewSoldToggle} />
      <span>View sold</span>
    </Styled.ViewSold>
  </Styled.ListHeadFunds>
);
