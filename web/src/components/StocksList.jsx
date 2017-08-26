/**
 * Display list of stocks which refresh themselves and
 * are based on the user's funds' top holdings
 */

import { List as list, Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PureControllerView from './PureControllerView';
import { GraphStocks } from './graphs/GraphStocks';
import { aStocksListRequested, aStocksPricesRequested } from '../actions/StocksListActions';
import { sigFigs } from '../misc/format';
import {
    STOCK_PRICES_DELAY, GRAPH_STOCKS_WIDTH, GRAPH_STOCKS_HEIGHT
} from '../misc/const';

const renderStock = (stock, key) => {
    const price = sigFigs(stock.get('gain'), 3) + '%';
    const name = stock.get('name');
    const title = `${stock.get('name')} (${stock.get('code')})`;

    const classes = classNames({
        up: stock.get('gain') > 0,
        down: stock.get('gain') < 0,
        'hl-up': stock.get('up'),
        'hl-down': stock.get('down')
    });
    return (
        <li key={key} className={classes} title={title}>
            <span className='name'>{name}</span>
            <span className='price'>{price}</span>
        </li>
    );
};

export class StocksList extends PureControllerView {
    componentWillMount() {
        this.dispatchNext(aStocksListRequested());
    }
    componentDidUpdate(prevProps) {
        if (prevProps.lastPriceUpdate !== this.props.lastPriceUpdate) {
            setTimeout(() => this.dispatchAction(aStocksPricesRequested()), STOCK_PRICES_DELAY);
        }
    }
    render() {
        const classes = classNames({
            'stocks-list': true,
            'graph-container': true, // for layout purposes
            loading: !this.props.loadedInitial
        });
        const overallClasses = classNames({
            up: this.props.weightedGain > 0,
            down: this.props.weightedGain < 0,
            'hl-up': this.props.weightedGain > this.props.oldWeightedGain,
            'hl-down': this.props.weightedGain < this.props.oldWeightedGain
        });

        return (
            <div className={classes}>
                <ul className='stocks-list-ul'>
                    {this.props.stocks.valueSeq().map(renderStock)}
                </ul>
                <div className='stocks-sidebar'>
                    <GraphStocks dispatcher={this.props.dispatcher}
                        name='graph-stocks'
                        width={GRAPH_STOCKS_WIDTH} height={GRAPH_STOCKS_HEIGHT}
                        data={this.props.history} />
                    <ul>
                        <li className={overallClasses}>
                            <span className='name'>Overall</span>
                            <span className='price'>{sigFigs(this.props.weightedGain, 3)}%</span>
                        </li>
                        {this.props.indices.valueSeq().map(renderStock)}
                    </ul>
                </div>
            </div>
        );
    }
}

StocksList.propTypes = {
    loadedInitial: PropTypes.bool,
    stocks: PropTypes.instanceOf(map),
    indices: PropTypes.instanceOf(map),
    lastPriceUpdate: PropTypes.number,
    history: PropTypes.instanceOf(list),
    weightedGain: PropTypes.number,
    oldWeightedGain: PropTypes.number
};

