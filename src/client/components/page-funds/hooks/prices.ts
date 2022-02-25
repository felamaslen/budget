import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PricesWorker from 'worker-loader!../../../workers/prices'; // eslint-disable-line import/no-unresolved

import { todayPricesFetched } from '~client/actions';
import { ApiContext } from '~client/hooks';
import { isSold } from '~client/modules/data';
import { isServerSide } from '~client/modules/ssr';
import { getAppConfig, getFundsRows, getTodayPriceTime } from '~client/selectors';
import type { FundQuotes } from '~client/types';
import { useStockPricesQuery } from '~client/types/gql';
import { getGenericFullSymbol } from '~shared/abbreviation';

export const worker =
  isServerSide && process.env.NODE_ENV !== 'test' ? undefined : new PricesWorker();

const fetchIntervalMs = (5 * 60 + 3) * 1000;
const minTimeBetweenFetchMs = 30 * 1000;

export function useTodayPrices(): void {
  const dispatch = useDispatch();
  const { realTimePrices } = useSelector(getAppConfig);
  const todayPriceTime = useSelector(getTodayPriceTime);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const paused = !realTimePrices;

  const apiKey = useContext(ApiContext);
  const funds = useSelector(getFundsRows);

  const codes = useMemo<string[]>(
    () =>
      funds
        .filter(({ transactions }) => !isSold(transactions))
        .map(({ item }) => getGenericFullSymbol(item))
        .filter((code: string | null): code is string => code !== null),
    [funds],
  );

  useEffect(() => {
    worker?.postMessage({ type: 'start', payload: { apiKey, codes } });
    return (): void => {
      worker?.postMessage({ type: 'stop' });
    };
  }, [apiKey, codes]);

  const [{ data: prices }, fetchPrices] = useStockPricesQuery({
    variables: { codes },
    pause: true,
    requestPolicy: 'network-only',
  });

  const fetchIfNecessary = useCallback(() => {
    const now = Date.now();
    if (
      now - (todayPriceTime?.getTime() ?? 0) >= fetchIntervalMs &&
      now - lastFetchTime >= minTimeBetweenFetchMs
    ) {
      fetchPrices();
      setLastFetchTime(now);
    }
  }, [fetchPrices, todayPriceTime, lastFetchTime]);

  const haveCodes = codes.length > 0;
  useEffect(() => {
    if (worker) {
      worker.onmessage = (): void => {
        if (!paused && haveCodes) {
          fetchIfNecessary();
        }
      };
    }

    return (): void => {
      if (worker) {
        worker.onmessage = null;
      }
    };
  }, [fetchIfNecessary, paused, haveCodes]);

  useEffect(() => {
    if (prices && !paused) {
      const quotes = funds.reduce<FundQuotes>((last, { id, item }) => {
        const price =
          prices.stockPrices?.prices.find(({ code }) => code === getGenericFullSymbol(item))
            ?.price ?? null;
        return price === null ? last : { ...last, [id]: price };
      }, {});
      dispatch(todayPricesFetched(quotes, prices.stockPrices?.refreshTime ?? null));
    }
  }, [dispatch, paused, funds, prices]);

  useEffect(() => {
    if (paused) {
      dispatch(todayPricesFetched({}, null));
    } else {
      fetchIfNecessary();
    }
  }, [dispatch, paused, fetchIfNecessary]);
}
