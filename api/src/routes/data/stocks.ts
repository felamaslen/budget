import { Router } from 'express';
import { sql, DatabaseTransactionConnectionType } from 'slonik';
import config from '~api/config';
import { authDbRoute } from '~api/middleware/request';

type StockRow = {
  code: string;
  name: string;
  sum_weight: number;
};

async function getStocks(
  db: DatabaseTransactionConnectionType,
  uid: string,
): Promise<readonly StockRow[]> {
  const result = await db.query<StockRow>(sql`
  SELECT code, name, SUM(weight * subweight)::float AS sum_weight
  FROM stocks
  WHERE uid = ${uid}
  GROUP BY code, name
  ORDER BY sum_weight DESC
  `);
  return result.rows;
}

type Stock = [string, string, number];

export function processStocks(
  queryResult: readonly StockRow[],
  apiKey: string,
): {
  stocks: Stock[];
  total: number;
  apiKey: string;
} {
  const stocks = queryResult.map<Stock>(({ code, name, sum_weight: sumWeight }) => [
    code,
    name,
    sumWeight,
  ]);

  const total = stocks.reduce((sum, [, , weight]) => sum + weight, 0);

  return { stocks, total, apiKey };
}

const routeGet = authDbRoute(async (db, req, res) => {
  const stocksQueryResult = await getStocks(db, req.user.uid);
  const data = processStocks(stocksQueryResult, config.data.funds.stocksApiKey);

  res.json({ data });
});

export function handler(): Router {
  const router = Router();
  router.get('/', routeGet);
  return router;
}
