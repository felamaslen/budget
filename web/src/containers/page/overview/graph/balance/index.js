/*
 * Graph general cash flow (balance over time)
 */

import { Map as map, List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS } from '../../../../../constants/colors';
import { rgba } from '../../../../../helpers/color';
import Key from './key';
import Targets from './targets';
import AfterCanvas from './after-canvas';
import { GraphCashFlow, getValuesWithTime } from '../helpers';

function processData({ cost, showAll, futureMonths, ...props }) {
    let oldOffset = 0;

    let balance = cost.get('balanceWithPredicted');
    let funds = cost.get('funds');

    if (showAll) {
        oldOffset = cost.get('old').size;
        balance = cost.get('old').concat(balance);
        funds = cost.get('fundsOld').concat(funds);
    }

    const futureKey = oldOffset + cost.get('balanceWithPredicted').size - futureMonths;

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

export default function GraphBalance({ targets, ...props }) {
    const lines = processData(props);

    const afterLines = () => <g>
        <Targets targets={targets} />
        <Key title="Balance" />
    </g>;

    const after = <AfterCanvas {...props} />;

    const graphProps = {
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
    targets: PropTypes.instanceOf(list).isRequired,
    futureMonths: PropTypes.number.isRequired
};


