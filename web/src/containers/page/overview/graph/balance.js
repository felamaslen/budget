/*
 * Graph general cash flow (balance over time)
 */

import { Map as map, List as list } from 'immutable';
import { formatCurrency } from '../../../../misc/format';
import { rgba } from '../../../../misc/color';
import {
    COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS,
    COLOR_DARK, COLOR_TRANSLUCENT_LIGHT,
    FONT_GRAPH_KEY_SMALL
} from '../../../../misc/config';
import { GRAPH_WIDTH, GRAPH_HEIGHT } from '../../../../misc/const';

import { connect } from 'react-redux';
import { aShowAllToggled } from '../../../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import GraphCashFlow, { getFutureKey, getValuesWithTime, drawKey as drawBaseKey } from './cash-flow';
import LineGraph from '../../../../components/graph/line';

function AfterCanvas({ showAll, onShowAll }) {
    const className = classNames('show-all', 'noselect', {
        noselect: true,
        enabled: showAll
    });

    const onClick = () => onShowAll();

    return <span className={className} onClick={onClick}>
        <span>{'Show all'}</span>
        <a className="checkbox" />
    </span>;
}

AfterCanvas.propTypes = {
    showAll: PropTypes.bool.isRequired,
    onShowAll: PropTypes.func.isRequired
};

function Targets({ targets }) {
    const [fontSize, fontFamily] = FONT_GRAPH_KEY_SMALL;

    const tags = targets.map(target => `${formatCurrency(target.get('value'), {
        raw: true, noPence: true, abbreviate: true, precision: 0
    })} (${target.get('tag')})`)
        .map((target, key) => (
            <text key={key}
                x={50}
                y={72 + 22 * key}
                fill={rgba(COLOR_DARK)}
                alignmentBaseline="hanging"
                fontFamily={fontFamily}
                fontSize={fontSize}>
                {target}
            </text>
        ));

    return (
        <g>
            <rect x={48} y={70} width={100} height={targets.size * 22 + 4}
                fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />
            {tags}
        </g>
    );
}

Targets.propTypes = {
    targets: PropTypes.instanceOf(list).isRequired
};

function Key() {
    const [fontSize, fontFamily] = FONT_GRAPH_KEY_SMALL;

    return (
        <g>
            <rect x={45} y={8} width={200} height={60}
                fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />

            <line x1={50} y1={40} x2={74} y2={40}
                stroke={rgba(COLOR_BALANCE_ACTUAL)} strokeWidth={2} />
            <text x={78} y={40}
                fill={rgba(COLOR_DARK)}
                fontFamily={fontFamily} fontSize={fontSize}
                alignmentBaseline="middle"
            >{'Actual'}</text>

            <line x1={130} y1={40} x2={154} y2={40}
                stroke={rgba(COLOR_BALANCE_PREDICTED)} strokeWidth={2} />
            <text x={158} y={40}
                fill={rgba(COLOR_DARK)}
                fontFamily={fontFamily} fontSize={fontSize}
                alignmentBaseline="middle"
            >{'Predicted'}</text>

            <rect x={50} y={54} width={24} height={6}
                fill={rgba(COLOR_BALANCE_STOCKS)} />
            <text x={78} y={57}
                fill={rgba(COLOR_DARK)}
                fontFamily={fontFamily} fontSize={fontSize}
                alignmentBaseline="middle"
            >{'Stocks'}</text>
        </g>
    );
}

/*
function drawData({ targets, data: { dataBalance, dataFunds } }, { ctx }, { drawCubicLine }) {
    // plot past + future predicted data
    if (!(dataBalance && dataFunds)) {
        return;
    }

    ctx.lineWidth = 2;
    drawCubicLine(dataBalance, [
        rgba(COLOR_BALANCE_ACTUAL), rgba(COLOR_BALANCE_PREDICTED)
    ]);

    // plot past + future predicted ISA stock value
    drawFundsLine(dataFunds, ctx, drawCubicLine);

    drawTargets(targets, ctx);
}
*/

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

    const ranges = getRanges(dataBalance);

    const colorBalanceActual = rgba(COLOR_BALANCE_ACTUAL);
    const colorBalancePredicted = rgba(COLOR_BALANCE_PREDICTED);
    const colorBalanceStocks = rgba(COLOR_BALANCE_STOCKS);

    return {
        ...ranges,
        lines: [
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
        ]
    };
}

function GraphBalance({ targets, ...props }) {
    const after = <AfterCanvas {...props} />;
    const graphProps = {
        title: 'Balance',
        width: GRAPH_WIDTH,
        height: GRAPH_HEIGHT,
        padding: [40, 0, 0, 0],
        ...processData(props),
        ...props,
        after
    };

    return (
        <LineGraph {...graphProps}>
            <Targets targets={targets} />
            <Key />
        </LineGraph>
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

