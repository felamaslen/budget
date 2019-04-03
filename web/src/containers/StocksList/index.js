/**
 * Display list of stocks which refresh themselves and
 * are based on the user's funds' top holdings
 */

import './style.scss';
import { List as list, Map as map } from 'immutable';
import { connect } from 'react-redux';
import { DO_STOCKS_LIST, STOCK_PRICES_DELAY } from '~client/constants/stocks';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import GraphStocks from './GraphStocks';
import { aStocksListRequested, aStocksPricesRequested } from '~client/actions/stocks-list.actions';
import { sigFigs } from '~client/modules/format';

function StockListItems({ stockMap }) {
    return stockMap
        .valueSeq()
        .map(stock => {
            const code = stock.get('code');
            const title = stock.get('name');
            const price = stock.get('price')
                ? stock.get('price').toFixed(2)
                : '0.00';

            const change = `${sigFigs(stock.get('gain'), 3)}%`;

            const classes = classNames({
                up: stock.get('gain') > 0,
                down: stock.get('gain') < 0,
                'hl-up': stock.get('up'),
                'hl-down': stock.get('down')
            });

            return (
                <li key={stock.get('code')} className={classes} title={title}>
                    <span className="name-column">
                        <span className="code">{code}</span>
                        <span className="title">{title}</span>
                    </span>
                    <span className="price">{price}</span>
                    <span className="change">{change}</span>
                </li>
            );
        });
}

StockListItems.propTypes = {
    stockMap: PropTypes.instanceOf(map).isRequired
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
    }, []);

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
    }, [lastPriceUpdate, listLoaded]);

    if (!enabled) {
        return null;
    }

    const classes = classNames('stocks-list', 'graph-container-outer', {
        loading: !loadedInitial
    });
    const overallClasses = classNames({
        up: weightedGain > 0,
        down: weightedGain < 0,
        'hl-up': weightedGain > oldWeightedGain,
        'hl-down': weightedGain < oldWeightedGain
    });

    return (
        <div className={classes}>
            <div className="graph-container">
                <ul className="stocks-list-ul">
                    <StockListItems stockMap={stocks} />
                </ul>
                <div className="stocks-sidebar">
                    <GraphStocks history={history} />
                    <ul>
                        <li className={overallClasses}>
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
    stocks: PropTypes.instanceOf(map).isRequired,
    indices: PropTypes.instanceOf(map).isRequired,
    history: PropTypes.instanceOf(list).isRequired,
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
    loadedList: state.getIn(['other', 'stocksList', 'loadedList']),
    loadedInitial: state.getIn(['other', 'stocksList', 'loadedInitial']),
    stocks: state.getIn(['other', 'stocksList', 'stocks']),
    indices: state.getIn(['other', 'stocksList', 'indices']),
    history: state.getIn(['other', 'stocksList', 'history']),
    lastPriceUpdate: state.getIn(['other', 'stocksList', 'lastPriceUpdate']),
    weightedGain: state.getIn(['other', 'stocksList', 'weightedGain']),
    oldWeightedGain: state.getIn(['other', 'stocksList', 'oldWeightedGain'])
});

const mapDispatchToProps = dispatch => ({
    requestStocksList: () => setImmediate(() => dispatch(aStocksListRequested())),
    requestPrices: (delay = STOCK_PRICES_DELAY) =>
        setTimeout(() => dispatch(aStocksPricesRequested()), delay)
});

export default connect(mapStateToProps, mapDispatchToProps)(StocksList);

