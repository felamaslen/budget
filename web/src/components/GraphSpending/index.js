/*
 * Graph net cash flow (spending over time)
 */

import { List as list, Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { rgba } from '~client/modules/color';
import { COLOR_SPENDING, COLOR_PROFIT, COLOR_LOSS } from '~client/constants/colors';
import GraphCashFlow, { getValuesWithTime } from '../GraphCashFlow';
import Key from './Key';

function processData({ valuesNet, valuesSpending, ...props }) {
    const dataNet = getValuesWithTime(valuesNet, { oldOffset: 0, ...props });
    const dataSpending = getValuesWithTime(valuesSpending, { oldOffset: 0, ...props });

    const colorProfitLoss = [rgba(COLOR_LOSS), rgba(COLOR_PROFIT)];

    return list.of(
        map({
            key: 'net',
            data: dataNet,
            arrows: true,
            color: point => colorProfitLoss[(point.get(1) > 0) >> 0]
        }),
        map({
            key: 'spending',
            data: dataSpending,
            fill: false,
            smooth: true,
            color: rgba(COLOR_SPENDING),
            movingAverage: 6
        })
    );
}

export default function GraphSpending(props) {
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

GraphSpending.propTypes = {
    valuesNet: PropTypes.instanceOf(list).isRequired,
    valuesSpending: PropTypes.instanceOf(list).isRequired
};

