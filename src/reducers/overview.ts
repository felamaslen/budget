import { Reducer } from 'redux';

import createReducer from '~/reducers/create-reducer';
import { OverviewBase } from '~/types/overview';
import { SocketAction } from '~/actions/types';
import { isOverviewReadAction } from '~/actions/overview';
import { OVERVIEW_READ } from '~/constants/actions.rt';

export interface OverviewState extends OverviewBase {
  startDate?: Date;
}

export const initialState: OverviewState = {
  pastMonths: 0,
  funds: [],
  income: [],
  bills: [],
  food: [],
  general: [],
  holiday: [],
  social: [],
};

const onRead = (state: OverviewState, action: SocketAction): OverviewState => {
  if (isOverviewReadAction(action)) {
    return {
      ...action.payload,
      startDate: new Date(action.payload.startDate),
    };
  }

  return state;
};

const overviewReducer = createReducer<OverviewState>({
  initialState,
  handlers: {
    [OVERVIEW_READ]: onRead,
  },
});

export default overviewReducer;
