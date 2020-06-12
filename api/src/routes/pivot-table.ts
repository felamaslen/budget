import joi from '@hapi/joi';
import { compose } from '@typed/compose';
import { Router } from 'express';
import levenshtein from 'fast-levenshtein';
import { replaceAtIndex, removeAtIndex } from 'replace-array';

import { validatedAuthDbRoute } from '~api/middleware/request';
import { authMiddleware } from '~api/modules/auth';
import { selectPivotTable, PivotColumn, PivotTableRow } from '~api/queries';
import { ListCalcCategory, Page } from '~api/types';

const tables: ListCalcCategory[] = [Page.food, Page.general, Page.holiday, Page.social];

enum SortAlgorithm {
  similarity = 'similarity',
  total = 'total',
}

type Thing = { thing: string; years: number[]; total: number };

const sortBySimilarity = <I extends Thing>(items: I[]): I[] => {
  const reduction = items.reduce(
    ({
      last,
      remaining,
    }: {
      last: I[];
      remaining: I[];
    }): {
      last: I[];
      remaining: I[];
    } => {
      if (!remaining.length) {
        return { last, remaining };
      }

      const { thing } = last[last.length - 1];
      const closestRemaining = remaining.reduce(
        ({ distance, index }, { thing: compare }, nextIndex) => {
          const nextDistance = levenshtein.get(thing, compare);
          if (nextDistance > distance) {
            return { distance, index };
          }

          return { distance: nextDistance, index: nextIndex };
        },
        {
          distance: Infinity,
          index: -1,
        },
      );

      const nextRemaining = removeAtIndex(remaining, closestRemaining.index);
      const nextLast = [...last, remaining[closestRemaining.index]];

      return { last: nextLast, remaining: nextRemaining };
    },
    {
      last: items.slice(0, 1),
      remaining: items.slice(1),
    },
  );

  return reduction.last;
};

const sortByTotal = <I extends Thing>(items: I[]): I[] =>
  items.sort(({ total: totalA }, { total: totalB }) => totalB - totalA);

function withSort<I extends Thing>(algorithm: SortAlgorithm): (items: I[]) => I[] {
  if (algorithm === SortAlgorithm.similarity) {
    return sortBySimilarity;
  }

  return sortByTotal;
}

type Query = {
  table: ListCalcCategory;
  sort: SortAlgorithm;
  year: number;
  deep: boolean;
  csv: boolean;
};

const querySchema = joi.object({
  table: joi
    .string()
    .valid(...tables)
    .required(),
  sort: joi
    .string()
    .valid(...Object.values(SortAlgorithm))
    .default(SortAlgorithm.total),
  year: joi.number().integer().min(2000).default(0),
  deep: joi.bool().default(false).truthy(''),
  csv: joi.bool().default(false).truthy(''),
});

function getPivotColumn(table: ListCalcCategory, deep: boolean): PivotColumn {
  if (!deep) {
    return 'item';
  }
  if ([Page.food, Page.general].includes(table)) {
    return 'category';
  }
  if (table === Page.holiday) {
    return 'holiday';
  }
  if (table === Page.social) {
    return 'society';
  }
  return 'item';
}

const routeGet = validatedAuthDbRoute<void, void, Query>(
  { query: querySchema },
  async (db, _, res, __, ___, { table, year, deep, sort, csv }) => {
    const items = await selectPivotTable(db, table, getPivotColumn(table, deep), year);

    const maxYear = items.reduce<number>((last, row) => Math.max(last, row.year), 0);
    const minYear = items.reduce<number>((last, row) => Math.min(last, row.year), Infinity);

    const yearRange = Array(maxYear - minYear + 1)
      .fill(0)
      .map((____, index) => minYear + index);

    const sheet: Thing[] = compose(withSort(sort))(
      items
        .map<PivotTableRow>(({ cost, ...rest }) => ({
          ...rest,
          cost: Number(cost) / 100,
        }))
        .reduce<Omit<Thing, 'total'>[]>((last, row) => {
          if (last.length && row.thing === last[last.length - 1].thing) {
            return [
              ...last.slice(0, last.length - 1),
              {
                ...last[last.length - 1],
                years: replaceAtIndex(last[last.length - 1].years, row.year - minYear, row.cost),
              },
            ];
          }

          return [
            ...last,
            {
              thing: row.thing,
              years: replaceAtIndex(
                new Array(maxYear - minYear + 1).fill(0),
                row.year - minYear,
                row.cost,
              ),
            },
          ];
        }, [])
        .map<Thing>(({ thing, years }) => ({
          thing,
          years,
          total: years.reduce((last, cost) => last + cost, 0),
        })),
    );

    const header = [deep ? 'Item' : 'Category', ...yearRange, 'Total'];

    if (csv) {
      const csvRows = [
        header,
        ...sheet.map(({ thing, years, total }) => [`"${thing}"`, ...years, total]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      res.setHeader('Content-Type', 'application/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=budget-pivot-${table}${deep ? '-deep' : ''}.csv`,
      );
      res.setHeader('Pragma', 'no-cache');

      res.send(csvRows);
      return;
    }

    res.render('pivot-table', {
      header,
      sheet,
    });
  },
);

export function handler(): Router {
  const router = Router();
  router.get('/', authMiddleware(), routeGet);
  return router;
}
