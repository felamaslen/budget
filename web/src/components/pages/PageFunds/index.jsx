/**
 * Funds page component
 */

import { Map as map } from 'immutable';

import connect, { PageList } from '../../PageList';

import { aContentRequested } from '../../../actions/ContentActions';

import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import classNames from 'classnames';

import { getPeriodMatch } from '../../../misc/data';
import { DO_STOCKS_LIST } from '../../../misc/config';
import { mediaQueries, PAGES, GRAPH_FUNDS_PERIODS } from '../../../misc/const';
import { formatCurrency, formatPercent } from '../../../misc/format';
import { StocksList } from '../../StocksList';

import getFundsHead from './HeadFunds';
import getFundsBody from './BodyFunds';
import getFundsBodyMobile from './BodyFundsMobile';

import GraphFunds from '../../graphs/GraphFunds';

const pageIndex = PAGES.indexOf('funds');

class PageFunds extends PageList {
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

        return <div className="graph-container-outer">
            <GraphFunds />
        </div>;
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

        return <span className={this.props.gainInfo.classes}>
            <span className="gain-info">Current value:</span>
            <span className="value">{formatCurrency(this.props.cachedValue.get('value'))}</span>
            <span className="gain-pct">{this.props.gainInfo.gainPct}</span>
            <span className="cache-age">({this.props.cachedValue.get('ageText')})</span>
        </span>;
    }
    afterList() {
        // render graphs and stuff here
        return <div className="funds-info">
            <Media query={mediaQueries.desktop}>
                {render => this.renderAfterList(render)}
            </Media>
            <Media query={mediaQueries.mobile}>
                {render => this.renderAfterListMobile(render)}
            </Media>
        </div>;
    }
    headDesktop() {
        const HeadFunds = getFundsHead(this.props.pageIndex);

        return <HeadFunds gainInfo={this.props.gainInfo} />;
    }
    bodyDesktop() {
        const BodyFunds = getFundsBody(this.props.pageIndex);

        return <BodyFunds />;
    }
    bodyMobile() {
        const BodyFundsMobile = getFundsBodyMobile(this.props.pageIndex);

        return <BodyFundsMobile />;
    }
}

PageFunds.propTypes = {
    graphProps: PropTypes.instanceOf(map),
    stocksListProps: PropTypes.instanceOf(map),
    cachedValue: PropTypes.instanceOf(map),
    showOverall: PropTypes.bool,
    gainInfo: PropTypes.object
};

function getGainInfo(state) {
    const cost = state.getIn(['global', 'pages', pageIndex, 'data', 'total']);
    const value = state.getIn(['global', 'other', 'fundsCachedValue', 'value']);

    const gain = cost
        ? (value - cost) / cost
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

const mapStateToProps = () => state => ({
    cachedValue: state.getIn(['global', 'other', 'fundsCachedValue']),
    gainInfo: getGainInfo(state)
});

const mapDispatchToProps = () => dispatch => ({
    loadContent: req => {
        const { period, length } = getPeriodMatch(GRAPH_FUNDS_PERIODS[0][0]);

        return dispatch(aContentRequested(Object.assign(req, {
            query: { history: 'true', period, length }
        })));
    }
});

export default connect(pageIndex)(mapStateToProps, mapDispatchToProps)(PageFunds);

