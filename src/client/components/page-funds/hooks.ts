import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PricesWorker from 'worker-loader!../../workers/prices'; // eslint-disable-line import/no-unresolved

import { todayPricesFetched } from '~client/actions';
import type { SelectOptions } from '~client/components/form-field';
import { highlightTimeMs } from '~client/components/fund-gain-info/styles';
import { ApiContext, useUpdateEffect } from '~client/hooks';
import { isSold } from '~client/modules/data';
import { getGenericFullSymbol } from '~client/modules/finance';
import { isServerSide } from '~client/modules/ssr';
import { getAppConfig, getFundsRows, getTodayPriceTime } from '~client/selectors';
import type { FundQuotes } from '~client/types';
import { FundMode } from '~client/types/enum';
import { useStockPricesQuery } from '~client/types/gql';

const worker = isServerSide ? undefined : new PricesWorker();

export const minFetchIntervalMs = 1000 * 5;

export function useTodayPrices(): Date {
  const dispatch = useDispatch();
  const { realTimePrices } = useSelector(getAppConfig);
  const todayPriceTime = useSelector(getTodayPriceTime);
  const [lastScraped, setLastScraped] = useState<Date>(new Date());
  useEffect(() => {
    setLastScraped(new Date());
  }, [todayPriceTime]);
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

  const lastFetchTime = useRef<number>(0);
  const fetchIfNecessary = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchTime.current > minFetchIntervalMs) {
      fetchPrices();
      lastFetchTime.current = now;
    }
  }, [fetchPrices]);

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

  return lastScraped;
}

type Highlight = {
  value: -1 | 1 | 0;
  comparePrice: number;
};

function getHighlight(comparePrice: number, newPrice: number): Highlight['value'] {
  if (!(comparePrice && newPrice) || comparePrice === newPrice) {
    return 0;
  }
  return newPrice > comparePrice ? 1 : -1;
}

export function usePriceChangeHighlight(
  latestPrice: number,
  initialPrice?: number,
): Highlight['value'] {
  const [highlight, setHighlight] = useState<Highlight>({
    value: 0,
    comparePrice: initialPrice ?? latestPrice,
  });
  const timer = useRef<number>(0);

  useEffect(() => {
    if (typeof initialPrice !== 'undefined') {
      setHighlight((last) => ({ ...last, comparePrice: initialPrice }));
    }
  }, [initialPrice]);

  useUpdateEffect(() => {
    setHighlight((last) => ({
      value: getHighlight(last.comparePrice, latestPrice),
      comparePrice: latestPrice,
    }));

    timer.current = window.setTimeout(() => {
      setHighlight((last) => ({ ...last, value: 0 }));
    }, highlightTimeMs + 100);

    return (): void => {
      clearTimeout(timer.current);
    };
  }, [latestPrice]);

  return highlight.value;
}

const modeListDesktop = Object.values(FundMode);
const modeListMobile = [FundMode.Roi, FundMode.Value];

export function useFundModeList(isMobile: boolean): FundMode[] {
  return isMobile ? modeListMobile : modeListDesktop;
}

const fundModeText: Partial<Record<FundMode, string>> = {
  [FundMode.Stacked]: 'Value (stacked)',
  [FundMode.PriceNormalised]: 'Price (normalised)',
};

export function useFundModeSelectOptions(isMobile: boolean): SelectOptions<FundMode> {
  const modeList = useFundModeList(isMobile);
  return useMemo<SelectOptions<FundMode>>(
    () => modeList.map((internal) => ({ internal, external: fundModeText[internal] })),
    [modeList],
  );
}
