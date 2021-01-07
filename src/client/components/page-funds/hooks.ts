import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { todayPricesFetched } from '~client/actions';
import { useStockPricesQuery } from '~client/hooks/gql';
import { getGenericFullSymbol } from '~client/modules/finance';
import { getFundsRows } from '~client/selectors';
import type { FundQuotes } from '~client/types';

const fetchIntervalMs = 30000;

export function useTodayPrices(): void {
  const dispatch = useDispatch();

  const funds = useSelector(getFundsRows);
  const timer = useRef<number>(0);

  const codes = useMemo<string[]>(
    () =>
      funds
        .map(({ item }) => getGenericFullSymbol(item))
        .filter((code: string | null): code is string => code !== null),
    [funds],
  );

  const [{ data: prices, fetching, stale }, fetchPrices] = useStockPricesQuery({
    variables: { codes },
    pause: true,
  });

  const hasCodes = codes.length > 0;

  useEffect(() => {
    if (prices && !fetching && !stale) {
      const quotes = funds.reduce<FundQuotes>((last, { id, item }) => {
        const price =
          prices.stockPrices?.prices.find(({ code }) => code === getGenericFullSymbol(item))
            ?.price ?? null;
        return price === null ? last : { ...last, [id]: price };
      }, {});
      dispatch(todayPricesFetched(quotes));
    }
  }, [dispatch, funds, prices, fetching, stale]);

  useEffect(() => {
    if (hasCodes) {
      fetchPrices();
      timer.current = setInterval(fetchPrices, fetchIntervalMs);
    }
    return (): void => clearInterval(timer.current);
  }, [hasCodes, fetchPrices]);
}
