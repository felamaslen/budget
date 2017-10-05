/**
 * Display list of stocks which refresh themselves and
 * are based on the user's funds' top holdings
 */

import { Map as map } from 'immutable';
import { connect } from 'react-redux';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import GraphStocks from './graphs/GraphStocks';
import { aStocksListRequested, aStocksPricesRequested } from '../actions/StocksListActions';
import { sigFigs } from '../misc/format';
import { STOCK_PRICES_DELAY } from '../misc/config';

export class StocksList extends Component {
    componentWillMount() {
        this.props.requestStocksList();
    }
    componentWillUnmount() {
        this.props.requestStocksList();
    }
    componentDidUpdate(prevProps) {
        const priceDidUpdate = prevProps.lastPriceUpdate !== this.props.lastPriceUpdate;
        const listDidLoad = !prevProps.loadedList && this.props.loadedList;

        if (priceDidUpdate) {
            this.props.requestPrices();
        }
        else if (listDidLoad) {
            this.props.requestPrices(0);
        }
    }
    renderStocksList(stockMap) {
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

                return <li key={stock.get('code')} className={classes} title={title}>
                    <span className="name-column">
                        <span className="code">{code}</span>
                        <span className="title">{title}</span>
                    </span>
                    <span className="price">{price}</span>
                    <span className="change">{change}</span>
                </li>;
            });
    }
    render() {
        const classes = classNames({
            'stocks-list': true,
            'graph-container-outer': true,
            loading: !this.props.loadedInitial
        });
        const overallClasses = classNames({
            up: this.props.weightedGain > 0,
            down: this.props.weightedGain < 0,
            'hl-up': this.props.weightedGain > this.props.oldWeightedGain,
            'hl-down': this.props.weightedGain < this.props.oldWeightedGain
        });

        const stocksList = this.renderStocksList(this.props.stocks);
        const indicesList = this.renderStocksList(this.props.indices);

        return <div className={classes}>
            <div className="graph-container">
                <ul className="stocks-list-ul">{stocksList}</ul>
                <div className="stocks-sidebar">
                    <GraphStocks name="graph-stocks" />
                    <ul>
                        <li className={overallClasses}>
                            <span className="name-column">Overall</span>
                            <span className="change">{sigFigs(this.props.weightedGain, 3)}%</span>
                        </li>
                        {indicesList}
                    </ul>
                </div>
            </div>
        </div>;
    }
}

StocksList.propTypes = {
    loadedList: PropTypes.bool.isRequired,
    loadedInitial: PropTypes.bool.isRequired,
    stocks: PropTypes.instanceOf(map).isRequired,
    indices: PropTypes.instanceOf(map).isRequired,
    lastPriceUpdate: PropTypes.number.isRequired,
    weightedGain: PropTypes.number.isRequired,
    oldWeightedGain: PropTypes.number.isRequired,
    requestStocksList: PropTypes.func.isRequired,
    requestPrices: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    loadedList: state.getIn(['global', 'other', 'stocksList', 'loadedList']),
    loadedInitial: state.getIn(['global', 'other', 'stocksList', 'loadedInitial']),
    stocks: state.getIn(['global', 'other', 'stocksList', 'stocks']),
    indices: state.getIn(['global', 'other', 'stocksList', 'indices']),
    lastPriceUpdate: state.getIn(['global', 'other', 'stocksList', 'lastPriceUpdate']),
    weightedGain: state.getIn(['global', 'other', 'stocksList', 'weightedGain']),
    oldWeightedGain: state.getIn(['global', 'other', 'stocksList', 'oldWeightedGain'])
});

const mapDispatchToProps = dispatch => ({
    requestStocksList: () => setTimeout(() => dispatch(aStocksListRequested()), 0),
    requestPrices: (delay = STOCK_PRICES_DELAY) => setTimeout(
        () => dispatch(aStocksPricesRequested()), delay
    )
});

export default connect(mapStateToProps, mapDispatchToProps)(StocksList);

