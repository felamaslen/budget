import { Server } from 'http';
import { sql, DatabasePoolConnectionType, QueryResultRowType } from 'slonik';
import setupIO, { Socket, Handshake } from 'socket.io';
import redisAdapter from 'socket.io-redis';

import { getLogger } from '~/server/modules/logger';
import getRedisClient from '~/server/modules/redis';
import { LoginResponse, verifyToken } from '~/server/modules/auth';
import { withDb } from '~/server/modules/db';

const logger = getLogger('modules/socket');

interface HandshakeWithAuth extends Handshake {
  user?: LoginResponse;
}

interface SocketWithAuth extends Socket {
  handshake: HandshakeWithAuth;
}

const authenticate = withDb<LoginResponse>(
  async (
    db: DatabasePoolConnectionType,
    socket: SocketWithAuth,
    next: (err?: any) => void,
  ): Promise<void> => {
    const { token } = socket.handshake.query;
    if (!token) {
      return next(new Error('Must provide authentication token'));
    }

    try {
      const userId = await verifyToken(token);
      const { rows } = await db.query(sql`
select uid, name
from users
where uid = ${userId}
      `);

      if (!rows.length) {
        throw new Error('User does not exist');
      }

      const user: QueryResultRowType<'uid' | 'name'> = rows[0];
      // eslint-disable-next-line no-param-reassign
      socket.handshake.user = {
        uid: String(user.uid),
        name: String(user.name),
        token,
      };

      return next();
    } catch (err) {
      return next(err);
    }
  },
);

function onConnection(socket: SocketWithAuth) {
  if (!socket.handshake.user) {
    logger.debug('Anonymous connection: %s', socket.id);
    return;
  }

  const userId = socket.handshake.user.uid;

  socket.on('disconnect', () => {
    logger.debug('Disconnected: %s <- %s', socket.id, userId);
  });

  logger.debug('Connected: %s -> %s', socket.id, userId);

  // socketRoutes(socket, ioServer);
}

export default function setupSockets(server: Server) {
  const io = setupIO(server);

  io.adapter(
    redisAdapter({
      pubClient: getRedisClient('io.pub'),
      subClient: getRedisClient('io.sub'),
    }),
  );

  io.use(authenticate);

  io.on('connection', onConnection);
}
