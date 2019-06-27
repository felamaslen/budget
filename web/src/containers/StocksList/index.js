/**
 * Display list of stocks which refresh themselves and
 * are based on the user's funds' top holdings
 */

import './style.scss';
import { connect } from 'react-redux';
import { DO_STOCKS_LIST, STOCK_PRICES_DELAY } from '~client/constants/stocks';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import GraphStocks from './GraphStocks';
import { aStocksListRequested, aStocksPricesRequested } from '~client/actions/stocks-list.actions';
import { sigFigs } from '~client/modules/format';

const stockShape = PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    weight: PropTypes.number,
    gain: PropTypes.number.isRequired,
    price: PropTypes.number,
    up: PropTypes.bool.isRequired,
    down: PropTypes.bool.isRequired
});

const StockListItems = ({ stockMap }) => Object.keys(stockMap).map(code => (
    <li key={code}
        className={classNames({
            up: stockMap[code].gain > 0,
            down: stockMap[code].gain < 0,
            'hl-up': stockMap[code].up,
            'hl-down': stockMap[code].down
        })}
        title={stockMap[code].name}
    >
        <span className="name-column">
            <span className="code">{code}</span>
            <span className="title">{stockMap[code].name}</span>
        </span>
        <span className="price">{(stockMap[code].price || 0).toFixed(2)}</span>
        <span className="change">{sigFigs(stockMap[code].gain, 3)}%</span>
    </li>
));

StockListItems.propTypes = {
    stockMap: PropTypes.objectOf(stockShape.isRequired).isRequired
};

function StocksList({
    enabled,
    loadedInitial,
    weightedGain,
    oldWeightedGain,
    stocks,
    indices,
    history,
    lastPriceUpdate,
    loadedList,
    requestStocksList,
    requestPrices
}) {

    useEffect(() => {
        requestStocksList();

        return requestStocksList;
    }, [requestStocksList]);

    const [listLoaded, setListLoaded] = useState(loadedList);
    const [prevLastPriceUpdate, setLastPriceUpdate] = useState(lastPriceUpdate);

    useEffect(() => {
        if (lastPriceUpdate !== prevLastPriceUpdate) {
            requestPrices();
            setLastPriceUpdate(lastPriceUpdate);
        } else if (loadedList && !listLoaded) {
            requestPrices(0);
            setListLoaded(true);
        }
    }, [lastPriceUpdate, listLoaded, loadedList, prevLastPriceUpdate, requestPrices]);

    if (!enabled) {
        return null;
    }

    return (
        <div className={classNames('stocks-list', 'graph-container-outer', { loading: !loadedInitial })}>
            <div className="graph-container">
                <ul className="stocks-list-ul">
                    <StockListItems stockMap={stocks} />
                </ul>
                <div className="stocks-sidebar">
                    <GraphStocks history={history} />
                    <ul>
                        <li className={classNames({
                            up: weightedGain > 0,
                            down: weightedGain < 0,
                            'hl-up': weightedGain > oldWeightedGain,
                            'hl-down': weightedGain < oldWeightedGain
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
    loadedList: PropTypes.bool.isRequired,
    loadedInitial: PropTypes.bool.isRequired,
    stocks: PropTypes.objectOf(stockShape.isRequired).isRequired,
    indices: PropTypes.objectOf(stockShape.isRequired).isRequired,
    history: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    lastPriceUpdate: PropTypes.number.isRequired,
    weightedGain: PropTypes.number.isRequired,
    oldWeightedGain: PropTypes.number.isRequired,
    requestStocksList: PropTypes.func.isRequired,
    requestPrices: PropTypes.func.isRequired
};

StocksList.defaultProps = {
    enabled: DO_STOCKS_LIST
};

const mapStateToProps = state => ({
    loadedList: state.other.stocksList.loadedList,
    loadedInitial: state.other.stocksList.loadedInitial,
    stocks: state.other.stocksList.stocks,
    indices: state.other.stocksList.indices,
    history: state.other.stocksList.history,
    lastPriceUpdate: state.other.stocksList.lastPriceUpdate,
    weightedGain: state.other.stocksList.weightedGain,
    oldWeightedGain: state.other.stocksList.oldWeightedGain
});

const mapDispatchToProps = dispatch => ({
    requestStocksList: () => setImmediate(() => dispatch(aStocksListRequested())),
    requestPrices: (delay = STOCK_PRICES_DELAY) =>
        setTimeout(() => dispatch(aStocksPricesRequested()), delay)
});

export default connect(mapStateToProps, mapDispatchToProps)(StocksList);
