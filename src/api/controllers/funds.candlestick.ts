import { addMonths, addWeeks, differenceInYears, getUnixTime } from 'date-fns';
import round from 'lodash/round';
import type { DatabaseTransactionConnectionType } from 'slonik';

import { getMaxAge } from './funds.utils';

import { selectCandlestickMaxAge, selectCandlestickRows } from '~api/queries/fund-candlestick';
import {
  FundHistoryCandlestick,
  FundHistoryCandlestickGroup,
  FundPeriod,
  QueryFundHistoryCandlestickArgs,
} from '~api/types';

function getResolution(
  now: Date,
  minTime: Date,
): { addPeriod: (date: Date, num: number) => Date; num: number; period: string } {
  const numYears = differenceInYears(now, minTime);
  if (numYears >= 5) {
    return { addPeriod: addMonths, num: numYears >= 10 ? 3 : 1, period: 'month' };
  }
  if (numYears >= 2) {
    return { addPeriod: addWeeks, num: 2, period: 'week' };
  }
  return { addPeriod: addWeeks, num: 1, period: 'week' };
}

export async function readFundHistoryCandlestick(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryFundHistoryCandlestickArgs,
): Promise<FundHistoryCandlestick> {
  const period = args.period ?? FundPeriod.Year;
  const length = args.length ?? 1;
  const now = new Date();

  const minPossibleTime = await selectCandlestickMaxAge(db, uid);
  if (!minPossibleTime) {
    return { candles: [], length, period };
  }

  const minTime = getMaxAge(now, minPossibleTime, period, length);
  const resolution = getResolution(now, minTime);

  const candles = await selectCandlestickRows(
    db,
    uid,
    minTime,
    now,
    resolution.num,
    resolution.period,
  );

  return {
    candles: candles.map<FundHistoryCandlestickGroup>((row) => ({
      id: row.idx,
      t0: getUnixTime(row.t0),
      t1: getUnixTime(row.t1),
      min: round(row.min, 2),
      max: round(row.max, 2),
      start: round(row.start, 2),
      end: round(row.end, 2),
    })),
    length,
    period,
  };
}
