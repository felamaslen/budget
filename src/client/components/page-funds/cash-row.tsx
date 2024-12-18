import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as Styled from './styles';
import { cashTargetUpdated, allocationTargetsUpdated } from '~client/actions';
import { FundAllocationTargets } from '~client/components/fund-allocation-targets';
import { useToday } from '~client/hooks';
import * as gql from '~client/hooks/gql';
import {
  getCashBreakdown,
  getCashAllocationTarget,
  getPortfolio,
  getFundsRows,
} from '~client/selectors';
import type { TargetDelta } from '~client/types/gql';

export const CashRow: React.FC = () => {
  const today = useToday();

  const dispatch = useDispatch();
  const funds = useSelector(getFundsRows);
  const portfolio = useSelector(getPortfolio(today));
  const { cashInBank, cashToInvest } = useSelector(getCashBreakdown(today));

  const cashTarget = useSelector(getCashAllocationTarget);

  const [, mutateCashAllocationTarget] = gql.useUpdateCashAllocationTargetMutation();
  const onSetCashTarget = useCallback(
    (value: number): void => {
      mutateCashAllocationTarget({ target: value });
      dispatch(cashTargetUpdated(value));
    },
    [dispatch, mutateCashAllocationTarget],
  );

  const [, mutateFundAllocationTargets] = gql.useUpdateFundAllocationTargetsMutation();
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
        cashToInvest={cashInBank + cashToInvest}
        cashTarget={cashTarget}
        funds={funds}
        portfolio={portfolio}
        onSetCashTarget={onSetCashTarget}
        onSetFundTargets={onSetFundTargets}
      />
    </Styled.CashRow>
  );
};
