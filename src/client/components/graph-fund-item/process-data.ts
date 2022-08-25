import fromUnixTime from 'date-fns/fromUnixTime';
import isAfter from 'date-fns/isAfter';

import { getUnitRebase } from '~client/modules/data';
import type { Point, StockSplitNative } from '~client/types';

type DatedPrice = { date: number; price: number };
type DatedPriceSplitAdj = { date: number; priceSplitAdj: number };

const isSplitAdj = (points: DatedPrice[] | DatedPriceSplitAdj[]): points is DatedPriceSplitAdj[] =>
  !points.length || Reflect.has(points[0], 'priceSplitAdj');

export type ProfitPoint = { costBasis: number; point: Point; profit: boolean | null };

export type TransactionsSplitAdj = { date: Date; price: number; units: number }[];

export function processPoints(
  stockSplits: StockSplitNative[],
  transactions: TransactionsSplitAdj,
  data: DatedPrice[] | DatedPriceSplitAdj[],
): ProfitPoint[] {
  const dataSplitAdj = isSplitAdj(data)
    ? data
    : data.map<DatedPriceSplitAdj>(({ date, price }) => {
        const unitRebase = getUnitRebase(stockSplits, fromUnixTime(date));
        const priceSplitAdj = price / unitRebase;
        return { date, priceSplitAdj };
      });

  return dataSplitAdj.map<ProfitPoint>(({ date, priceSplitAdj }) => {
    const dateObj = fromUnixTime(date);

    const transactionsToDate = transactions.filter(
      (transaction) => !isAfter(transaction.date, dateObj),
    );

    const totalUnits = transactionsToDate.reduce<number>(
      (prev, transaction) => prev + transaction.units,
      0,
    );

    const averagePrice =
      totalUnits > 0
        ? transactionsToDate.reduce<number>(
            (prev, transaction) => prev + transaction.price * transaction.units,
            0,
          ) / totalUnits
        : 0;

    return {
      costBasis: averagePrice,
      point: [date, priceSplitAdj],
      profit: transactionsToDate.length > 0 ? priceSplitAdj >= averagePrice : null,
    };
  });
}
