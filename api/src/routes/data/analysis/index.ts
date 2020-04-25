import { RequestHandler, Request, Response } from 'express';
import joi from 'joi';
import merge from 'deepmerge';
import addMonths from 'date-fns/addMonths';
import getDaysInMonth from 'date-fns/getDaysInMonth';

import db from '~api/modules/db';
import { User } from '~api/modules/auth';
import { analysisSchema } from '~api/schema';

import { Category, CATEGORIES, GroupBy, Period, Params, PeriodCostRows } from './types';
import { periodCondition, PeriodCondition, getCategoryColumn } from './common';

async function getPeriodCostForCategory(
  user: User,
  startTime: Date,
  endTime: Date,
  category: Category,
  groupBy: GroupBy,
): Promise<PeriodCostRows> {
  const categoryColumn = getCategoryColumn(category, groupBy);

  return db
    .select<PeriodCostRows>(`${categoryColumn} AS column`, db.raw('SUM(cost)::integer AS cost'))
    .from(category)
    .where('date', '>=', startTime.toISOString())
    .andWhere('date', '<=', endTime.toISOString())
    .andWhere('uid', '=', user.uid)
    .groupBy('column');
}

type RowsByDate = {
  [year: string]: {
    [month: string]: {
      [date: string]: number[];
    };
  };
};

type Results = {
  date: Date;
  cost: number;
}[][];

export function getRowsByDate(results: Results): RowsByDate {
  return results.reduce(
    (items, rows, categoryKey) =>
      rows.reduce((itemsByDate: RowsByDate, { date, cost }) => {
        const value = Math.max(0, cost);

        let dateObject = date;
        if (typeof date === 'string') {
          dateObject = new Date(date);
        }

        const year = dateObject.getFullYear();
        const month = dateObject.getMonth();
        const index = dateObject.getDate();

        const havePreceding =
          categoryKey === 0 ||
          (year in itemsByDate && month in itemsByDate[year] && index in itemsByDate[year][month]);

        const preceding = havePreceding ? [] : new Array(categoryKey).fill(0);

        return merge(itemsByDate, {
          [year]: {
            [month]: {
              [index]: [...preceding, value],
            },
          },
        });
      }, items),
    {},
  );
}

type TimelineRow = {
  date: Date;
  cost: number;
}[];

type Timeline = number[][];

function processTimelineData(
  data: TimelineRow[],
  { period }: Pick<Params, 'period'>,
  condition: PeriodCondition,
): Timeline | null {
  const rowsByDate = getRowsByDate(data);

  const { startTime } = condition;

  const year = startTime.getFullYear();

  if (period === Period.year) {
    return new Array(12)
      .fill(0)
      .map((_, index) => getDaysInMonth(addMonths(startTime, index)))
      .reduce((items: Timeline, daysInMonth, month): Timeline => {
        if (year in rowsByDate && month in rowsByDate[year]) {
          return [
            ...items,
            ...new Array(daysInMonth)
              .fill(0)
              .map((_, dateKey) => rowsByDate[year][month][dateKey + 1] || []),
          ];
        }

        return [...items, ...new Array(daysInMonth).fill([])];
      }, []);
  }
  if (period === Period.month) {
    const daysInMonth = getDaysInMonth(startTime);
    const month = startTime.getMonth();

    return new Array(daysInMonth).fill(0).map((_, key) => {
      if (year in rowsByDate && month in rowsByDate[year]) {
        return rowsByDate[year][month][key + 1] || [];
      }

      return [];
    });
  }

  return null;
}

type CostItem = [string, [string, number][]];

export type PeriodCost = {
  timeline: Timeline | null;
  cost: CostItem[];
  saved: number;
  description: string;
};

async function getIncome(user: User, condition: PeriodCondition): Promise<number> {
  const [{ cost: income }] = await db
    .select<{ cost: number }[]>(db.raw('SUM(cost) AS cost'))
    .from('income')
    .where('date', '>=', condition.startTime.toISOString())
    .andWhere('date', '<=', condition.endTime.toISOString())
    .andWhere('uid', '=', user.uid);

  return income;
}

async function getPeriodCost(user: User, now: Date, params: Params): Promise<PeriodCost> {
  const { period, groupBy, pageIndex } = params;

  const condition = periodCondition(now, period, pageIndex);

  const { startTime, endTime, description } = condition;

  const [income, costs, timelineData]: [
    number,
    PeriodCostRows[],
    TimelineRow[],
  ] = await Promise.all([
    getIncome(user, condition),

    Promise.all(
      CATEGORIES.map(category =>
        getPeriodCostForCategory(user, startTime, endTime, category, groupBy),
      ),
    ),

    Promise.all(
      CATEGORIES.map(category =>
        db
          .select<TimelineRow>('date', db.raw('SUM(cost) AS cost'))
          .from(category)
          .where('date', '>=', condition.startTime.toISOString())
          .andWhere('date', '<=', condition.endTime.toISOString())
          .andWhere('uid', '=', user.uid)
          .groupBy('date'),
      ),
    ),
  ]);

  const itemCost = costs.map(
    (rows, index): CostItem => [CATEGORIES[index], rows.map(({ column, cost }) => [column, cost])],
  );

  const totalCost = costs.reduce(
    (sum, result) => result.reduce((resultSum, { cost }) => resultSum + Number(cost), sum),
    0,
  );

  const saved = Math.max(0, income - totalCost);

  const timeline = processTimelineData(timelineData, params, condition);

  return {
    timeline,
    cost: itemCost,
    saved,
    description,
  };
}

export async function routeGet(req: Request, res: Response): Promise<void> {
  console.log('analysis routeGet', req.params);
  const { error, value } = joi.validate<Params>((req.params as object) as Params, analysisSchema);

  if (error) {
    res.status(400).json({ errorMessage: error.message });
    return;
  }

  res.json({ foo: 'bar' });
  // const data = await getPeriodCost(req.user as User, new Date(), value);
  // res.json({ data });
}
