import React, { useCallback, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Pie } from '../pie';
import * as Styled from './styles';
import { FundProps } from './types';
import { listItemUpdated } from '~client/actions';
import { FormFieldNumber } from '~client/components/form-field';
import { FundGainInfo } from '~client/components/fund-gain-info';
import { GraphFundItem } from '~client/components/graph-fund-item';
import { TodayContext } from '~client/hooks/time';
import { getViewSoldFunds, getFundsCachedValue, getMaxAllocationTarget } from '~client/selectors';
import { colors } from '~client/styled/variables';
import { Fund, Page } from '~client/types';

export type Props = { isMobile: boolean; item: Fund } & Partial<FundProps>;

const onUpdate = listItemUpdated<Fund, Page.funds>(Page.funds);

export const FundRow: React.FC<Props> = ({
  isMobile,
  item,
  children,
  name = 'missing-name',
  isSold = false,
  prices,
  gain,
}) => {
  const today = useContext(TodayContext);
  const viewSoldFunds = useSelector(getViewSoldFunds);
  const latestValue = useSelector(getFundsCachedValue(today));

  const dispatch = useDispatch();
  const maxAllocationTarget = useSelector(getMaxAllocationTarget(item.id));
  const setAllocationTarget = useCallback(
    (value) => {
      const allocationTarget = Math.min(maxAllocationTarget, Math.max(0, value / 100));
      if (allocationTarget !== item.allocationTarget) {
        dispatch(
          onUpdate(
            item.id,
            {
              allocationTarget,
            },
            item,
          ),
        );
      }
    },
    [item, dispatch, maxAllocationTarget],
  );
  useEffect(() => {
    if (maxAllocationTarget < item.allocationTarget) {
      setAllocationTarget(maxAllocationTarget * 100);
    }
  }, [maxAllocationTarget, item.allocationTarget, setAllocationTarget]);

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
      {!!prices && <GraphFundItem name={name} sold={isSold} values={prices} />}
      <FundGainInfo isSold={isSold} rowGains={gain} />
      <Styled.TargetAllocation>
        <FormFieldNumber
          value={Math.round(item.allocationTarget * 100)}
          onChange={setAllocationTarget}
          inputProps={{
            min: 0,
            max: maxAllocationTarget * 100,
            step: 1,
            disabled: maxAllocationTarget === 0,
          }}
        />
      </Styled.TargetAllocation>
    </Styled.FundRow>
  );
};
