/*
 * Graph net cash flow (spending over time)
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { rgba } from '~client/modules/color';
import { COLOR_SPENDING, COLOR_PROFIT, COLOR_LOSS } from '~client/constants/colors';
import { rangePropTypes, pixelPropTypes } from '~client/prop-types/graph';
import GraphCashFlow, { getValuesWithTime, graphCashFlowPropTypes } from '~client/components/GraphCashFlow';
import Key from '~client/components/GraphSpending/Key';

const colorProfitLoss = [rgba(COLOR_LOSS), rgba(COLOR_PROFIT)];

function processData({ valuesNet, valuesSpending, startDate }) {
    const props = {
        oldOffset: 0,
        startDate,
    };

    const dataNet = getValuesWithTime(valuesNet, props);
    const dataSpending = getValuesWithTime(valuesSpending, props);

    return [
        {
            key: 'net',
            data: dataNet,
            arrows: true,
            color: ([, yValue]) => colorProfitLoss[(yValue > 0) >> 0],
        },
        {
            key: 'spending',
            data: dataSpending,
            fill: false,
            smooth: true,
            color: rgba(COLOR_SPENDING),
            movingAverage: 6,
        },
    ];
}

function makeAfterLines() {
    const AfterLines = ({
        pixX, pixY, maxX, minY, maxY,
    }) => (
        <g>
            <Key
                title="Cash flow"
                pixX={pixX}
                pixY={pixY}
                maxX={maxX}
                minY={minY}
                maxY={maxY}
            />
        </g>
    );

    AfterLines.propTypes = {
        ...rangePropTypes,
        ...pixelPropTypes,
    };

    return AfterLines;
}

export default function GraphSpending({
    graphWidth, now, valuesNet, valuesSpending, startDate,
}) {
    const lines = useMemo(() => processData({
        valuesNet,
        valuesSpending,
        startDate,
    }), [valuesNet, valuesSpending, startDate]);

    const afterLines = useMemo(makeAfterLines, []);

    const graphProps = {
        name: 'spend',
        graphWidth,
        now,
        lines,
        afterLines,
    };

    return <GraphCashFlow {...graphProps} />;
}

GraphSpending.propTypes = {
    ...graphCashFlowPropTypes,
    startDate: PropTypes.instanceOf(DateTime).isRequired,
    valuesNet: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    valuesSpending: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};
