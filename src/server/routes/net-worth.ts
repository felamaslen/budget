import { NetWorth } from '~/types/net-worth';
import { SocketWithAuth, ioRoute } from '~/server/modules/socket';
import { getNetWorth } from '~/server/queries/net-worth';
import { NET_WORTH_READ } from '~/constants/actions.rt';

export default (socket: SocketWithAuth): void => {
  ioRoute<NetWorth, void>(socket, NET_WORTH_READ, getNetWorth);
};
