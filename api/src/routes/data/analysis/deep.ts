import { RequestHandler, Request, Response } from 'express';
import joi from 'joi';

import db from '~api/modules/db';
import { User } from '~api/modules/auth';
import { analysisDeepSchema } from '~api/schema';
import { getCategoryColumn, periodCondition } from './common';
import { ParamsDeep, PeriodCostRow } from './types';

type PeriodCostDeepRows = ({
  item: string;
} & PeriodCostRow)[];

async function getPeriodCostDeep(
  user: User,
  now: Date,
  params: ParamsDeep,
): Promise<PeriodCostDeepRows> {
  const { period, groupBy, pageIndex, category } = params;

  const categoryColumn = getCategoryColumn(category, groupBy);

  const { startTime, endTime } = periodCondition(now, period, pageIndex);

  return db
    .select<PeriodCostDeepRows>(
      'item',
      `${categoryColumn} AS category`,
      db.raw('SUM(cost)::integer AS cost'),
    )
    .from(category)
    .where('date', '>=', startTime.toISOString())
    .andWhere('date', '<=', endTime.toISOString())
    .andWhere('cost', '>', 0)
    .andWhere('uid', '=', user.uid)
    .groupBy('item', 'itemCol')
    .orderBy('itemCol');
}

type PeriodCostDeepItems = {
  [key: string]: [string, number][];
};

type PeriodCostDeep = [string, [string, number][]][];

function processDataResponse(result: PeriodCostDeepRows): PeriodCostDeep {
  const resultObj: PeriodCostDeepItems = result.reduce(
    (obj: PeriodCostDeepItems, { column, item, cost }): PeriodCostDeepItems => {
      if (column in obj) {
        return { ...obj, [column]: [...obj[column], [item, Number(cost)]] };
      }

      return { ...obj, [column]: [[item, Number(cost)]] };
    },
    {},
  );

  return Object.keys(resultObj).map(column => [column, resultObj[column]]);
}

export async function routeGet(req: Request, res: Response): Promise<void> {
  const { error, value } = joi.validate<ParamsDeep>(
    (req.params as object) as ParamsDeep,
    analysisDeepSchema,
  );

  if (error) {
    res.status(400).json({ errorMessage: error.message });
    return;
  }

  const results = await getPeriodCostDeep(req.user as User, new Date(), value);
  const items = processDataResponse(results);

  res.json({ data: { items } });
}
