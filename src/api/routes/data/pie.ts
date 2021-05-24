import boom from '@hapi/boom';
import { Router } from 'express';
import { DatabaseTransactionConnectionType, sql } from 'slonik';

import config from '~api/config';
import { authDbRoute } from '~api/middleware/request';
import { PageListStandard } from '~api/types';

type PieCol = [string, string];

export function getPieCols(category: PageListStandard): PieCol[] | null {
  if ([PageListStandard.Food, PageListStandard.General].includes(category)) {
    return [
      ['shop', 'Shop cost'],
      ['category', 'Category cost'],
    ];
  }
  if (category === PageListStandard.Social) {
    return [
      ['shop', 'Shop cost'],
      ['category', 'Society cost'],
    ];
  }
  if (category === PageListStandard.Holiday) {
    return [
      ['shop', 'Shop cost'],
      ['category', 'Holiday cost'],
    ];
  }

  throw boom.badRequest('Invalid category');
}

type PieRow = {
  col: string;
  cost: number;
};

async function getPieQuery(
  db: DatabaseTransactionConnectionType,
  uid: number,
  pieCol: PieCol,
  page: PageListStandard,
): Promise<readonly PieRow[]> {
  const [column] = pieCol;
  const limit = config.data.pie.detail;

  const results = await db.query<PieRow>(sql`
  SELECT ${sql.identifier([column])} AS col, SUM(value) AS cost
  FROM list_standard
  WHERE page = ${page} AND uid = ${uid} AND value > 0
  GROUP BY col
  ORDER BY cost DESC
  LIMIT ${limit}
  `);
  return results.rows;
}

type Segment = {
  title: string;
  type: string;
  data: [string, number][];
  total: number;
};

export function processQueryResult(
  result: readonly PieRow[],
  pieCol: PieCol,
  threshold: number,
): Segment {
  const [, title] = pieCol;
  const total = result.reduce<number>((sum, row) => sum + row.cost, 0);

  const data = result.map<[string, number]>((row) => [row.col, row.cost]);
  const type = 'cost';
  if (!total) {
    return { title, type, data, total };
  }

  // concatenate very small slices into a slice called "other"
  const other = data
    .filter(([, cost]) => cost < threshold * total)
    .reduce((sum, [, cost]) => sum + cost, 0);

  const display = data.filter(([, cost]) => cost >= threshold * total);

  const all: [string, number][] = other > 0 ? [...display, ['Other', other]] : display;

  const sortedData = all.sort(([, cost1], [, cost2]) => {
    if (cost1 > cost2) {
      return -1;
    }
    if (cost1 < cost2) {
      return 1;
    }

    return 0;
  });

  return {
    title,
    type,
    data: sortedData,
    total,
  };
}

async function getPieData(
  db: DatabaseTransactionConnectionType,
  uid: number,
  pieCols: PieCol[],
  category: PageListStandard,
): Promise<Segment[]> {
  const threshold = config.data.pie.tolerance / (2 * Math.PI);

  const results = await Promise.all(
    pieCols.map((pieCol) => getPieQuery(db, uid, pieCol, category)),
  );

  return results
    .filter(Boolean)
    .map((result, key) => processQueryResult(result, pieCols[key], threshold));
}

const routeGet = authDbRoute(async (db, req, res) => {
  const { category } = req.params;
  const pieCols = getPieCols(category as PageListStandard);
  if (!pieCols) {
    throw boom.badRequest('unknown category');
  }
  if (!req.user?.uid) {
    throw boom.unauthorized();
  }

  const list = await getPieData(db, req.user.uid, pieCols, category as PageListStandard);
  res.json({ data: { list } });
});

export function handler(): Router {
  const router = Router();
  router.get('/:category', routeGet);
  return router;
}
