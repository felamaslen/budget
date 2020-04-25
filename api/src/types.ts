import Knex from 'knex';
import { Logger } from 'winston';
import { RequestHandler } from 'express';

import { Config } from '~api/config';

export enum ListCategory {
  income = 'income',
  bills = 'bills',
  funds = 'funds',
  food = 'food',
  general = 'general',
  social = 'social',
  holiday = 'holiday',
}

export type HandlerFactoryLegacy = (config: Config, db: Knex, logger?: Logger) => RequestHandler;

type HandlerFactory = RequestHandler | HandlerFactoryLegacy;

export type ListHandler<H = HandlerFactory> = {
  routeGet: H;
  routePost: H;
  routePut: H;
  routeDelete: H;
};
