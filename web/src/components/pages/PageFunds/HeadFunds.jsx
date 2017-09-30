import connect, { Head } from '../../PageList/Head';

import { aFundsGraphPeriodChanged } from '../../../actions/GraphActions';

import React from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '../../../misc/format';

export class HeadFunds extends Head {
    listHeadExtra() {
        const reloadFundPrices = () => this.props.reloadFundPrices(this.props.shortPeriod);

        return <span className={this.props.gainInfo.classes} onClick={reloadFundPrices}>
            <span className="gain-info">Current value:</span>
            <span>{formatCurrency(this.props.cachedValue.get('value'))}</span>
            <span>{this.props.gainInfo.gainPct}</span>
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

