import connect, { Head } from '../../PageList/Head';

import { aFundsGraphPeriodChanged } from '../../../actions/GraphActions';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatCurrency, formatPercent } from '../../../misc/format';

export class HeadFunds extends Head {
    getGainInfo() {
        const cost = this.props.totalCost;
        const value = this.props.cachedValue.get('value');

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
    listHeadExtra() {
        const reloadFundPrices = () => this.props.reloadFundPrices(this.props.shortPeriod);

        const gainInfo = this.getGainInfo();

        return <span className={gainInfo.classes} onClick={reloadFundPrices}>
            <span className="gain-info">Current value:</span>
            <span>{formatCurrency(this.props.cachedValue.get('value'))}</span>
            <span>{gainInfo.gainPct}</span>
            <span className="gain-info">({this.props.cachedValue.get('ageText')})</span>
        </span>;
    }
}

HeadFunds.propTypes = {
    shortPeriod: PropTypes.string.isRequired
};

const mapStateToProps = () => state => ({
    cachedValue: state.getIn(['global', 'other', 'fundsCachedValue']),
    shortPeriod: state.getIn(['global', 'other', 'graphFunds', 'period'])
});

const mapDispatchToProps = () => dispatch => ({
    reloadFundPrices: shortPeriod => dispatch(aFundsGraphPeriodChanged({
        shortPeriod,
        noCache: true,
        reloadPagePrices: true
    }))
});

export default pageIndex => connect(pageIndex)(mapStateToProps, mapDispatchToProps)(HeadFunds);

