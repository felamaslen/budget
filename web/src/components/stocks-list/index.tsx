import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { GraphStocks } from './graph-stocks';
import * as Styled from './styles';
import { stocksListRequested, stockPricesRequested } from '~client/actions';
import { DO_STOCKS_LIST, STOCK_PRICES_DELAY } from '~client/constants/stocks';
import { sigFigs } from '~client/modules/format';
import { State } from '~client/reducers';
import { Stock, Index } from '~client/types/funds';
import { Data } from '~client/types/graph';

type StockListItemsProps = {
  stockMap: Index[];
};

const StockListItems: React.FC<StockListItemsProps> = ({ stockMap }) => (
  <>
    {stockMap.map(({ code, name, price = 0, gain, up, down }) => (
      <Styled.Item key={code} up={gain > 0} down={gain < 0} hlUp={up} hlDown={down} title={name}>
        <Styled.NameColumn>
          <Styled.Code>{code}</Styled.Code>
          <Styled.Title>{name}</Styled.Title>
        </Styled.NameColumn>
        <Styled.Price>{(price ?? 0).toFixed(2)}</Styled.Price>
        <Styled.Change>{sigFigs(gain, 3)}%</Styled.Change>
      </Styled.Item>
    ))}
  </>
);

const getLoading = (state: State): boolean => state.stocks.loading;
const getShares = (state: State): Stock[] => state.stocks.shares;
const getIndices = (state: State): Index[] => state.stocks.indices;
const getHistory = (state: State): Data => state.stocks.history;
const getLastPriceUpdate = (state: State): number | null => state.stocks.lastPriceUpdate;

const StocksList: React.FC<{ enabled?: boolean }> = ({ enabled = DO_STOCKS_LIST }) => {
  const loading = useSelector(getLoading);
  const shares = useSelector(getShares);
  const indices = useSelector(getIndices);
  const history = useSelector(getHistory);
  const lastPriceUpdate = useSelector(getLastPriceUpdate);

  const dispatch = useDispatch();
  const requestList = useCallback((): void => {
    dispatch(stocksListRequested());
  }, [dispatch]);
  const requestPrices = useCallback((): void => {
    dispatch(stockPricesRequested());
  }, [dispatch]);

  useEffect(() => {
    if (enabled) {
      setImmediate(requestList);
      return requestList;
    }
    return (): null => null;
  }, [enabled, requestList]);

  const [prevLastPriceUpdate, setLastPriceUpdate] = useState<number>(lastPriceUpdate ?? 0);
  const timer = useRef<number>();

  const [, setOldWeightedGain] = useState(0);
  const [weightedGain, setWeightedGain] = useState(0);

  useEffect(() => {
    if (history.length) {
      setOldWeightedGain(weightedGain);
      setWeightedGain(history[history.length - 1][1]);
    }
  }, [history, weightedGain]);

  useEffect(() => {
    if (enabled && lastPriceUpdate !== prevLastPriceUpdate) {
      clearTimeout(timer.current);
      timer.current = setTimeout(requestPrices, STOCK_PRICES_DELAY);
      setLastPriceUpdate(lastPriceUpdate ?? 0);
    }
  }, [enabled, lastPriceUpdate, prevLastPriceUpdate, requestPrices]);

  useEffect(() => {
    if (enabled && (shares.length || indices.length)) {
      clearTimeout(timer.current);
      requestPrices();
    }
  }, [enabled, shares.length, indices.length, requestPrices]);

  if (!enabled) {
    return null;
  }

  return (
    <Styled.List isLoading={loading}>
      <Styled.StocksGraph>
        <Styled.ListUl>
          <StockListItems stockMap={shares} />
        </Styled.ListUl>
        <Styled.Sidebar>
          <GraphStocks history={history} />
          <Styled.SidebarList>
            <li>
              <Styled.NameColumn>Overall</Styled.NameColumn>
              <Styled.Text>{sigFigs(weightedGain, 3)}%</Styled.Text>
            </li>
            <StockListItems stockMap={indices} />
          </Styled.SidebarList>
        </Styled.Sidebar>
      </Styled.StocksGraph>
    </Styled.List>
  );
};

export default StocksList;
