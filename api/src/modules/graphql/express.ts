import { Server } from 'http';
import path from 'path';

import { getUnixTime } from 'date-fns';
import { Express, Request } from 'express';
import fs from 'fs-extra';
import { execute, subscribe } from 'graphql';
import { Context } from 'graphql-ws/lib/server';
import { useServer, Extra } from 'graphql-ws/lib/use/ws';
import ws from 'ws';

import { graphqlMiddleware } from './middleware';
import { pubsub, PubSubTopic } from './pubsub';
import { getSchema } from './schema';
import config from '~api/config';
import { authMiddleware, getUidFromToken, jwtFromRequest } from '~api/modules/auth';
import { Context as ExecutionContext } from '~api/types/resolver';

const anonymousContext: ExecutionContext = {
  user: undefined,
};

function getWSContext(ctx: Context<Extra>): ExecutionContext {
  const apiKey = ctx.connectionParams?.apiKey ?? null;
  if (!apiKey) {
    return anonymousContext;
  }

  try {
    const token = jwtFromRequest({
      headers: {
        authorization: apiKey,
      },
    } as Request);

    const uid = getUidFromToken(token);
    if (!uid) {
      return anonymousContext;
    }

    return { user: { uid } };
  } catch {
    return anonymousContext;
  }
}

export async function setupGraphQL(app: Express, server: Server): Promise<() => void> {
  const schema = await fs.readFile(path.resolve(__dirname, '../../introspection.json'));

  app.use('/graphql', graphqlMiddleware());

  app.get('/graphql-introspection', authMiddleware(), (_, res) => {
    res.send(schema);
  });

  const wsServer = new ws.Server({
    server,
    path: '/graphql',
  });

  return (): void => {
    useServer(
      {
        schema: getSchema(),
        context: getWSContext,
        execute,
        subscribe,
      },
      wsServer,
    );

    setInterval(() => {
      pubsub.publish(PubSubTopic.Heartbeat, getUnixTime(new Date()));
    }, config.app.heartbeatInterval);
  };
}
