import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PricesWorker from 'worker-loader!../../workers/prices'; // eslint-disable-line import/no-unresolved

import { todayPricesFetched } from '~client/actions';
import { ApiContext } from '~client/hooks';
import { getGenericFullSymbol } from '~client/modules/finance';
import { isServerSide } from '~client/modules/ssr';
import { getFundsRows } from '~client/selectors';
import type { FundQuotes } from '~client/types';
import type { StockPricesQuery } from '~client/types/gql';

const worker = isServerSide ? undefined : new PricesWorker();

export function useTodayPrices(): void {
  const dispatch = useDispatch();
  const apiKey = useContext(ApiContext);

  const funds = useSelector(getFundsRows);

  const codes = useMemo<string[]>(
    () =>
      funds
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

  const [prices, setPrices] = useState<StockPricesQuery | undefined>();

  useEffect(() => {
    if (worker) {
      worker.onmessage = (event: MessageEvent<StockPricesQuery>): void => setPrices(event.data);
    }

    return (): void => {
      if (worker) {
        worker.onmessage = null;
      }
    };
  }, []);

  useEffect(() => {
    if (prices) {
      const quotes = funds.reduce<FundQuotes>((last, { id, item }) => {
        const price =
          prices.stockPrices?.prices.find(({ code }) => code === getGenericFullSymbol(item))
            ?.price ?? null;
        return price === null ? last : { ...last, [id]: price };
      }, {});
      dispatch(todayPricesFetched(quotes, prices.stockPrices?.refreshTime ?? null));
    }
  }, [dispatch, funds, prices]);
}
