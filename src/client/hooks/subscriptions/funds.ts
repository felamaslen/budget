import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import {
  allocationTargetsUpdated,
  cashTargetUpdated,
  errorOpened,
  fundPricesUpdated,
} from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import * as gql from '~client/hooks/gql';
import { composeWithoutArgs } from '~client/modules/compose-without-args';
import { getHistoryOptions } from '~client/selectors';

function useCashTargetSubscription(dispatch: Dispatch): () => void {
  const [updatedCashTarget, onReconnect] = gql.useCashAllocationTargetUpdatedSubscription();
  useEffect(() => {
    if (updatedCashTarget.data) {
      dispatch(cashTargetUpdated(updatedCashTarget.data.cashAllocationTargetUpdated));
    }
  }, [dispatch, updatedCashTarget.data]);
  return onReconnect;
}

function useFundAllocationTargetsSubscription(dispatch: Dispatch): () => void {
  const [updatedFundTargets, onReconnect] = gql.useFundAllocationTargetsUpdatedSubscription();
  useEffect(() => {
    if (updatedFundTargets.data?.fundAllocationTargetsUpdated.deltas) {
      dispatch(
        allocationTargetsUpdated(updatedFundTargets.data.fundAllocationTargetsUpdated.deltas),
      );
    }
  }, [dispatch, updatedFundTargets.data]);
  return onReconnect;
}

export function useFundsSubscriptions(): () => void {
  const query = useSelector(getHistoryOptions);
  const dispatch = useDispatch();
  const [res, onReconnectPrices] = gql.useFundPricesUpdatedSubscription({
    variables: query,
  });

  useEffect(() => {
    if (res.error) {
      dispatch(
        errorOpened(`Error subscribing to fund prices: ${res.error.message}`, ErrorLevel.Err),
      );
    }
  }, [dispatch, res.error]);

  useEffect(() => {
    if (res.data?.fundPricesUpdated) {
      dispatch(fundPricesUpdated(res.data?.fundPricesUpdated));
    }
  }, [dispatch, query, res.data]);

  const onReconnectCashTarget = useCashTargetSubscription(dispatch);
  const onReconnectAllocation = useFundAllocationTargetsSubscription(dispatch);
  return composeWithoutArgs(onReconnectPrices, onReconnectCashTarget, onReconnectAllocation);
}
