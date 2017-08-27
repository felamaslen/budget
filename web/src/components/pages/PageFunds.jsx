/**
 * Funds page component
 */

import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PageList } from './PageList';
import { rgba } from '../../misc/color';
import { DO_STOCKS_LIST } from '../../misc/config';
import {
    PAGES, LIST_COLS_PAGES,
    GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_HEIGHT,
    GRAPH_FUND_ITEM_WIDTH_LARGE, GRAPH_FUND_ITEM_HEIGHT_LARGE,
    GRAPH_FUNDS_WIDTH, GRAPH_FUNDS_HEIGHT
} from '../../misc/const';
import { formatCurrency, formatPercent } from '../../misc/format';
import { GraphFundItem } from '../graphs/GraphFundItem';
import { GraphFunds } from '../graphs/GraphFunds';
import { StocksList } from '../StocksList';
import { aFundsGraphPeriodChanged } from '../../actions/GraphActions';

const transactionsKey = LIST_COLS_PAGES[PAGES.indexOf('funds')].indexOf('transactions');

export class PageFunds extends PageList {
    listItemClasses(row) {
        return {
            sold: row.getIn(['cols', transactionsKey]).isSold()
        };
    }
    listHeadExtra() {
        const cost = this.props.data.getIn(['data', 'total']);
        const value = this.props.cachedValue.get('value');
        const total = this.props.data.getIn(['data', 'total']);
        const gainPct = formatPercent((value - total) / total, {
            brackets: true, precision: 2
        });

        const classes = classNames({
            gain: true,
            profit: cost < value,
            loss: cost > value
        });

        return (
            <span className={classes} onClick={() => this.dispatchAction(aFundsGraphPeriodChanged(null, true))}>
                <span className='gain-info'>Current value:</span>
                <span>{formatCurrency(this.props.cachedValue.get('value'))}</span>
                <span>{gainPct}</span>
                <span className='gain-info'>({this.props.cachedValue.get('ageText')})</span>
            </span>
        );
    }
    renderListExtra(row, rowKey) {
        const name = row.getIn(['cols', 1]).toLowerCase().replace(/\W+/g, '-');
        const popout = row.get('historyPopout');
        const width = popout ? GRAPH_FUND_ITEM_WIDTH_LARGE : GRAPH_FUND_ITEM_WIDTH;
        const height = popout ? GRAPH_FUND_ITEM_HEIGHT_LARGE : GRAPH_FUND_ITEM_HEIGHT;

        const formatOptions = { brackets: true, abbreviate: true, precision: 1, noPence: true };
        const formatOptionsPct = { brackets: true, precision: 2 };

        const gain = row.get('gain');

        const gainStyle = {
            backgroundColor: rgba(gain.color)
        };
        const gainOuterClasses = classNames({
            text: true,
            profit: gain.gain >= 0,
            loss: gain.gain < 0
        });
        const gainClasses = classNames({
            gain: true,
            profit: gain.gain >= 0,
            loss: gain.gain < 0
        });
        const gainAbsClasses = classNames({
            'gain-abs': true,
            profit: gain.abs >= 0,
            loss: gain.abs < 0
        });
        const dayGainClasses = classNames({
            'day-gain': true,
            profit: gain.dayGain >= 0,
            loss: gain.dayGain < 0
        });
        const dayGainAbsClasses = classNames({
            'day-gain-abs': true,
            profit: gain.dayAbs >= 0,
            loss: gain.dayAbs < 0
        });

        return (
            <span>
                <span className='fund-graph'>
                    <div className='fund-graph-cont'>
                        <GraphFundItem dispatcher={this.props.dispatcher}
                            width={width}
                            height={height}
                            name={name}
                            data={row.get('history')}
                            popout={row.get('historyPopout')}
                            rowKey={rowKey}
                        />
                    </div>
                </span>
                <span className='gain'>
                    <span className={gainOuterClasses} style={gainStyle}>
                        <span className='value'>
                            {formatCurrency(gain.value, formatOptions)}
                        </span>
                        <span className={gainAbsClasses}>
                            {formatCurrency(gain.abs, formatOptions)}
                        </span>
                        <span className={dayGainAbsClasses}>
                            {formatCurrency(gain.dayAbs, formatOptions)}
                        </span>
                        <span className={gainClasses}>
                            {formatPercent(gain.gain, formatOptionsPct)}
                        </span>
                        <span className={dayGainClasses}>
                            {formatPercent(gain.dayGain, formatOptionsPct)}
                        </span>
                    </span>
                </span>
            </span>
        );
    }
    afterList() {
    // render graphs and stuff here
        const stocksList = DO_STOCKS_LIST ? (
            <StocksList dispatcher={this.props.dispatcher}
                stocks={this.props.stocksListProps.get('stocks')}
                indices={this.props.stocksListProps.get('indices')}
                lastPriceUpdate={this.props.stocksListProps.get('lastPriceUpdate')}
                history={this.props.stocksListProps.get('history')}
                weightedGain={this.props.stocksListProps.get('weightedGain')}
                oldWeightedGain={this.props.stocksListProps.get('oldWeightedGain')}
            />
        ) : null;

        return (
            <div className='graph-container-outer'>
                <GraphFunds dispatcher={this.props.dispatcher}
                    name='fund-history'
                    width={GRAPH_FUNDS_WIDTH} height={GRAPH_FUNDS_HEIGHT}
                    history={this.props.data.get('history')}
                    lines={this.props.data.get('lines')}
                    funds={this.props.data.get('rows')}
                    fundLines={this.props.data.get('fundLines')}
                    mode={this.props.graphProps.get('mode')}
                    period={this.props.graphProps.get('period')}
                    showOverall={this.props.graphProps.get('showOverall')}
                    zoom={this.props.graphProps.get('zoom')}
                    hlPoint={this.props.graphProps.get('hlPoint')}
                />
                {stocksList}
            </div>
        );
    }
}

PageFunds.propTypes = {
    graphProps: PropTypes.instanceOf(map),
    stocksListProps: PropTypes.instanceOf(map),
    cachedValue: PropTypes.instanceOf(map),
    showOverall: PropTypes.bool
};

