import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { usePriceChangeHighlight } from './hooks';
import * as Styled from './styles';
import type { FundProps } from './types';

import { CompositeValue, FormFieldFundMetadata } from '~client/components/form-field/fund-metadata';
import { FundGainInfo } from '~client/components/fund-gain-info';
import { GraphFundItem } from '~client/components/graph-fund-item';
import { Pie } from '~client/components/pie';
import { useDebouncedState, useListCrudFunds, useToday } from '~client/hooks';
import { getFundsCachedValue, getMaxAllocationTarget, getViewSoldFunds } from '~client/selectors';
import { colors } from '~client/styled/variables';
import type { FundNative as Fund } from '~client/types';

export type Props = { isMobile: boolean; item: Fund } & Partial<FundProps>;

export const FundRow: React.FC<Props> = ({
  isMobile,
  item,
  children,
  isSold = false,
  metadata,
  prices,
}) => {
  const today = useToday();
  const viewSoldFunds = useSelector(getViewSoldFunds);
  const { value: overallValue } = useSelector(getFundsCachedValue.today(today));

  const latestPrice = metadata?.price;
  const previousPrice = metadata?.previousPrice;

  const highlight = usePriceChangeHighlight(latestPrice ?? previousPrice ?? 0, previousPrice ?? 0);

  const { onUpdate } = useListCrudFunds();

  const maxAllocationTarget = useSelector(getMaxAllocationTarget(item.id));

  const [tempAllocationTarget, debouncedAllocationTarget, setTempAllocationTarget] =
    useDebouncedState<number | null | undefined>(item.allocationTarget, 500);

  const setAllocationTarget = useCallback(
    (value) => {
      const allocationTarget = Math.min(maxAllocationTarget, Math.max(0, value));
      setTempAllocationTarget(allocationTarget);
      if (allocationTarget !== item.allocationTarget) {
        onUpdate(item.id, { allocationTarget }, item);
      }
    },
    [item, onUpdate, maxAllocationTarget, setTempAllocationTarget],
  );

  const lastScrolled = useRef<number | null | undefined>(debouncedAllocationTarget);
  useEffect(() => {
    if (debouncedAllocationTarget !== null && debouncedAllocationTarget !== lastScrolled.current) {
      lastScrolled.current = debouncedAllocationTarget ?? 0;
      setAllocationTarget(debouncedAllocationTarget);
    } else if (debouncedAllocationTarget !== item.allocationTarget) {
      setTempAllocationTarget(item.allocationTarget);
    }
  }, [
    debouncedAllocationTarget,
    item.allocationTarget,
    setTempAllocationTarget,
    setAllocationTarget,
  ]);

  const scrollAllocationTarget = useCallback(
    (event: React.WheelEvent) => {
      setTempAllocationTarget((last) =>
        Math.min(maxAllocationTarget, Math.max(0, (last ?? 0) + (event.deltaY > 0 ? -1 : 1))),
      );
    },
    [setTempAllocationTarget, maxAllocationTarget],
  );

  const compositeValue = useMemo<CompositeValue>(
    () => ({ transactions: item.transactions, stockSplits: item.stockSplits }),
    [item],
  );

  const onChangeComposite = useCallback(
    (delta: CompositeValue | undefined) => {
      if (delta) {
        onUpdate(item.id, delta, item);
      }
    },
    [item, onUpdate],
  );

  if (!viewSoldFunds && isSold) {
    return null;
  }

  if (isMobile) {
    const valueFrac = (metadata?.value ?? 0) / overallValue;
    const valueSlice = 2 * Math.PI * valueFrac;

    return (
      <Styled.FundRowMobile isSold={isSold} odd={true}>
        <Styled.MobilePie>
          <Pie size={16} slice={valueSlice} color={colors.shadow.mediumDark} />
        </Styled.MobilePie>
        {children}
      </Styled.FundRowMobile>
    );
  }

  return (
    <Styled.FundRow isSold={isSold} odd={true}>
      {children}
      <FormFieldFundMetadata value={compositeValue} onChange={onChangeComposite} />
      <Styled.TargetAllocation onWheel={scrollAllocationTarget}>
        <Pie
          size={18}
          slice={(2 * Math.PI * (tempAllocationTarget ?? 0)) / 100}
          color={colors.shadow.mediumDark}
          isAnimated={false}
        />
        <span>{tempAllocationTarget ?? 0}%</span>
      </Styled.TargetAllocation>
      {!!prices && <GraphFundItem fund={item} sold={isSold} values={prices} />}
      <FundGainInfo isSold={isSold} metadata={metadata} highlight={highlight} />
    </Styled.FundRow>
  );
};
