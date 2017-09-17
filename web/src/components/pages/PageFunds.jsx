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
import Media from 'react-media';
import {
    mediaQueries, PAGES, LIST_COLS_PAGES,
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
    getGainInfo() {
        const cost = this.props.data.getIn(['data', 'total']);
        const value = this.props.cachedValue.get('value');
        const total = this.props.data.getIn(['data', 'total']);

        const gain = total
            ? (value - total) / total
            : 0;

        const gainPct = formatPercent(gain, {
            brackets: true, precision: 2
        });

        const classes = classNames({
            gain: true,
            profit: cost < value,
            loss: cost > value
        });

        return { classes, gainPct };
    }
    listHeadExtra() {
        const reloadFundPrices = () => this.dispatchAction(aFundsGraphPeriodChanged(null, true, true));

        const gainInfo = this.getGainInfo();

        return (
            <span className={gainInfo.classes} onClick={reloadFundPrices}>
                <span className="gain-info">Current value:</span>
                <span>{formatCurrency(this.props.cachedValue.get('value'))}</span>
                <span>{gainInfo.gainPct}</span>
                <span className="gain-info">({this.props.cachedValue.get('ageText')})</span>
            </span>
        );
    }
    renderFundGraph(row, rowKey) {
        const popout = row.get('historyPopout');

        const width = popout
            ? GRAPH_FUND_ITEM_WIDTH_LARGE
            : GRAPH_FUND_ITEM_WIDTH;
        const height = popout
            ? GRAPH_FUND_ITEM_HEIGHT_LARGE
            : GRAPH_FUND_ITEM_HEIGHT;

        const name = row.getIn(['cols', 1])
            .toLowerCase()
            .replace(/\W+/g, '-');

        return (
            <span className="fund-graph">
                <div className="fund-graph-cont">
                    <GraphFundItem dispatcher={this.props.dispatcher}
                        width={width}
                        height={height}
                        name={name}
                        data={row.get('prices')}
                        popout={row.get('historyPopout')}
                        rowKey={rowKey}
                    />
                </div>
            </span>
        );
    }
    renderGainInfo(row) {
        const gain = row.get('gain');

        if (!gain) {
            return null;
        }

        const formatOptions = { brackets: true, abbreviate: true, precision: 1, noPence: true };
        const formatOptionsPct = { brackets: true, precision: 2 };

        const gainStyle = {
            backgroundColor: rgba(gain.get('color'))
        };
        const gainOuterClasses = classNames({
            text: true,
            profit: gain.get('gain') >= 0,
            loss: gain.get('gain') < 0
        });
        const gainClasses = classNames({
            gain: true,
            profit: gain.get('gain') >= 0,
            loss: gain.get('gain') < 0
        });
        const gainAbsClasses = classNames({
            'gain-abs': true,
            profit: gain.get('gainAbs') >= 0,
            loss: gain.get('gainAbs') < 0
        });
        const dayGainClasses = classNames({
            'day-gain': true,
            profit: gain.get('dayGain') >= 0,
            loss: gain.get('dayGain') < 0
        });
        const dayGainAbsClasses = classNames({
            'day-gain-abs': true,
            profit: gain.get('dayGainAbs') >= 0,
            loss: gain.get('dayGainAbs') < 0
        });

        return (
            <span className="gain">
                <span className={gainOuterClasses} style={gainStyle}>
                    <span className="value">
                        {formatCurrency(gain.get('value'), formatOptions)}
                    </span>
                    <span className={gainAbsClasses}>
                        {formatCurrency(gain.get('gainAbs'), formatOptions)}
                    </span>
                    <span className={dayGainAbsClasses}>
                        {formatCurrency(gain.get('dayGainAbs'), formatOptions)}
                    </span>
                    <span className={gainClasses}>
                        {formatPercent(gain.get('gain'), formatOptionsPct)}
                    </span>
                    <span className={dayGainClasses}>
                        {formatPercent(gain.get('dayGain'), formatOptionsPct)}
                    </span>
                </span>
            </span>
        );
    }
    renderListExtra(row, rowKey) {
        return (
            <span>
                {this.renderFundGraph(row, rowKey)}
                {this.renderGainInfo(row)}
            </span>
        );
    }
    renderGainInfoMobile(cost, gain) {
        if (!gain) {
            return null;
        }

        const formatOptions = {
            abbreviate: true,
            precision: 1
        };

        const costValue = <span className="cost-value">
            {formatCurrency(cost, formatOptions)}
        </span>;

        const value = cost
            ? formatCurrency(gain.get('value'), formatOptions)
            : '\u2013';

        const actualValue = <span className="actual-value">{value}</span>;

        return <span className="cost">
            {costValue}
            {actualValue}
        </span>;
    }
    renderListRowMobile(row, rowKey, columns, colKeys) {
        const items = super.renderListRowItemsMobile(row, rowKey, columns.slice(0, 2), colKeys);

        const gain = row.get('gain');
        const gainInfo = this.renderGainInfoMobile(row.getIn(['cols', colKeys[2]]), gain);

        return <li key={rowKey}>
            {items}
            {gainInfo}
        </li>;
    }
    renderStocksList(render) {
        if (!render || !DO_STOCKS_LIST) {
            return null;
        }

        return <StocksList dispatcher={this.props.dispatcher}
            stocks={this.props.stocksListProps.get('stocks')}
            indices={this.props.stocksListProps.get('indices')}
            lastPriceUpdate={this.props.stocksListProps.get('lastPriceUpdate')}
            history={this.props.stocksListProps.get('history')}
            weightedGain={this.props.stocksListProps.get('weightedGain')}
            oldWeightedGain={this.props.stocksListProps.get('oldWeightedGain')}
        />;
    }
    renderFundsGraph(render) {
        if (!render) {
            return null;
        }

        return (
            <div className="graph-container-outer">
                <GraphFunds dispatcher={this.props.dispatcher}
                    name="fund-history"
                    width={GRAPH_FUNDS_WIDTH}
                    height={GRAPH_FUNDS_HEIGHT}
                    fundItems={this.props.graphProps.getIn(['data', 'fundItems'])}
                    fundLines={this.props.graphProps.getIn(['data', 'fundLines'])}
                    startTime={this.props.graphProps.get('startTime')}
                    cacheTimes={this.props.graphProps.get('cacheTimes')}
                    mode={this.props.graphProps.get('mode')}
                    period={this.props.graphProps.get('period')}
                    showOverall={this.props.graphProps.get('showOverall')}
                    zoom={this.props.graphProps.get('zoom')}
                    hlPoint={this.props.graphProps.get('hlPoint')}
                />
            </div>
        );
    }
    renderAfterList(render) {
        const stocksList = this.renderStocksList(render);
        const fundsGraph = this.renderFundsGraph(render);

        return <span>
            {stocksList}
            {fundsGraph}
        </span>;
    }
    renderAfterListMobile(render) {
        if (!render) {
            return null;
        }

        const gainInfo = this.getGainInfo();

        return (
            <span className={gainInfo.classes}>
                <span className="gain-info">Current value:</span>
                <span className="value">{formatCurrency(this.props.cachedValue.get('value'))}</span>
                <span className="gain-pct">{gainInfo.gainPct}</span>
                <span className="cache-age">({this.props.cachedValue.get('ageText')})</span>
            </span>
        );
    }
    afterList() {
        // render graphs and stuff here
        return <div className="funds-info">
            <Media query={mediaQueries.desktop}>{render => this.renderAfterList(render)}</Media>
            <Media query={mediaQueries.mobile}>{render => this.renderAfterListMobile(render)}</Media>
        </div>;
    }
}

PageFunds.propTypes = {
    graphProps: PropTypes.instanceOf(map),
    stocksListProps: PropTypes.instanceOf(map),
    cachedValue: PropTypes.instanceOf(map),
    showOverall: PropTypes.bool
};

