import { useDebounceCallback } from '@react-hook/debounce';
import omit from 'lodash/omit';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { initialState } from '../context';
import type { State } from '../types';
import { isStateEqual } from './utils';

import { PlanningSync, SyncPlanningMutation, useSyncPlanningMutation } from '~client/types/gql';
import { omitDeep } from '~shared/utils';

const toLocalState = (result: SyncPlanningMutation): State =>
  omitDeep(
    {
      ...omit(result.syncPlanning, 'error'),
      year: result.syncPlanning?.year ?? 0,
      parameters: result.syncPlanning?.parameters ?? initialState.parameters,
      accounts: result.syncPlanning?.accounts ?? initialState.accounts,
    },
    '__typename',
  );

const toRemotePayload = (state: State): PlanningSync => ({
  accounts: state.accounts.map((row) => ({
    ...omit(row, 'computedValues', 'computedStartValue'),
    creditCards: row.creditCards.map((card) => omit(card, 'predictedPayment')),
  })),
  parameters: state.parameters,
});

export function usePlanning(localYear: number): {
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  isSynced: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const [state, setState] = useState<State>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setSynced] = useState<boolean>(false);

  const [{ data, fetching, error: requestError }, sync] = useSyncPlanningMutation();
  const syncDebounce = useDebounceCallback(sync, 300);

  useEffect(() => {
    sync({ year: localYear });
  }, [sync, localYear]);

  const lastSyncedState = useRef<State | undefined>(undefined);
  const lastVerifiedState = useRef<State | undefined>(undefined);
  const canSync = !fetching;

  useEffect(() => {
    if (
      canSync &&
      state !== lastVerifiedState.current &&
      !isStateEqual(state, lastSyncedState.current ?? state)
    ) {
      lastSyncedState.current = state;
      setSynced(false);
      setError(null);
      syncDebounce({
        year: localYear,
        input: toRemotePayload(state),
      });
    }
  }, [syncDebounce, canSync, state, localYear]);

  useEffect(() => {
    const responseError = requestError?.message ?? data?.syncPlanning?.error;
    if (responseError) {
      setSynced(true);
      setError(responseError);
      if (lastVerifiedState.current) {
        setState(lastVerifiedState.current);
      }
    } else if (data?.syncPlanning?.year === localYear) {
      setSynced(true);
      const processed = toLocalState(data);
      lastVerifiedState.current = processed;
      lastSyncedState.current = processed;
      setState(processed);
      setError(null);
    }
  }, [data, requestError, localYear]);

  return {
    error,
    state,
    setState,
    isSynced,
    isLoading: fetching,
  };
}
