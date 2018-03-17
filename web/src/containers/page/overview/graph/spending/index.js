/*
 * Graph net cash flow (spending over time)
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { rgba } from '../../../../../misc/color';
import { GRAPH_SPEND_CATEGORIES } from '../../../../../misc/const';
import { COLOR_SPENDING, COLOR_PROFIT, COLOR_LOSS } from '../../../../../misc/config';
import { GraphCashFlow, getValuesWithTime } from '../helpers';
import Key from './key';

function processData({ valuesNet, valuesSpending, ...props }) {
    const dataNet = getValuesWithTime(valuesNet, { oldOffset: 0, ...props });
    const dataSpending = getValuesWithTime(valuesSpending, { oldOffset: 0, ...props });

    const colorProfitLoss = [rgba(COLOR_LOSS), rgba(COLOR_PROFIT)];

    return [
        {
            key: 'net',
            data: dataNet,
            arrows: true,
            color: point => colorProfitLoss[(point.get(1) > 0) >> 0]
        },
        {
            key: 'spending',
            data: dataSpending,
            fill: false,
            smooth: true,
            color: rgba(COLOR_SPENDING)
        }
    ];
}

function GraphSpend(props) {
    const lines = processData(props);

    const afterLines = subProps => <g>
        <Key {...subProps} />
    </g>;

    const graphProps = {
        title: 'Cash flow',
        lines,
        afterLines,
        ...props
    };

    return <GraphCashFlow {...graphProps} />;
}

GraphSpend.propTypes = {
    valuesNet: PropTypes.instanceOf(list).isRequired,
    valuesSpending: PropTypes.instanceOf(list).isRequired
};

const mapStateToProps = state => ({
    startYearMonth: state.getIn(['pages', 'overview', 'data', 'startYearMonth']),
    currentYearMonth: state.getIn(['pages', 'overview', 'data', 'currentYearMonth']),
    valuesNet: GRAPH_SPEND_CATEGORIES.reduce((data, category) => {
        return data.map((item, key) => {
            const cost = state.getIn(['pages', 'overview', 'data', 'cost', category.name, key]);

            return item - cost;
        });
    }, state.getIn(['pages', 'overview', 'data', 'cost', 'income'])),
    valuesSpending: GRAPH_SPEND_CATEGORIES.reduce((data, category) => {
        return data.map((item, key) => {
            const cost = state
                .getIn(['pages', 'overview', 'data', 'cost', category.name, key]);

            return item + cost;
        });
    }, state
        .getIn(['pages', 'overview', 'data', 'cost', 'income'])
        .map(() => 0)
    )
});

export default connect(mapStateToProps)(GraphSpend);

