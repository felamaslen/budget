import { createContext, useContext } from 'react';

import { LocalState, PlanningContextState, PlanningDispatch, State } from './types';
import { getFinancialYear } from './utils';

import { VOID } from '~client/modules/data';

export const PlanningContextDispatch = createContext<PlanningDispatch>({
  local: VOID,
  sync: VOID,
});
export const usePlanningDispatch = (): PlanningDispatch => useContext(PlanningContextDispatch);

export const initialState: State = {
  accounts: [],
  parameters: [],
};

export const initialLocalState: LocalState = {
  year: getFinancialYear(new Date()),
};

export const PlanningContext = createContext<PlanningContextState>({
  state: initialState,
  local: initialLocalState,
  isSynced: true,
  isLoading: true,
  error: null,
  table: [],
});

export const usePlanningContext = (): PlanningContextState => useContext(PlanningContext);
export const usePlanningState = (): State => usePlanningContext().state;
