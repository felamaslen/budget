import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import LineGraph from '../../../../components/graph/line';
import Axes from './axes';
import { rgba } from '../../../../misc/color';
import { GRAPH_WIDTH, GRAPH_HEIGHT } from '../../../../misc/const';
import { COLOR_TRANSLUCENT_LIGHT } from '../../../../misc/config';
import { getYearMonthFromKey, getKeyFromYearMonth } from '../../../../misc/data';

export function BaseKey({ children }) {
    return (
        <g className="key">
            <rect x={45} y={8} width={200} height={60}
                fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />
            {children}
        </g>
    );
}

BaseKey.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ])
};

function getTime(now, offset, breakAtToday, startYear, startMonth) {
    // converts a key index to a UNIX time stamp
    return key => {
        const [year, month] = getYearMonthFromKey(key - offset, startYear, startMonth);

        if (breakAtToday && year === now.year && month === now.month) {
            return now.ts / 1000;
        }

        return DateTime.fromObject({ year, month })
            .endOf('month')
            .ts / 1000;
    };
}

export function getValuesWithTime(data, props) {
    const now = DateTime.local();

    const {
        oldOffset,
        breakAtToday,
        startYearMonth: [startYear, startMonth]
    } = props;

    const timeGetter = getTime(now, oldOffset, breakAtToday, startYear, startMonth);

    return data.map((value, index) => list([timeGetter(index), value]));
}

export function getFutureKey(props) {
    const {
        currentYearMonth: [currentYear, currentMonth],
        startYearMonth: [startYear, startMonth]
    } = props;

    return 1 + getKeyFromYearMonth(
        currentYear,
        currentMonth,
        startYear,
        startMonth
    );
}

export function getRanges(lines) {
    return lines.reduce(({ minX, maxX, minY, maxY }, { data }) => {
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

export function GraphCashFlow(props) {
    const ranges = getRanges(props.lines);

    const coreProps = {
        width: GRAPH_WIDTH,
        height: GRAPH_HEIGHT,
        padding: [40, 0, 0, 0],
        ...ranges
    };

    const beforeLines = subProps => <g>
        <Axes {...subProps} />
    </g>;

    const graphProps = {
        beforeLines,
        ...coreProps,
        ...props
    };

    return <LineGraph {...graphProps} />;
}

GraphCashFlow.propTypes = {
    lines: PropTypes.array.isRequired
};

