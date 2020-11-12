import { Router } from 'express';

import { getSuggestions, getReceiptCategories, getReceiptItem } from '~api/controllers';
import { validatedAuthDbRoute } from '~api/middleware/request';
import { searchSchema, receiptSchema } from '~api/schema';
import { SearchParams } from '~api/types';

const routeGet = validatedAuthDbRoute<never, SearchParams>(
  {
    params: searchSchema,
  },
  async (db, req, res, _, params) => {
    const data = await getSuggestions(db, req.user.uid, params);
    res.json({ data });
  },
);

const routeMatchReceiptItems = validatedAuthDbRoute<void, void, { q: string }>(
  {
    query: receiptSchema,
  },
  async (db, req, res, _, __, query) => {
    const result = await getReceiptCategories(db, req.user.uid, query.q);
    res.json(result);
  },
);

const routeMatchReceiptItemName = validatedAuthDbRoute<void, void, { q: string }>(
  {
    query: receiptSchema,
  },
  async (db, req, res, _, __, query) => {
    const result = await getReceiptItem(db, req.user.uid, query.q);
    res.json(result);
  },
);

export function handler(): Router {
  const router = Router();
  router.get('/receipt/items', routeMatchReceiptItems);
  router.get('/receipt/item-name', routeMatchReceiptItemName);
  router.get('/:table/:column/:searchTerm/:numResults?', routeGet);
  return router;
}
