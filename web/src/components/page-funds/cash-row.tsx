import React, { useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as Styled from './styles';
import { cashTargetUpdated, allocationTargetsUpdated } from '~client/actions';
import { FundAllocationTargets } from '~client/components/fund-allocation-targets';
import { TodayContext } from '~client/hooks';
import {
  getCashToInvest,
  getCashAllocationTarget,
  getPortfolio,
  getFundsRows,
} from '~client/selectors';
import {
  TargetDelta,
  useUpdateCashAllocationTargetMutation,
  useUpdateFundAllocationTargetsMutation,
} from '~client/types';

export const CashRow: React.FC = () => {
  const today = useContext(TodayContext);

  const dispatch = useDispatch();
  const funds = useSelector(getFundsRows);
  const portfolio = useSelector(getPortfolio(today));
  const cashToInvest = useSelector(getCashToInvest(today));

  const cashTarget = useSelector(getCashAllocationTarget);

  const [, mutateCashAllocationTarget] = useUpdateCashAllocationTargetMutation();
  const onSetCashTarget = useCallback(
    (value: number): void => {
      mutateCashAllocationTarget({ target: value });
      dispatch(cashTargetUpdated(value));
    },
    [dispatch, mutateCashAllocationTarget],
  );

  const [, mutateFundAllocationTargets] = useUpdateFundAllocationTargetsMutation();
  const onSetFundTargets = useCallback(
    (deltas: TargetDelta[]): void => {
      mutateFundAllocationTargets({ deltas });
      dispatch(allocationTargetsUpdated(deltas));
    },
    [dispatch, mutateFundAllocationTargets],
  );

  return (
    <Styled.CashRow isSold={false} odd={true}>
      <FundAllocationTargets
        cashToInvest={cashToInvest}
        cashTarget={cashTarget}
        funds={funds}
        portfolio={portfolio}
        onSetCashTarget={onSetCashTarget}
        onSetFundTargets={onSetFundTargets}
      />
    </Styled.CashRow>
  );
};
