import { Server } from 'http';
import path from 'path';

import { Express, Request } from 'express';
import { graphqlHTTP } from 'express-graphql';
import fs from 'fs-extra';
import { execute, subscribe } from 'graphql';
import { Context } from 'graphql-ws';
import { useServer, Extra } from 'graphql-ws/lib/use/ws';
import ws from 'ws';

import { getSchema } from './schema';
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
  const introspection = await fs.readFile(path.resolve(__dirname, '../../introspection.json'));

  app.use(
    '/graphql',
    graphqlHTTP({
      schema: getSchema(),
      graphiql: process.env.NODE_ENV !== 'production',
    }),
  );

  app.get('/introspection', authMiddleware, (_, res) => {
    res.send(introspection);
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
  };
}
