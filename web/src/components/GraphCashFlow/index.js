import { List as list } from 'immutable';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { DateTime } from 'luxon';
import LineGraph from '~client/components/Graph/LineGraph';
import { rangePropTypes } from '~client/components/Graph/propTypes';
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

        return list([date.ts / 1000, value, date]);
    });
}

export function getRanges(lines) {
    return lines.reduce(({ minX, maxX, minY, maxY }, line) => {
        const data = line.get('data');

        const dataX = data.map(item => item.get(0));
        const dataY = data.map(item => item.get(1));

        const thisMinX = dataX.min();
        const thisMaxX = dataX.max();

        const thisMinY = Math.min(0, dataY.min());
        const thisMaxY = dataY.max();

        return {
            minX: Math.min(minX, thisMinX),
            maxX: Math.max(maxX, thisMaxX),
            minY: Math.min(minY, thisMinY),
            maxY: Math.max(maxY, thisMaxY)
        };

    }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
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

export default function GraphCashFlow({ name, now, graphWidth, graphHeight, lines, afterLines, after }) {
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
    graphHeight: PropTypes.number.isRequired,
    lines: ImmutablePropTypes.list.isRequired,
    afterLines: PropTypes.func,
    after: PropTypes.func,
    ...graphCashFlowPropTypes
};

GraphCashFlow.defaultProps = {
    graphHeight: GRAPH_HEIGHT,
    afterLines: null,
    after: null
};

