/*
 * Graph general cash flow (balance over time)
 */

import { Map as map, List as list } from 'immutable';
import { connect } from 'react-redux';
import { aShowAllToggled } from '../../../../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import { GRAPH_WIDTH, GRAPH_HEIGHT } from '../../../../../misc/const';
import {
    COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS
} from '../../../../../misc/config';
import { rgba } from '../../../../../misc/color';
import LineGraph from '../../../../../components/graph/line';
import Axes from './axes';
import Key from './key';
import Targets from './targets';
import AfterCanvas from './after-canvas';
import { getValuesWithTime, getFutureKey } from '../cash-flow';

function getRanges(dataBalance) {
    const dataY = dataBalance.map(item => item.last());
    const dataX = dataBalance.map(item => item.first());

    const minYValue = dataY.min();
    const minY = Math.min(0, minYValue);
    const maxY = dataY.max();
    const minX = dataX.min();
    const maxX = dataX.max();

    return { minY, maxY, minX, maxX };
}

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

    const colorBalanceActual = rgba(COLOR_BALANCE_ACTUAL);
    const colorBalancePredicted = rgba(COLOR_BALANCE_PREDICTED);
    const colorBalanceStocks = rgba(COLOR_BALANCE_STOCKS);

    return [
        {
            key: 'balance',
            data: dataBalance,
            fill: false,
            smooth: true,
            color: (point, index) => {
                if (index < futureKey) {
                    return colorBalanceActual;
                }

                return colorBalancePredicted;
            }
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
    const ranges = getRanges(lines[0].data);

    const coreProps = {
        width: GRAPH_WIDTH,
        height: GRAPH_HEIGHT,
        padding: [40, 0, 0, 0],
        ...ranges
    };

    const beforeLines = <g>
        <Axes {...coreProps} />
    </g>;

    const afterLines = <g>
        <Targets targets={targets} />
        <Key />
    </g>;

    const after = <AfterCanvas {...props} />;

    const graphProps = {
        title: 'Balance',
        beforeLines,
        afterLines,
        after,
        lines,
        ...coreProps,
        ...props
    };

    return (
        <LineGraph {...graphProps} />
    );
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


