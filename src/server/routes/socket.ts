import { SocketWithAuth, ioRoute } from '~/server/modules/socket';
import { OVERVIEW_READ } from '~/constants/actions.rt';
import { getOverview } from '~/server/queries/overview';

const onOverviewRead = async (socket: SocketWithAuth): Promise<void> => {
  const data = await getOverview(socket.handshake.user.uid);

  socket.emit(OVERVIEW_READ, data);
};

export default function socketRoutes(socket: SocketWithAuth): void {
  ioRoute(socket, OVERVIEW_READ, onOverviewRead);
}
