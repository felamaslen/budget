import { Overview } from '~/types/overview';
import { SocketWithAuth, ioRoute } from '~/server/modules/socket';
import { getOverview } from '~/server/queries/overview';
import { OVERVIEW_READ } from '~/constants/actions.rt';

export default (socket: SocketWithAuth): void => {
  ioRoute<Overview>(socket, OVERVIEW_READ, getOverview);
};
