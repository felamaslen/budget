import { connect } from 'react-redux';
import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DO_STOCKS_LIST, STOCK_PRICES_DELAY } from '~client/constants/stocks';

import { dataShape } from '~client/prop-types/graph';
import GraphStocks from '~client/containers/StocksList/GraphStocks';
import {
    stocksListRequested,
    stockPricesRequested,
} from '~client/actions/stocks';
import { sigFigs } from '~client/modules/format';

import * as Styled from './styles';

const stockShape = PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    weight: PropTypes.number,
    gain: PropTypes.number.isRequired,
    price: PropTypes.number,
    up: PropTypes.bool.isRequired,
    down: PropTypes.bool.isRequired,
});

const StockListItems = ({ stockMap }) =>
    stockMap.map(({ code, name, price, gain, up, down }) => (
        <Styled.Item
            key={code}
            up={gain > 0}
            down={gain < 0}
            hlUp={up}
            hlDown={down}
            className={classNames({
                up: gain > 0,
                down: gain < 0,
                'hl-up': up,
                'hl-down': down,
            })}
            title={name}
        >
            <Styled.NameColumn>
                <Styled.Code>{code}</Styled.Code>
                <Styled.Title>{name}</Styled.Title>
            </Styled.NameColumn>
            <Styled.Price>{(price || 0).toFixed(2)}</Styled.Price>
            <Styled.Change>{sigFigs(gain, 3)}%</Styled.Change>
        </Styled.Item>
    ));

StockListItems.propTypes = {
    stockMap: PropTypes.arrayOf(stockShape.isRequired).isRequired,
};

function StocksList({
    enabled,
    loading,
    shares,
    indices,
    history,
    lastPriceUpdate,
    requestList,
    requestPrices,
}) {
    useEffect(() => {
        if (enabled) {
            setImmediate(requestList);

            return requestList;
        }

        return () => null;
    }, [enabled, requestList]);

    const [prevLastPriceUpdate, setLastPriceUpdate] = useState(lastPriceUpdate);
    const timer = useRef(null);

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
        <Styled.List
            className={classNames('graph-container-outer', { loading })}
        >
            <Styled.StocksGraph>
                <Styled.ListUl>
                    <StockListItems stockMap={shares} />
                </Styled.ListUl>
                <Styled.Sidebar>
                    <GraphStocks history={history} />
                    <Styled.SidebarList>
                        <li>
                            <Styled.NameColumn>Overall</Styled.NameColumn>
                            <Styled.Text className="change">
                                {sigFigs(weightedGain, 3)}%
                            </Styled.Text>
                        </li>
                        <StockListItems stockMap={indices} />
                    </Styled.SidebarList>
                </Styled.Sidebar>
            </Styled.StocksGraph>
        </Styled.List>
    );
}

StocksList.propTypes = {
    enabled: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    shares: PropTypes.arrayOf(stockShape.isRequired).isRequired,
    indices: PropTypes.arrayOf(stockShape.isRequired).isRequired,
    history: dataShape.isRequired,
    lastPriceUpdate: PropTypes.number,
    requestList: PropTypes.func.isRequired,
    requestPrices: PropTypes.func.isRequired,
};

StocksList.defaultProps = {
    lastPriceUpdate: 0,
    enabled: DO_STOCKS_LIST,
};

const mapStateToProps = state => ({
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
