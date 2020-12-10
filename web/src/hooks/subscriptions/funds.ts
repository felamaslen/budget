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
import { getHistoryOptions } from '~client/selectors';
import {
  useCashAllocationTargetUpdatedSubscription,
  useFundAllocationTargetsUpdatedSubscription,
  useFundPricesUpdatedSubscription,
} from '~client/types';

function useCashTargetSubscription(dispatch: Dispatch): void {
  const [updatedCashTarget] = useCashAllocationTargetUpdatedSubscription();
  useEffect(() => {
    if (updatedCashTarget.data) {
      dispatch(cashTargetUpdated(updatedCashTarget.data.cashAllocationTargetUpdated));
    }
  }, [dispatch, updatedCashTarget.data]);
}

function useFundAllocationTargetsSubscription(dispatch: Dispatch): void {
  const [updatedFundTargets] = useFundAllocationTargetsUpdatedSubscription();
  useEffect(() => {
    if (updatedFundTargets.data?.fundAllocationTargetsUpdated.deltas) {
      dispatch(
        allocationTargetsUpdated(updatedFundTargets.data.fundAllocationTargetsUpdated.deltas),
      );
    }
  }, [dispatch, updatedFundTargets.data]);
}

export function useFundsSubscriptions(): void {
  const query = useSelector(getHistoryOptions);
  const dispatch = useDispatch();
  const [res] = useFundPricesUpdatedSubscription({
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

  useCashTargetSubscription(dispatch);
  useFundAllocationTargetsSubscription(dispatch);
}
