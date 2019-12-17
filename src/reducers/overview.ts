import config from '~/config';
import createReducer from '~/reducers/create-reducer';
import { Overview } from '~/types/overview';
import { SocketAction } from '~/types/actions';
import { isOverviewReadAction } from '~/actions/overview';
import { OVERVIEW_READ } from '~/constants/actions.rt';

export interface State extends Overview {
  futureMonths: number;
}

export const initialState: State = {
  startDate: new Date(),
  viewStartDate: new Date(),
  futureMonths: config.futureMonths,
  netWorth: [],
  funds: [],
  income: [],
  bills: [],
  food: [],
  general: [],
  holiday: [],
  social: [],
};

const onRead = (state: State, action: SocketAction<Overview<string>>): Partial<State> => {
  if (isOverviewReadAction(action)) {
    return {
      ...action.payload,
      startDate: new Date(action.payload.startDate),
      viewStartDate: new Date(action.payload.viewStartDate),
    };
  }

  return {};
};

const overviewReducer = createReducer<State, Overview<string>>({
  initialState,
  handlers: {
    [OVERVIEW_READ]: onRead,
  },
});

export default overviewReducer;

export { overviewReducer as reducer };
