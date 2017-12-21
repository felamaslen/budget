/**
 * Funds page component
 */

import { Map as map } from 'immutable';
import connect, { PageList } from '../list';

import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import classNames from 'classnames';

import { DO_STOCKS_LIST } from '../../../misc/config';
import { mediaQueries } from '../../../misc/const';
import { formatCurrency, formatPercent } from '../../../misc/format';
import StocksList from '../../stocks-list';

import getFundsBody from './body';
import getFundsBodyMobile from './body/mobile';

import GraphFunds from './graph/funds';

class PageFunds extends PageList {
    renderStocksList(render) {
        if (!render || !DO_STOCKS_LIST) {
            return null;
        }

        return <StocksList />;
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

        return <span className={this.props.gainInfo.get('classes')}>
            <span className="gain-info">Current value:</span>
            <span className="value">{formatCurrency(this.props.cachedValue.get('value'))}</span>
            <span className="gain-pct">{this.props.gainInfo.get('gainPct')}</span>
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
    bodyDesktop() {
        const BodyFunds = getFundsBody();

        return <BodyFunds gainInfo={this.props.gainInfo} />;
    }
    bodyMobile() {
        const BodyFundsMobile = getFundsBodyMobile();

        return <BodyFundsMobile />;
    }
}

PageFunds.propTypes = {
    graphProps: PropTypes.instanceOf(map),
    stocksListProps: PropTypes.instanceOf(map),
    cachedValue: PropTypes.instanceOf(map),
    showOverall: PropTypes.bool,
    gainInfo: PropTypes.instanceOf(map)
};

function getGainInfo(state) {
    const cost = state.getIn(['pages', 'funds', 'data', 'total']);
    const value = state.getIn(['other', 'fundsCachedValue', 'value']);

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

    return map({ classes, gainPct });
}

const mapStateToProps = () => state => ({
    cachedValue: state.getIn(['other', 'fundsCachedValue']),
    gainInfo: getGainInfo(state)
});

export default connect('funds')(mapStateToProps)(PageFunds);

