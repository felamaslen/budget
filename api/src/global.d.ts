import { Server } from 'http';
import { Test, SuperTest, Request } from 'supertest';

declare global {
  type Agent = SuperTest<Test>;
  type WithAuth = (request: Request, token?: string) => Request;
}

declare const server: Server;
declare const agent: Agent;
