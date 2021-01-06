import { Server } from 'http';
import path from 'path';

import { getUnixTime } from 'date-fns';
import { Express, Request } from 'express';
import { graphqlHTTP } from 'express-graphql';
import fs from 'fs-extra';
import { execute, subscribe } from 'graphql';
import { Context } from 'graphql-ws/lib/server';
import { useServer, Extra } from 'graphql-ws/lib/use/ws';
import ws from 'ws';

import { pubsub, PubSubTopic } from './pubsub';
import { getSchema } from './schema';
import config from '~api/config';
import { authMiddleware, getUidFromToken, jwtFromRequest } from '~api/modules/auth';
import { Context as ExecutionContext } from '~api/types/resolver';

const anonymousContext = {
  user: undefined,
  session: {},
} as ExecutionContext;

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

    return { user: { uid }, session: {} } as ExecutionContext;
  } catch {
    return anonymousContext;
  }
}

export async function setupGraphQL(app: Express, server: Server): Promise<() => void> {
  const schema = await fs.readFile(path.resolve(__dirname, '../../introspection.json'));

  app.use(
    '/graphql',
    graphqlHTTP({
      schema: getSchema(),
      graphiql: process.env.NODE_ENV !== 'production',
    }),
  );

  app.get('/introspection', authMiddleware, (_, res) => {
    res.send(schema);
  });

  const wsServer = new ws.Server({
    server,
    path: '/subscriptions',
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
