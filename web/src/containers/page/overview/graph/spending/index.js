/*
 * Graph net cash flow (spending over time)
 */

import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { rgba } from '../../../../../helpers/color';
import { COLOR_SPENDING, COLOR_PROFIT, COLOR_LOSS } from '../../../../../constants/colors';
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
            color: rgba(COLOR_SPENDING),
            movingAverage: 6
        }
    ];
}

export default function GraphSpend(props) {
    const lines = processData(props);

    const afterLines = subProps => <g>
        <Key {...subProps} title="Cash flow" />
    </g>;

    const graphProps = {
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

