import React, { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

import { Pie } from '../pie';
import * as Styled from './styles';
import { FundProps } from './types';
import { FormFieldNumber } from '~client/components/form-field';
import { FundGainInfo } from '~client/components/fund-gain-info';
import { GraphFundItem } from '~client/components/graph-fund-item';
import { TodayContext, useListCrudFunds } from '~client/hooks';
import { getViewSoldFunds, getFundsCachedValue, getMaxAllocationTarget } from '~client/selectors';
import { colors } from '~client/styled/variables';
import { FundNative as Fund } from '~client/types';

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
  const setAllocationTarget = useCallback(
    (value) => {
      const allocationTarget = Math.min(maxAllocationTarget, Math.max(0, value));
      if (allocationTarget !== item.allocationTarget) {
        onUpdate(item.id, { allocationTarget }, item);
      }
    },
    [item, onUpdate, maxAllocationTarget],
  );

  if (!viewSoldFunds && isSold) {
    return null;
  }

  if (isMobile) {
    const valueSlice = (2 * Math.PI * (gain?.value ?? 0)) / latestValue.value;

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
      {!!prices && <GraphFundItem name={item.item} sold={isSold} values={prices} />}
      <FundGainInfo isSold={isSold} rowGains={gain} />
      <Styled.TargetAllocation>
        <FormFieldNumber
          value={item.allocationTarget ?? 0}
          onChange={setAllocationTarget}
          inputProps={{
            min: 0,
            max: maxAllocationTarget,
            step: 1,
            disabled: maxAllocationTarget === 0,
          }}
        />
      </Styled.TargetAllocation>
    </Styled.FundRow>
  );
};
