import { differenceInYears, getUnixTime } from 'date-fns';
import round from 'lodash/round';
import type { DatabaseTransactionConnectionType } from 'slonik';

import { getMaxAge } from './funds.utils';

import { selectCandlestickRows } from '~api/queries/fund-candlestick';
import {
  FundHistoryCandlestick,
  FundHistoryCandlestickGroup,
  FundPeriod,
  QueryFundHistoryCandlestickArgs,
} from '~api/types';

function getResolution(now: Date, minTime: Date): { num: number; period: string } {
  const numYears = differenceInYears(now, minTime);
  if (numYears >= 3) {
    return { num: 1, period: 'month' };
  }
  return { num: 1, period: 'week' };
}

export async function readFundHistoryCandlestick(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryFundHistoryCandlestickArgs,
): Promise<FundHistoryCandlestick> {
  const period = args.period ?? FundPeriod.Year;
  const length = args.length ?? 1;
  const now = new Date();

  const minTime = getMaxAge(now, period, length);
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
      ...row,
      t0: getUnixTime(row.t0),
      t1: getUnixTime(row.t1),
      max: round(row.max, 2),
      min: round(row.min, 2),
      start: round(row.start, 2),
      end: round(row.end, 2),
    })),
    length,
    period,
  };
}
