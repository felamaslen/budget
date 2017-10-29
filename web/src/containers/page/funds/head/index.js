import { Map as map } from 'immutable';
import connect, { Head } from '../../list/head';

import { aFundsGraphPeriodChanged } from '../../../../actions/graph.actions';

import React from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '../../../../misc/format';

export class HeadFunds extends Head {
    listHeadExtra() {
        const reloadFundPrices = () => this.props.reloadFundPrices(this.props.shortPeriod);

        return <span className={this.props.gainInfo.get('classes')} onClick={reloadFundPrices}>
            <span className="gain-info">Current value:</span>
            <span>{formatCurrency(this.props.cachedValue.get('value'))}</span>
            <span>{this.props.gainInfo.get('gainPct')}</span>
            <span className="gain-info">({this.props.cachedValue.get('ageText')})</span>
        </span>;
    }
}

HeadFunds.propTypes = {
    shortPeriod: PropTypes.string.isRequired,
    gainInfo: PropTypes.instanceOf(map).isRequired
};

const mapStateToProps = () => state => ({
    cachedValue: state.getIn(['other', 'fundsCachedValue']),
    shortPeriod: state.getIn(['other', 'graphFunds', 'period'])
});

const mapDispatchToProps = () => dispatch => ({
    reloadFundPrices: shortPeriod => dispatch(aFundsGraphPeriodChanged({
        shortPeriod,
        noCache: true,
        reloadPagePrices: true
    }))
});

export default pageIndex => connect(pageIndex)(mapStateToProps, mapDispatchToProps)(HeadFunds);

