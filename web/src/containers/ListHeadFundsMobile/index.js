import { Map as map } from 'immutable';
import { connect } from 'react-redux';
import { aFundsGraphPeriodChanged } from '../../actions/graph.actions';
import { getFundsCachedValue, getFundsCost } from '../../selectors/funds';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatCurrency, formatPercent } from '../../helpers/format';
import GraphFunds from '../GraphFunds';

function ListHeadFundsMobile({ totalCost, shortPeriod, cachedValue, onReloadPrices }) {
    const gain = totalCost
        ? (cachedValue.get('value') - totalCost) / totalCost
        : 0;

    const className = classNames('gain', {
        profit: gain > 0,
        loss: gain < 0
    });

    return (
        <div className="funds-info-inner">
            <div className={className} onClick={onReloadPrices(shortPeriod)}>
                <span className="gain-info">{'Current value:'}</span>
                <span className="value">{formatCurrency(cachedValue.get('value'))}</span>
                <span className="gain-pct">{formatPercent(gain, { brackets: true, precision: 2 })}</span>
                <span className="cache-age">({cachedValue.get('ageText')})</span>
            </div>
            <GraphFunds isMobile={true} />
        </div>
    );
}

ListHeadFundsMobile.propTypes = {
    totalCost: PropTypes.number.isRequired,
    shortPeriod: PropTypes.string.isRequired,
    cachedValue: PropTypes.instanceOf(map).isRequired,
    onReloadPrices: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    totalCost: getFundsCost(state),
    shortPeriod: state.getIn(['other', 'graphFunds', 'period']),
    cachedValue: getFundsCachedValue(state)
});

const mapDispatchToProps = dispatch => ({
    onReloadPrices: shortPeriod => () => dispatch(aFundsGraphPeriodChanged({ shortPeriod, noCache: true }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListHeadFundsMobile);

