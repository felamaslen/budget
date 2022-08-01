import { differenceInYears, getUnixTime } from 'date-fns';
import type { DatabaseTransactionConnectionType } from 'slonik';

import { getMaxAge } from './funds.utils';

import { CandleStickRow, selectCandlestickRows } from '~api/queries/fund-candlestick';
import {
  FundHistoryCandle,
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

function getCandles(rows: readonly CandleStickRow[]): FundHistoryCandlestickGroup[] {
  return rows.reduce<FundHistoryCandlestickGroup[]>((prev, row, index) => {
    const item: FundHistoryCandle = {
      id: row.fund_id,
      min: row.lo,
      max: row.hi,
      start: row.p0,
      end: row.p1,
    };

    if (index > 0 && row.id === rows[index - 1].id) {
      return [
        ...prev.slice(0, prev.length - 1),
        {
          ...prev[prev.length - 1],
          items: [...prev[prev.length - 1].items, item],
        },
      ];
    }

    return [
      ...prev,
      {
        t0: getUnixTime(row.t0),
        t1: getUnixTime(row.t1),
        items: [item],
      },
    ];
  }, []);
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

  const candlestickRows = await selectCandlestickRows(
    db,
    uid,
    minTime,
    now,
    resolution.num,
    resolution.period,
  );

  const candles = getCandles(candlestickRows);

  return {
    candles,
    length,
    period,
  };
}
