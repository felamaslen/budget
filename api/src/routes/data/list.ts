import { ObjectSchema } from '@hapi/joi';
import { RequestHandler, Router } from 'express';

import config from '~api/config';
import { createListData, readListData, updateListData, deleteListData } from '~api/controllers';
import { authDbRoute, validatedAuthDbRoute } from '~api/middleware/request';
import * as ListSchema from '~api/schema';
import {
  ListCalcCategory,
  ListCalcItem,
  CreateListCalc,
  UpdateListCalc,
  Page,
  Income,
  Bill,
  Food,
  General,
  Holiday,
  Social,
} from '~api/types';

const makeRoutePost = <I extends ListCalcItem>(
  databaseName: string | undefined,
  category: ListCalcCategory,
  schema: ObjectSchema,
): RequestHandler =>
  validatedAuthDbRoute<CreateListCalc<I>>(
    {
      data: ListSchema.insert(schema),
    },
    async (db, req, res, item) => {
      const response = await createListData(db, req.user.uid, category, item);

      res.status(201);
      res.json(response);
    },
  )(databaseName);

const makeRouteGet = (
  databaseName: string | undefined,
  category: ListCalcCategory,
): RequestHandler =>
  authDbRoute(async (db, req, res) => {
    const data = await readListData(
      db,
      req.user.uid,
      category,
      Number(req.query.limit) || config.data.listPageLimit,
      Number(req.params.page) || 0,
    );
    res.json({ data });
  })(databaseName);

const makeRoutePut = <I extends ListCalcItem>(
  databaseName: string | undefined,
  category: ListCalcCategory,
  schema: ObjectSchema,
): RequestHandler =>
  validatedAuthDbRoute<UpdateListCalc<I>>(
    {
      data: ListSchema.update(schema),
    },
    async (db, req, res, item) => {
      const response = await updateListData(db, req.user.uid, category, item);
      res.json(response);
    },
  )(databaseName);

const makeRouteDelete = (
  databaseName: string | undefined,
  category: ListCalcCategory,
): RequestHandler =>
  validatedAuthDbRoute<{ id: number }>(
    {
      data: ListSchema.deleteRequest,
    },
    async (db, req, res, { id }) => {
      const response = await deleteListData(db, req.user.uid, category, id);
      res.json(response);
    },
  )(databaseName);

export const makeStandardListRouter = <I extends ListCalcItem>(
  category: ListCalcCategory,
  schema: ObjectSchema,
) => (databaseName?: string): Router => {
  const router = Router();

  router.post('/', makeRoutePost<I>(databaseName, category, schema));
  router.get('/:page?', makeRouteGet(databaseName, category));
  router.put('/', makeRoutePut<I>(databaseName, category, schema));
  router.delete('/', makeRouteDelete(databaseName, category));

  return router;
};

export const routeIncome = makeStandardListRouter<Income>(Page.income, ListSchema.income);
export const routeBills = makeStandardListRouter<Bill>(Page.bills, ListSchema.bill);
export const routeFood = makeStandardListRouter<Food>(Page.food, ListSchema.food);
export const routeGeneral = makeStandardListRouter<General>(Page.general, ListSchema.general);
export const routeHoliday = makeStandardListRouter<Holiday>(Page.holiday, ListSchema.holiday);
export const routeSocial = makeStandardListRouter<Social>(Page.social, ListSchema.social);
