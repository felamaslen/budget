import React, { useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as Styled from './styles';
import { cashTargetUpdated, listItemUpdated } from '~client/actions';
import { FundAllocationTargets } from '~client/components/fund-allocation-targets';
import { TodayContext } from '~client/hooks';
import {
  getCashToInvest,
  getCashAllocationTarget,
  getPortfolio,
  getFundsRows,
} from '~client/selectors';
import { Fund, Page } from '~client/types';

const onUpdate = listItemUpdated<Fund, Page.funds>(Page.funds);

export const CashRow: React.FC = () => {
  const today = useContext(TodayContext);

  const dispatch = useDispatch();
  const funds = useSelector(getFundsRows);
  const portfolio = useSelector(getPortfolio(today));
  const cashToInvest = useSelector(getCashToInvest(today));
  const cashTarget = useSelector(getCashAllocationTarget);
  const onSetCashTarget = useCallback(
    (value: number): void => {
      dispatch(cashTargetUpdated(value));
    },
    [dispatch],
  );

  const onSetFundTarget = useCallback(
    (item: Fund, allocationTarget: number): void => {
      dispatch(onUpdate(item.id, { allocationTarget }, item));
    },
    [dispatch],
  );

  return (
    <Styled.FundRow isSold={false} odd={true}>
      <FundAllocationTargets
        cashToInvest={cashToInvest}
        cashTarget={cashTarget}
        funds={funds}
        portfolio={portfolio}
        onSetCashTarget={onSetCashTarget}
        onSetFundTarget={onSetFundTarget}
      />
    </Styled.FundRow>
  );
};
