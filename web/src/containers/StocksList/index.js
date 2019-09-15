import { connect } from 'react-redux';
import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DO_STOCKS_LIST, STOCK_PRICES_DELAY } from '~client/constants/stocks';

import { dataShape } from '~client/prop-types/graph';
import GraphStocks from '~client/containers/StocksList/GraphStocks';
import { stocksListRequested, stockPricesRequested } from '~client/actions/stocks';
import { sigFigs } from '~client/modules/format';

import './style.scss';

const stockShape = PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    weight: PropTypes.number,
    gain: PropTypes.number.isRequired,
    price: PropTypes.number,
    up: PropTypes.bool.isRequired,
    down: PropTypes.bool.isRequired,
});

const StockListItems = ({ stockMap }) => stockMap.map(({
    code, name, price, gain, up, down,
}) => (
    <li key={code}
        className={classNames({
            up: gain > 0, down: gain < 0, 'hl-up': up, 'hl-down': down,
        })}
        title={name}
    >
        <span className="name-column">
            <span className="code">{code}</span>
            <span className="title">{name}</span>
        </span>
        <span className="price">{(price || 0).toFixed(2)}</span>
        <span className="change">{sigFigs(gain, 3)}%</span>
    </li>
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

    const [oldWeightedGain, setOldWeightedGain] = useState(0);
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
        <div className={classNames('stocks-list', 'graph-container-outer', { loading })}>
            <div className="graph-container">
                <ul className="stocks-list-ul">
                    <StockListItems stockMap={shares} />
                </ul>
                <div className="stocks-sidebar">
                    <GraphStocks history={history} />
                    <ul>
                        <li className={classNames({
                            up: weightedGain > 0,
                            down: weightedGain < 0,
                            'hl-up': weightedGain > oldWeightedGain,
                            'hl-down': weightedGain < oldWeightedGain,
                        })}>
                            <span className="name-column">Overall</span>
                            <span className="change">{sigFigs(weightedGain, 3)}%</span>
                        </li>
                        <StockListItems stockMap={indices} />
                    </ul>
                </div>
            </div>
        </div>
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

const mapStateToProps = (state) => ({
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

export default connect(mapStateToProps, mapDispatchToProps)(StocksList);
