import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { Pie } from '../pie';
import * as Styled from './styles';
import type { FundProps } from './types';
import { FundGainInfo } from '~client/components/fund-gain-info';
import { highlightTimeMs } from '~client/components/fund-gain-info/styles';
import { GraphFundItem } from '~client/components/graph-fund-item';
import { TodayContext, useDebouncedState, useListCrudFunds, useUpdateEffect } from '~client/hooks';
import {
  getViewSoldFunds,
  getFundsCachedValue,
  getMaxAllocationTarget,
  getTodayPrices,
} from '~client/selectors';
import { colors } from '~client/styled/variables';
import type { FundNative as Fund } from '~client/types';

export type Props = { isMobile: boolean; item: Fund } & Partial<FundProps>;

function getHighlight(yesterdayPrice: number, todayPrice: number): -1 | 1 | 0 {
  if (!(todayPrice && yesterdayPrice)) {
    return 0;
  }
  if (todayPrice > yesterdayPrice) {
    return 1;
  }
  return todayPrice < yesterdayPrice ? -1 : 0;
}

export const FundRow: React.FC<Props> = ({
  isMobile,
  item,
  children,
  isSold = false,
  prices,
  gain,
}) => {
  const today = useContext(TodayContext);
  const viewSoldFunds = useSelector(getViewSoldFunds);
  const latestValue = useSelector(getFundsCachedValue.today(today));

  const scrapedPrice = gain?.price ?? 0;
  const todayPrice = useSelector(getTodayPrices)[item.id] ?? 0;

  const [highlight, setHighlight] = useState<-1 | 1 | 0>(0);
  const highlightTimer = useRef<number>(0);
  const highlightComparePrice = useRef<number>(scrapedPrice);

  useEffect(() => {
    highlightComparePrice.current = scrapedPrice;
  }, [scrapedPrice]);

  useUpdateEffect(() => {
    setHighlight(getHighlight(highlightComparePrice.current, todayPrice));
    highlightComparePrice.current = todayPrice;
    highlightTimer.current = window.setTimeout(() => {
      setHighlight(0);
    }, highlightTimeMs + 100);
    return (): void => {
      clearTimeout(highlightTimer.current);
    };
  }, [todayPrice]);

  const { onUpdate } = useListCrudFunds();

  const maxAllocationTarget = useSelector(getMaxAllocationTarget(item.id));

  const [
    tempAllocationTarget,
    debouncedAllocationTarget,
    setTempAllocationTarget,
  ] = useDebouncedState<number | null | undefined>(item.allocationTarget, 500);

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

  if (!viewSoldFunds && isSold) {
    return null;
  }

  if (isMobile) {
    const valueFrac = (gain?.value ?? 0) / latestValue.value;
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
      <Styled.TargetAllocation onWheel={scrollAllocationTarget}>
        <Pie
          size={18}
          slice={(2 * Math.PI * (tempAllocationTarget ?? 0)) / 100}
          color={colors.shadow.mediumDark}
          isAnimated={false}
        />
        <span>{tempAllocationTarget ?? 0}%</span>
      </Styled.TargetAllocation>
      {!!prices && <GraphFundItem item={item.item} sold={isSold} values={prices} />}
      <FundGainInfo isSold={isSold} rowGains={gain} highlight={highlight} />
    </Styled.FundRow>
  );
};
