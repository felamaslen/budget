import { Server } from 'http';
import { Test, SuperTest, Request } from 'supertest';

declare global {
  type Agent = SuperTest<Test>;
  type WithAuth = (request: Request, token?: string) => Request;

  namespace NodeJS {
    interface Global {
      server: Server;
      agent: Agent;
      bearerToken: string;
      withAuth: WithAuth;
    }
  }
}

declare const server: Server;
declare const agent: Agent;
