import { Overview } from '~/types/overview';
import { SocketAction } from '~/types/actions';
import { OVERVIEW_READ } from '~/constants/actions.rt';

interface OverviewReadAction extends SocketAction {
  payload: Overview;
}

export const isOverviewReadAction = (action: SocketAction): action is OverviewReadAction =>
  action.type === OVERVIEW_READ && action.__FROM_SOCKET__ === true;

export const overviewRead = (): SocketAction => ({
  type: OVERVIEW_READ,
  __FROM_SOCKET__: false,
});
