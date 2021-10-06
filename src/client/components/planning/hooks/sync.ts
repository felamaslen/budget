import { useDebounceCallback } from '@react-hook/debounce';
import omit from 'lodash/omit';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { initialState } from '../context';
import type { State } from '../types';
import { isStateEqual } from './utils';

import { PlanningSync, SyncPlanningMutation, useSyncPlanningMutation } from '~client/types/gql';
import { omitDeep } from '~shared/utils';

const processSyncedState = (result: SyncPlanningMutation): State =>
  omitDeep(
    {
      accounts: result?.syncPlanning?.accounts ?? [],
      parameters: result?.syncPlanning?.parameters ?? [],
    },
    '__typename',
  );

const processLocalState = (state: State): PlanningSync => ({
  accounts: state.accounts.map((row) => omit(row, 'pastIncome')),
  parameters: state.parameters,
});

export function usePlanning(): {
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
    sync();
  }, [sync]);

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
        input: processLocalState(state),
      });
    }
  }, [syncDebounce, canSync, state]);

  useEffect(() => {
    const responseError = requestError?.message ?? data?.syncPlanning?.error;
    if (responseError) {
      setSynced(true);
      setError(responseError);
      if (lastVerifiedState.current) {
        setState(lastVerifiedState.current);
      }
    } else if (data?.syncPlanning) {
      setSynced(true);
      const processed = processSyncedState(data);
      lastVerifiedState.current = processed;
      lastSyncedState.current = processed;
      setState(processed);
      setError(null);
    }
  }, [data, requestError]);

  return {
    error,
    state,
    setState,
    isSynced,
    isLoading: fetching,
  };
}
