import { createContext, useContext } from 'react';

import { PlanningContextState, PlanningDispatch, State } from './types';

import { VOID } from '~client/modules/data';
import { getFinancialYear } from '~shared/planning';

export const PlanningContextDispatch = createContext<PlanningDispatch>(VOID);
export const usePlanningDispatch = (): PlanningDispatch => useContext(PlanningContextDispatch);

const initialYear = getFinancialYear(new Date());

export const initialState: State = {
  year: initialYear,
  accounts: [],
  parameters: {
    rates: [],
    thresholds: [],
  },
};

export const PlanningContext = createContext<PlanningContextState>({
  localYear: initialYear,
  state: initialState,
  isSynced: true,
  isLoading: true,
  error: null,
  table: [],
});

export const usePlanningContext = (): PlanningContextState => useContext(PlanningContext);
export const usePlanningState = (): State => usePlanningContext().state;
