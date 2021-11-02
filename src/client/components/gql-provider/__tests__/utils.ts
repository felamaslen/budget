import { Server } from 'http';
import { Socket } from 'net';
import { addResolversToSchema } from '@graphql-tools/schema';
import express, { Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema, execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { useServer } from 'graphql-ws/lib/use/ws';
import ws from 'ws';

export const myApiKey = 'my-api-key';

const TEST_PUBSUB_TOPIC = 'TEST_PUBSUB_TOPIC';

const greetingsList = ['Hello', 'Hi', 'Bonjour', 'Bienvenido'];

export const pubsub = new PubSub();

const schema = addResolversToSchema({
  schema: buildSchema(`
  type BroadcastGreeting {
    ok: Boolean!
  }
  type Query {
    hello: String
    authenticatedHello: String
  }
  type Mutation {
    broadcastGreeting(index: Int!): BroadcastGreeting
  }
  type Subscription {
    greetings: String
  }
  `),
  resolvers: {
    Query: {
      hello: (): string => 'Hello world!',
      authenticatedHello: (_, __, req): string =>
        req.headers.authorization === myApiKey ? 'You are authorised' : 'Unauthorised',
    },
    Mutation: {
      broadcastGreeting: (_, { index }): { ok: boolean } => {
        pubsub.publish(TEST_PUBSUB_TOPIC, greetingsList[index % greetingsList.length]);
        return { ok: true };
      },
    },
    Subscription: {
      greetings: {
        subscribe: (): AsyncIterator<void> => pubsub.asyncIterator(TEST_PUBSUB_TOPIC),
        resolve: (payload): unknown => payload,
      },
    },
  },
});

export class MockServer {
  app: Express;

  server: Server | undefined;

  wsServer: ws.Server | undefined;

  sockets: Socket[] = [];

  constructor() {
    this.app = express();
    this.app.use((_, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
      next();
    });
    this.app.use('/graphql', graphqlHTTP({ schema }));
  }

  async setup(): Promise<void> {
    this.sockets = [];
    return new Promise<void>((resolve, reject) => {
      this.server = this.app.listen(4000, () => {
        this.wsServer = new ws.Server({
          server: this.server,
          path: '/subscriptions',
        });
        useServer({ schema, execute, subscribe }, this.wsServer);
      });

      this.server.on('connection', (socket) => {
        this.sockets.push(socket);
      });

      this.server.on('error', reject);
      this.server.on('listening', resolve);
    });
  }

  async teardown(): Promise<void> {
    await new Promise<void>(
      (resolve, reject) =>
        this.wsServer?.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }) ?? resolve(),
    );

    await Promise.all(
      this.sockets.map((socket) => new Promise<void>((resolve) => socket.end(resolve))),
    );

    await new Promise<void>(
      (resolve, reject) =>
        this.server?.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }) ?? resolve(),
    );
  }

  async reconnectAfterDelay(delayMs = 50): Promise<void> {
    await this.teardown();
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await this.setup();
  }
}
