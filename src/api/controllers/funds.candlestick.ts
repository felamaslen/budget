import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  getUnixTime,
} from 'date-fns';
import round from 'lodash/round';
import type { DatabaseTransactionConnectionType } from 'slonik';

import { getMaxAge } from './funds.utils';

import {
  ResolutionPeriod,
  selectCandlestickMaxAge,
  selectCandlestickRows,
} from '~api/queries/fund-candlestick';
import {
  FundHistoryCandlestick,
  FundHistoryCandlestickGroup,
  FundPeriod,
  QueryFundHistoryCandlestickArgs,
} from '~api/types';

const MAX_CANDLES = 50;

function getResolution(
  now: Date,
  minTime: Date,
): {
  num: number;
  period: ResolutionPeriod;
} {
  const numYears = differenceInYears(now, minTime);
  if (numYears < 2) {
    const period = 'day';
    const numDays = differenceInDays(now, minTime);
    const num = Math.max(1, Math.ceil(numDays / MAX_CANDLES));
    return { num, period };
  }
  if (numYears < 5) {
    const period = 'week';
    const numWeeks = differenceInWeeks(now, minTime);
    const num = Math.max(1, Math.ceil(numWeeks / MAX_CANDLES));
    return { num, period };
  }
  if (numYears < MAX_CANDLES) {
    const period = 'month';
    const numMonths = differenceInMonths(now, minTime);
    const num = Math.max(1, Math.ceil(numMonths / MAX_CANDLES));
    return { num, period };
  }
  const period = 'year';
  const num = Math.max(1, Math.ceil(numYears / MAX_CANDLES));
  return { num, period };
}

export async function readFundHistoryCandlestick(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryFundHistoryCandlestickArgs,
): Promise<FundHistoryCandlestick> {
  const periodArg = args.period ?? FundPeriod.Year;
  const length = args.length ?? 1;
  const now = new Date();

  const minPossibleTime = await selectCandlestickMaxAge(db, uid);
  if (!minPossibleTime) {
    return { candles: [], length, period: periodArg };
  }

  const minTime = getMaxAge(now, minPossibleTime, periodArg, length);
  const { num, period } = getResolution(now, minTime);

  const candles = await selectCandlestickRows(db, uid, minTime, num, period);

  return {
    candles: candles.map<FundHistoryCandlestickGroup>((row, index) => ({
      id: row.id,
      t0: getUnixTime(row.t0),
      t1: getUnixTime(row.t1),
      min: round(row.min, 2),
      max: round(row.max, 2),
      start: round(row.start, 2),
      end: round(index < candles.length - 1 ? candles[index + 1].start : row.end, 2),
    })),
    length,
    period: periodArg,
  };
}
