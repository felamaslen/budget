import React from 'react';

import * as Styled from './styles';
import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { formatOptionsAbsolute, formatOptionsRelative } from '~client/components/fund-gain-info';
import { HighlightProps } from '~client/components/fund-gain-info/styles';
import { GraphFunds } from '~client/components/graph-funds';
import { usePriceChangeHighlight } from '~client/components/page-funds/hooks';
import { Sort, defaultSort, HeadProps, SortCriteria } from '~client/components/page-funds/types';
import { formatCurrency, formatPercent } from '~client/modules/format';
import type { CachedValue, HistoryOptions } from '~client/types';

type PropsGainValues = {
  totalCost: number;
  annualisedFundReturns: number;
  cachedValue: CachedValue;
};

export type Props = PropsGainValues & {
  viewSoldFunds: boolean;
  historyOptions: HistoryOptions;
  onViewSoldToggle: () => void;
} & HeadProps;

const sortOptions: SelectOptions<Sort> = [
  { internal: { criteria: SortCriteria.Value, direction: 1 }, external: 'Value ↓' },
  { internal: { criteria: SortCriteria.Value, direction: -1 }, external: 'Value ↑' },
  { internal: { criteria: SortCriteria.Gain, direction: 1 }, external: 'Gain ↓' },
  { internal: { criteria: SortCriteria.Gain, direction: -1 }, external: 'Gain ↑' },
  { internal: { criteria: SortCriteria.GainAbs, direction: 1 }, external: 'Gain (abs) ↓' },
  { internal: { criteria: SortCriteria.GainAbs, direction: -1 }, external: 'Gain (abs) ↑' },
];

const formatOptionsXIRR = { brackets: false, precision: 1 };

const GainValues: React.FC<PropsGainValues & HighlightProps & { isMobile: boolean }> = ({
  isMobile,
  totalCost,
  annualisedFundReturns,
  cachedValue: { value, gain, dayGain, gainAbs, dayGainAbs },
  highlight,
}) => (
  <Styled.OverallGain profit={value > totalCost} loss={value < totalCost} highlight={highlight}>
    <Styled.Main>
      <Styled.Value>{formatCurrency(value, isMobile ? {} : formatOptionsAbsolute)}</Styled.Value>
      <Styled.XIRR gain={annualisedFundReturns}>
        XIRR {formatPercent(annualisedFundReturns, formatOptionsXIRR)}
      </Styled.XIRR>
    </Styled.Main>
    {totalCost && (
      <Styled.Breakdown>
        <Styled.Overall>
          <Styled.GainAbs gain={gain}>
            {formatCurrency(gainAbs, formatOptionsAbsolute)}
          </Styled.GainAbs>
          <Styled.Gain gain={gain}>{formatPercent(gain, formatOptionsRelative)}</Styled.Gain>
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
);

export const ListHeadFunds: React.FC<Props> = ({
  totalCost,
  viewSoldFunds,
  annualisedFundReturns,
  cachedValue,
  onViewSoldToggle,
  sort = defaultSort,
  setSort,
}) => {
  const highlight = usePriceChangeHighlight(cachedValue.value);
  return (
    <Styled.ListHeadFunds title={cachedValue.ageText}>
      <GainValues
        isMobile={false}
        totalCost={totalCost}
        annualisedFundReturns={annualisedFundReturns}
        cachedValue={cachedValue}
        highlight={highlight}
      />
      <Styled.ViewOptions>
        <FormFieldSelect options={sortOptions} value={sort} onChange={setSort} />
        <Styled.ViewSold>
          <input type="checkbox" checked={viewSoldFunds} onChange={onViewSoldToggle} />
          <span>View sold</span>
        </Styled.ViewSold>
      </Styled.ViewOptions>
    </Styled.ListHeadFunds>
  );
};

export const ListHeadFundsMobile: React.FC<PropsGainValues> = ({
  totalCost,
  annualisedFundReturns,
  cachedValue,
}) => (
  <Styled.ListHeadFunds>
    <GainValues
      isMobile={true}
      totalCost={totalCost}
      annualisedFundReturns={annualisedFundReturns}
      cachedValue={cachedValue}
    />
    <GraphFunds isMobile />
  </Styled.ListHeadFunds>
);
