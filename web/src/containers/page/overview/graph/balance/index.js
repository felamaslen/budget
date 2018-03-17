/*
 * Graph general cash flow (balance over time)
 */

import { Map as map, List as list } from 'immutable';
import { connect } from 'react-redux';
import { aShowAllToggled } from '../../../../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import {
    COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS
} from '../../../../../misc/config';
import { rgba } from '../../../../../misc/color';
import Key from './key';
import Targets from './targets';
import AfterCanvas from './after-canvas';
import { GraphCashFlow, getValuesWithTime, getFutureKey } from '../helpers';

function processData({ cost, showAll, ...props }) {
    let oldOffset = 0;

    let balance = cost.get('balanceWithPredicted');
    let funds = cost.get('funds');

    if (showAll) {
        oldOffset = cost.get('old').size;
        balance = cost.get('old').concat(balance);
        funds = cost.get('fundsOld').concat(funds);
    }

    const futureKey = oldOffset + getFutureKey(props);

    const dataBalance = getValuesWithTime(balance, { oldOffset, ...props });

    const dataFunds = funds.map((value, key) => list([
        dataBalance.getIn([key, 0]),
        value
    ]));

    const colorBalance = [rgba(COLOR_BALANCE_PREDICTED), rgba(COLOR_BALANCE_ACTUAL)];

    const colorBalanceStocks = rgba(COLOR_BALANCE_STOCKS);

    return [
        {
            key: 'balance',
            data: dataBalance,
            fill: false,
            smooth: true,
            color: (point, index) => colorBalance[(index < futureKey - 1) >> 0]
        },
        {
            key: 'funds',
            data: dataFunds,
            fill: true,
            smooth: true,
            color: colorBalanceStocks
        }
    ];
}

function GraphBalance({ targets, ...props }) {
    const lines = processData(props);

    const afterLines = () => <g>
        <Targets targets={targets} />
        <Key />
    </g>;

    const after = <AfterCanvas {...props} />;

    const graphProps = {
        title: 'Balance',
        lines,
        afterLines,
        after,
        ...props
    };

    return <GraphCashFlow {...graphProps} />;
}

GraphBalance.propTypes = {
    cost: PropTypes.instanceOf(map).isRequired,
    showAll: PropTypes.bool.isRequired,
    targets: PropTypes.instanceOf(list).isRequired
};

const mapStateToProps = state => ({
    currentYearMonth: state.getIn(['pages', 'overview', 'data', 'currentYearMonth']),
    startYearMonth: state.getIn(['pages', 'overview', 'data', 'startYearMonth']),
    cost: state.getIn(['pages', 'overview', 'data', 'cost']),
    showAll: state.getIn(['other', 'showAllBalanceGraph']),
    targets: state.getIn(['pages', 'overview', 'data', 'targets'])
});

const mapDispatchToProps = dispatch => ({
    onShowAll: () => dispatch(aShowAllToggled())
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphBalance);


