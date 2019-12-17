import createReducer from '~/reducers/create-reducer';
import { OverviewBase } from '~/types/overview';
import { SocketAction } from '~/actions/types';
import { isOverviewReadAction } from '~/actions/overview';
import { OVERVIEW_READ, NET_WORTH_ENTRIES_READ } from '~/constants/actions.rt';

export interface OverviewState extends OverviewBase {
  startDate?: Date;
}

export const initialState: OverviewState = {
  pastMonths: 0,
  netWorth: [],
  funds: [],
  income: [],
  bills: [],
  food: [],
  general: [],
  holiday: [],
  social: [],
};

const onRead = (state: OverviewState, action: SocketAction): Partial<OverviewState> => {
  if (isOverviewReadAction(action)) {
    return {
      ...action.payload,
      startDate: new Date(action.payload.startDate),
    };
  }

  return {};
};

const onNetWorthRead = (state: OverviewState, action: SocketAction): Partial<OverviewState> => {
  if (!action.__FROM_SOCKET__) {
    return {};
  }

  return {
    netWorth: [],
  };
};

const overviewReducer = createReducer<OverviewState>({
  initialState,
  handlers: {
    [OVERVIEW_READ]: onRead,
    [NET_WORTH_ENTRIES_READ]: onNetWorthRead,
  },
});

export default overviewReducer;
