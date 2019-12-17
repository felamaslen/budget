import { Server } from 'http';
import { sql, DatabasePoolConnectionType, QueryResultRowType } from 'slonik';
import setupIO, { Socket, Handshake } from 'socket.io';
import redisAdapter from 'socket.io-redis';

import { getLogger } from '~/server/modules/logger';
import getRedisClient from '~/server/modules/redis';
import { LoginResponse, verifyToken } from '~/server/modules/auth';
import { withDb } from '~/server/modules/db';
import socketRoutes from '~/server/routes/socket';
import { ERRORED } from '~/constants/actions.rt';
import { ActionPayload } from '~/types/actions';

const logger = getLogger('modules/socket');

interface HandshakeWithAuth extends Handshake {
  user: LoginResponse;
}

export interface SocketWithAuth extends Socket {
  handshake: HandshakeWithAuth;
}

const authenticate = withDb<void>(
  async (
    db: DatabasePoolConnectionType,
    socket: SocketWithAuth,
    next: (err?: Error) => void,
  ): Promise<void> => {
    const { token } = socket.handshake.query;
    if (!token) {
      logger.debug('Anonymous connection: %s', socket.id);
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

function onConnection(socket: SocketWithAuth): void {
  if (!socket.handshake.user) {
    return;
  }

  const userId = socket.handshake.user.uid;

  socket.on('disconnect', () => {
    logger.debug('Disconnected: %s <- %s', socket.id, userId);
  });

  logger.debug('Connected: %s -> %s', socket.id, userId);

  socketRoutes(socket);
}

type RouteHandler<R = object, A = ActionPayload> = (
  db: DatabasePoolConnectionType,
  userId: string,
  data: A,
) => Promise<R>;

export const ioRoute = <R, A = ActionPayload>(
  socket: SocketWithAuth,
  actionType: string,
  handler: RouteHandler<R, A>,
): void => {
  socket.on(
    actionType,
    withDb(
      async (db: DatabasePoolConnectionType, data: A): Promise<void> => {
        try {
          const result = await handler(db, socket.handshake.user.uid, data);

          if (result) {
            socket.emit(actionType, result);
          }
        } catch (err) {
          socket.emit(ERRORED, {
            error: err.message,
            actionType,
          });
        }
      },
    ),
  );
};

export function setupSockets(server: Server): void {
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
