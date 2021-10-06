import { createContext, useContext } from 'react';

import { PlanningContextState, PlanningDispatch, State } from './types';
import { getFinancialYear } from './utils';

import { VOID } from '~client/modules/data';

export const PlanningContextDispatch = createContext<PlanningDispatch>(VOID);
export const usePlanningDispatch = (): PlanningDispatch => useContext(PlanningContextDispatch);

export const initialState: State = {
  accounts: [],
  parameters: [],
};

export const PlanningContext = createContext<PlanningContextState>({
  state: initialState,
  year: getFinancialYear(new Date()),
  isSynced: true,
  isLoading: true,
  error: null,
  table: [],
});

export const usePlanningContext = (): PlanningContextState => useContext(PlanningContext);
export const usePlanningState = (): State => usePlanningContext().state;
