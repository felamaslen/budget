import { SocketAction } from '~/actions/types';
import { OVERVIEW_READ } from '~/constants/actions.rt';

export interface DataPayload {
  pastMonths: number;
  funds: {
    value: number;
    cost: number;
  }[];
  income: number[];
  bills: number[];
  food: number[];
  general: number[];
  holiday: number[];
  social: number[];
}

export interface OverviewPayload extends DataPayload {
  startDate: string;
}

interface OverviewReadAction extends SocketAction {
  payload: OverviewPayload;
}

export const isOverviewReadAction = (action: SocketAction): action is OverviewReadAction =>
  action.type === OVERVIEW_READ && action.__FROM_SOCKET__ === true;

export const overviewRead = (): SocketAction => ({
  type: OVERVIEW_READ,
  __FROM_SOCKET__: false,
});
