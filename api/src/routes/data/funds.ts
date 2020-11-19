import { Router } from 'express';
import {
  createFund,
  getFundsData,
  updateFund,
  deleteListData,
  upsertCashTarget,
} from '~api/controllers';
import { validatedAuthDbRoute } from '~api/middleware/request';
import * as FundSchema from '~api/schema/funds';
import * as ListSchema from '~api/schema/list';
import { FundsParams, Fund, Page, CreateList, UpdateList } from '~api/types';

const routePost = validatedAuthDbRoute<CreateList<Fund>>(
  {
    data: ListSchema.insert(FundSchema.fund),
  },
  async (db, req, res, fund) => {
    const response = await createFund(db, req.user.uid, fund);
    res.status(201);
    res.json(response);
  },
);

const routeGet = validatedAuthDbRoute<never, never, FundsParams>(
  {
    query: FundSchema.readParams,
  },
  async (db, req, res, _, __, query) => {
    const data = await getFundsData(db, req.user.uid, query, new Date());
    res.json({ data });
  },
);

const routePut = validatedAuthDbRoute<UpdateList<Fund>>(
  {
    data: ListSchema.update(FundSchema.fund),
  },
  async (db, req, res, fund) => {
    const response = await updateFund(db, req.user.uid, fund);
    res.json(response);
  },
);

const routeDelete = validatedAuthDbRoute<{ id: number }>(
  {
    data: ListSchema.deleteRequest,
  },
  async (db, req, res, { id }) => {
    const response = await deleteListData(db, req.user.uid, Page.funds, id);
    res.json(response);
  },
);

const routePutCashTarget = validatedAuthDbRoute<{ cashTarget: number }>(
  { data: FundSchema.cashTargetSchema },
  async (db, req, res, { cashTarget }) => {
    const updatedCashTarget = await upsertCashTarget(db, req.user.uid, cashTarget);
    res.json({ cashTarget: updatedCashTarget });
  },
);

export const handler = (databaseName?: string): Router => {
  const router = Router();

  router.post('/', routePost(databaseName));
  router.get('/', routeGet(databaseName));
  router.put('/', routePut(databaseName));
  router.delete('/', routeDelete(databaseName));

  router.put('/cash-target', routePutCashTarget(databaseName));

  return router;
};
