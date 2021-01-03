import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { Pie } from '../pie';
import * as Styled from './styles';
import type { FundProps } from './types';
import { FundGainInfo } from '~client/components/fund-gain-info';
import { GraphFundItem } from '~client/components/graph-fund-item';
import { TodayContext, useDebouncedState, useListCrudFunds } from '~client/hooks';
import { getViewSoldFunds, getFundsCachedValue, getMaxAllocationTarget } from '~client/selectors';
import { colors } from '~client/styled/variables';
import type { FundNative as Fund } from '~client/types';

export type Props = { isMobile: boolean; item: Fund } & Partial<FundProps>;

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
      {!!prices && <GraphFundItem name={item.item} sold={isSold} values={prices} />}
      <FundGainInfo isSold={isSold} rowGains={gain} />
    </Styled.FundRow>
  );
};
