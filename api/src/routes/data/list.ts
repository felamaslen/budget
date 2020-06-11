import { ObjectSchema } from '@hapi/joi';
import { RequestHandler, Router } from 'express';

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
  );

const makeRouteGet = (category: ListCalcCategory): RequestHandler =>
  authDbRoute(async (db, req, res) => {
    const data = await readListData(
      db,
      req.user.uid,
      category,
      new Date(),
      Number(req.params.page) || 0,
    );
    res.json({ data });
  });

const makeRoutePut = <I extends ListCalcItem>(
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
  );

const makeRouteDelete = (category: ListCalcCategory): RequestHandler =>
  validatedAuthDbRoute<{ id: string }>(
    {
      data: ListSchema.deleteRequest,
    },
    async (db, req, res, { id }) => {
      const response = await deleteListData(db, req.user.uid, category, id);
      res.json(response);
    },
  );

export function makeStandardListRouter<I extends ListCalcItem>(
  category: ListCalcCategory,
  schema: ObjectSchema,
): Router {
  const router = Router();

  router.post('/', makeRoutePost<I>(category, schema));
  router.get('/:page?', makeRouteGet(category));
  router.put('/', makeRoutePut<I>(category, schema));
  router.delete('/', makeRouteDelete(category));

  return router;
}

export const routeIncome = makeStandardListRouter<Income>(Page.income, ListSchema.income);
export const routeBills = makeStandardListRouter<Bill>(Page.bills, ListSchema.bill);
export const routeFood = makeStandardListRouter<Food>(Page.food, ListSchema.food);
export const routeGeneral = makeStandardListRouter<General>(Page.general, ListSchema.general);
export const routeHoliday = makeStandardListRouter<Holiday>(Page.holiday, ListSchema.holiday);
export const routeSocial = makeStandardListRouter<Social>(Page.social, ListSchema.social);
