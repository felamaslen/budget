import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import LineGraph from '~client/components/Graph/LineGraph';
import { rangePropTypes } from '~client/prop-types/graph';
import Axes from '~client/components/GraphCashFlow/Axes';
import NowLine from '~client/components/GraphCashFlow/NowLine';
import { GRAPH_HEIGHT, GRAPH_CASHFLOW_PADDING } from '~client/constants/graph';
import { formatCurrency } from '~client/modules/format';

function getTime(key, now, offset, breakAtToday, startDate) {
    // converts a key index to a UNIX time stamp
    const date = startDate.plus({ months: key - offset })
        .endOf('month');

    if (breakAtToday && date.year === now.year && date.month === now.month) {
        return now;
    }

    return date;
}

export function getValuesWithTime(data, props) {
    const { oldOffset, breakAtToday, startDate } = props;

    return data.map((value, index) => {
        const date = getTime(index, props.now, oldOffset, breakAtToday, startDate);

        return [date.ts / 1000, value];
    });
}

export function getRanges(lines) {
    return lines.reduce(({ minX, maxX, minY, maxY }, { data }) => {
        const dataX = data.map(([xValue]) => xValue);
        const dataY = data.map(([, yValue]) => yValue);

        return {
            minX: dataX.reduce((min, value) => Math.min(min, value), minX),
            maxX: dataX.reduce((max, value) => Math.max(max, value), maxX),
            minY: dataY.reduce((min, value) => Math.min(min, value), minY),
            maxY: dataY.reduce((max, value) => Math.max(max, value), maxY)
        };
    }, { minX: Infinity, maxX: -Infinity, minY: 0, maxY: -Infinity });
}

function makeBeforeLines({ now }) {
    const BeforeLines = ({ minX, maxX, minY, maxY, pixX, pixY }) => (
        <g>
            <Axes
                minX={minX}
                maxX={maxX}
                minY={minY}
                maxY={maxY}
                pixX={pixX}
                pixY={pixY}
            />
            <NowLine
                now={now}
                minY={minY}
                maxY={maxY}
                pixX={pixX}
                pixY={pixY}
            />
        </g>
    );

    BeforeLines.propTypes = {
        ...rangePropTypes
    };

    return BeforeLines;
}

export default function GraphCashFlow({ name, isMobile, now, graphWidth, graphHeight, lines, afterLines, after }) {
    const ranges = useMemo(() => getRanges(lines), [lines]);

    const beforeLines = useMemo(() => makeBeforeLines({ now }), [now]);

    const labelX = useCallback(value => DateTime.fromJSDate(new Date(1000 * value))
        .toFormat('LLL y'), []
    );

    const labelY = useCallback(value => formatCurrency(value, { precision: 2 }), []);

    const hoverEffect = useMemo(() => ({
        labelX,
        labelY,
        labelWidthY: 88
    }), [labelX, labelY]);

    const graphProps = {
        name,
        isMobile,
        beforeLines,
        afterLines,
        after,
        lines,
        hoverEffect,
        width: graphWidth,
        height: graphHeight,
        padding: GRAPH_CASHFLOW_PADDING,
        ...ranges
    };

    return <LineGraph {...graphProps} />;
}

export const graphCashFlowPropTypes = {
    name: PropTypes.string.isRequired,
    now: PropTypes.instanceOf(DateTime).isRequired,
    graphWidth: PropTypes.number.isRequired
};

GraphCashFlow.propTypes = {
    isMobile: PropTypes.bool.isRequired,
    graphHeight: PropTypes.number.isRequired,
    lines: PropTypes.arrayOf(PropTypes.shape({
        minX: PropTypes.number.isRequired,
        maxX: PropTypes.number.isRequired,
        minY: PropTypes.number.isRequired,
        maxY: PropTypes.number.isRequired
    }).isRequired).isRequired,
    afterLines: PropTypes.func,
    after: PropTypes.func,
    ...graphCashFlowPropTypes
};

GraphCashFlow.defaultProps = {
    isMobile: false,
    graphHeight: GRAPH_HEIGHT,
    afterLines: null,
    after: null
};
