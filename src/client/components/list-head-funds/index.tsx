import humanizeDuration from 'humanize-duration';
import { mix } from 'polished';
import { FC, useContext } from 'react';

import { useSelector } from 'react-redux';
import * as Styled from './styles';
import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { formatOptionsAbsolute, formatOptionsRelative } from '~client/components/fund-gain-info';
import { HighlightProps } from '~client/components/fund-gain-info/styles';
import { GraphFunds } from '~client/components/graph-funds';
import { FundsContext } from '~client/components/page-funds/context';
import { usePriceChangeHighlight } from '~client/components/page-funds/hooks';
import { Sort, defaultSort, SortCriteria } from '~client/components/page-funds/types';
import { useNow } from '~client/hooks';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { getAppConfig } from '~client/selectors';
import { colors } from '~client/styled/variables';
import type { CachedValue, HistoryOptions } from '~client/types';

export type PropsCommon = {
  totalCost: number;
  annualisedFundReturns: number;
  cachedValue: CachedValue;
};

export type Props = PropsCommon & {
  viewSoldFunds: boolean;
  historyOptions: HistoryOptions;
  onViewSoldToggle: () => void;
};

const sortOptions: SelectOptions<Sort> = [
  { internal: { criteria: SortCriteria.Value, direction: 1 }, external: 'Value ↓' },
  { internal: { criteria: SortCriteria.Value, direction: -1 }, external: 'Value ↑' },
  { internal: { criteria: SortCriteria.Gain, direction: 1 }, external: 'Gain ↓' },
  { internal: { criteria: SortCriteria.Gain, direction: -1 }, external: 'Gain ↑' },
  { internal: { criteria: SortCriteria.GainAbs, direction: 1 }, external: 'Gain (abs) ↓' },
  { internal: { criteria: SortCriteria.GainAbs, direction: -1 }, external: 'Gain (abs) ↑' },
];

const formatOptionsXIRR = { brackets: false, precision: 1 };

function getAgeText(ageMs: number | null): string {
  if (ageMs === null) {
    return 'no values';
  }
  if (ageMs < 0) {
    return 'in the future!';
  }
  return `${humanizeDuration(ageMs, { round: true, largest: 1 })} ago`;
}

function getTimeColor(ageSlice: number): string {
  return mix(ageSlice, colors.profit.dark, colors.white);
}

const maxAgeMs = 1000 * 60 * 5;

const Arc: FC<{ sliceAngle: number; color: string }> = ({ sliceAngle, color }) => (
  <svg data-testid="scrape-arc" height={24} width={24}>
    <path
      strokeWidth={3}
      stroke={color}
      fill="none"
      d={`M12,3 A9,9 0,${sliceAngle > Math.PI ? '1' : '0'},1 ${
        12 + 9 * Math.cos(sliceAngle - Math.PI / 2)
      },${12 + 9 * Math.sin(sliceAngle - Math.PI / 2)}`}
    />
  </svg>
);

export type PropsGainValues = PropsCommon &
  HighlightProps & {
    cacheAgeMs: number;
    isMobile: boolean;
  };

const GainValues: FC<PropsGainValues> = ({
  isMobile,
  totalCost,
  annualisedFundReturns,
  cachedValue: { value, gain, dayGain, gainAbs, dayGainAbs },
  cacheAgeMs,
  highlight,
}) => {
  const ageSlice = Math.min(0.999, cacheAgeMs / maxAgeMs);
  const { realTimePrices } = useSelector(getAppConfig);
  return (
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
      {realTimePrices && <Arc sliceAngle={ageSlice * 2 * Math.PI} color={getTimeColor(ageSlice)} />}
    </Styled.OverallGain>
  );
};

function useCacheAgeMs(lastScraped: Date): number {
  const now = useNow();
  return now.getTime() - lastScraped.getTime();
}

export const ListHeadFunds: FC<Props> = ({
  totalCost,
  viewSoldFunds,
  annualisedFundReturns,
  cachedValue,
  onViewSoldToggle,
}) => {
  const { lastScraped, sort = defaultSort, setSort } = useContext(FundsContext);
  const highlight = usePriceChangeHighlight(cachedValue.value);
  const cacheAgeMs = useCacheAgeMs(lastScraped);

  return (
    <Styled.ListHeadFunds title={getAgeText(cacheAgeMs)}>
      <GainValues
        isMobile={false}
        totalCost={totalCost}
        annualisedFundReturns={annualisedFundReturns}
        cachedValue={cachedValue}
        cacheAgeMs={cacheAgeMs}
        highlight={highlight}
      />
      <Styled.ViewOptions>
        <FormFieldSelect options={sortOptions} value={sort} onChange={setSort} />
        <Styled.Toggles>
          <input type="checkbox" checked={viewSoldFunds} onChange={onViewSoldToggle} />
          <span>Sold</span>
        </Styled.Toggles>
      </Styled.ViewOptions>
    </Styled.ListHeadFunds>
  );
};

export type PropsMobile = PropsCommon;

export const ListHeadFundsMobile: FC<PropsMobile> = ({
  totalCost,
  annualisedFundReturns,
  cachedValue,
}) => {
  const { lastScraped } = useContext(FundsContext);
  const cacheAgeMs = useCacheAgeMs(lastScraped);
  return (
    <Styled.ListHeadFunds>
      <GainValues
        isMobile={true}
        totalCost={totalCost}
        annualisedFundReturns={annualisedFundReturns}
        cachedValue={cachedValue}
        cacheAgeMs={cacheAgeMs}
      />
      <GraphFunds isMobile />
    </Styled.ListHeadFunds>
  );
};
