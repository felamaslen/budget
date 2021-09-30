import { createContext, Dispatch, SetStateAction, useContext } from 'react';

import type { State } from './types';
import { VOID } from '~client/modules/data';

export const PlanningContextSetState = createContext<Dispatch<SetStateAction<State>>>(VOID);

export const usePlanningDispatch = (): Dispatch<SetStateAction<State>> =>
  useContext(PlanningContextSetState);

export const initialState: State = {
  accounts: [],
  parameters: [],
};

export const PlanningContextState = createContext<State>(initialState);

export const usePlanningState = (): State => useContext(PlanningContextState);
