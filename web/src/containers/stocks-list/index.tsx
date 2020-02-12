import { connect } from 'react-redux';
import React, { useRef, useState, useEffect } from 'react';

import { DO_STOCKS_LIST, STOCK_PRICES_DELAY } from '~client/constants/stocks';
import { State } from '~client/reducers';
import { GraphStocks } from '~client/containers/stocks-list/graph-stocks';
import { stocksListRequested, stockPricesRequested } from '~client/actions/stocks';
import { sigFigs } from '~client/modules/format';
import { Stock } from '~client/types/funds';
import { Data } from '~client/types/graph';

import * as Styled from './styles';

type StockListItemsProps = {
    stockMap: Stock[];
};

const StockListItems: React.FC<StockListItemsProps> = ({ stockMap }) => (
    <>
        {stockMap.map(({ code, name, price, gain, up, down }) => (
            <Styled.Item
                key={code}
                up={gain > 0}
                down={gain < 0}
                hlUp={up}
                hlDown={down}
                title={name}
            >
                <Styled.NameColumn>
                    <Styled.Code>{code}</Styled.Code>
                    <Styled.Title>{name}</Styled.Title>
                </Styled.NameColumn>
                <Styled.Price>{(price || 0).toFixed(2)}</Styled.Price>
                <Styled.Change>{sigFigs(gain, 3)}%</Styled.Change>
            </Styled.Item>
        ))}
    </>
);

type Props = {
    enabled?: boolean;
    loading: boolean;
    shares: Stock[];
    indices: Stock[];
    history: Data;
    lastPriceUpdate?: number;
    requestList: () => void;
    requestPrices: () => void;
};

const StocksList: React.FC<Props> = ({
    enabled = DO_STOCKS_LIST,
    shares,
    indices,
    history,
    lastPriceUpdate = 0,
    requestList,
    requestPrices,
}) => {
    useEffect(() => {
        if (enabled) {
            setImmediate(requestList);

            return requestList;
        }

        return (): null => null;
    }, [enabled, requestList]);

    const [prevLastPriceUpdate, setLastPriceUpdate] = useState(lastPriceUpdate);
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
        if (lastPriceUpdate !== prevLastPriceUpdate) {
            clearTimeout(timer.current);
            timer.current = setTimeout(requestPrices, STOCK_PRICES_DELAY);
            setLastPriceUpdate(lastPriceUpdate);
        }
    }, [lastPriceUpdate, prevLastPriceUpdate, requestPrices]);

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
        <Styled.List>
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

type DispatchProps = Pick<Props, 'requestList' | 'requestPrices'>;
type StateProps = Omit<Props, keyof DispatchProps>;

const mapStateToProps = (state: State): StateProps => ({
    loading: state.stocks.loading,
    shares: state.stocks.shares,
    indices: state.stocks.indices,
    history: state.stocks.history,
    lastPriceUpdate: state.stocks.lastPriceUpdate,
});

const mapDispatchToProps = {
    requestList: stocksListRequested,
    requestPrices: stockPricesRequested,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StocksList);
