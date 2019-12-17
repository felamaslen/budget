import { SocketWithAuth } from '~/server/modules/socket';

import overview from '~/server/routes/overview';
import netWorth from '~/server/routes/net-worth';

export default function socketRoutes(socket: SocketWithAuth): void {
  overview(socket);
  netWorth(socket);
}
