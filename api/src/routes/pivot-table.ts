import * as boom from '@hapi/boom';
import { compose } from '@typed/compose';
import { Request, Response } from 'express';
import levenshtein from 'fast-levenshtein';
import { QueryBuilder } from 'knex';
import { replaceAtIndex, removeAtIndex } from 'replace-array';

import db from '~api/modules/db';

const tables = ['food', 'general', 'holiday', 'social'];

const withYear = (year: number | null): ((qb: QueryBuilder) => QueryBuilder) =>
  year ? (qb): QueryBuilder => qb.where('L.year', year) : (qb): QueryBuilder => qb;

type SortAlgorithm = 'similarity';

type Thing = { thing: string; years: number[]; total: number };
type DbThing = Pick<Thing, 'thing'> & { year: number; cost: number };

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

function withSort<I extends Thing>(algorithm?: SortAlgorithm): (items: I[]) => I[] {
  if (algorithm === 'similarity') {
    return sortBySimilarity;
  }

  return sortByTotal;
}

type Query = { table: string; sort?: SortAlgorithm; year?: string; deep?: 'true'; csv?: 'true' };

const getPivotTable = async (req: Request, res: Response): Promise<void> => {
  if (!tables.includes((req.query as Query).table)) {
    throw boom.badRequest(`Must provide table; valid values are (${tables.join(', ')})`);
  }

  const { table, year, deep, sort } = req.query as Query;

  const fixedYear = req.query.year && /^20([0-9]{2})$/.test(year ?? '') ? Number(year) : null;

  const items = await withYear(fixedYear)(
    db
      .select<DbThing>('L.thing', 'L.year', db.raw('sum(cost) as cost'))
      .from(
        (qb: QueryBuilder): QueryBuilder =>
          qb
            .select<{
              thing: string;
              year: number;
              cost: number;
            }>(
              `${deep ? 'item' : 'category'} as thing`,
              db.raw("date_part('year', date) as year"),
              'cost',
            )
            .from(table)
            .as('L'),
      )
      .groupBy('L.thing', 'L.year')
      .orderBy('L.thing', 'L.year'),
  );

  const maxYear =
    fixedYear ||
    items.reduce((last: number, item: { year: number }) => Math.max(last, item.year), 0);
  const minYear =
    fixedYear ||
    items.reduce((last: number, item: { year: number }) => Math.min(last, item.year), Infinity);

  const yearRange = new Array(maxYear - minYear + 1).fill(0).map((_, index) => minYear + index);

  const sheet: Thing[] = compose(withSort(sort))(
    items
      .map(
        ({ cost, ...rest }: DbThing): DbThing => ({
          ...rest,
          cost: Number(cost) / 100,
        }),
      )
      .reduce((last: { thing: string; years: number[] }[], row: DbThing) => {
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
      .map(
        ({ thing, years }: { thing: string; years: number[] }): Thing => ({
          thing,
          years,
          total: years.reduce((last, cost) => last + cost, 0),
        }),
      ),
  );

  const header = [deep ? 'Item' : 'Category', ...yearRange, 'Total'];

  if (req.query.csv) {
    const csv = [header, ...sheet.map(({ thing, years, total }) => [`"${thing}"`, ...years, total])]
      .map(row => row.join(','))
      .join('\n');

    res.setHeader('Content-Type', 'application/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=budget-pivot-${table}${deep ? '-deep' : ''}.csv`,
    );
    res.setHeader('Pragma', 'no-cache');

    res.send(csv);
    return;
  }

  res.render('pivot-table', {
    header,
    sheet,
  });
};

export default getPivotTable;
