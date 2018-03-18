import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import LineGraph from '../../../../components/graph/line';
import Axes from './axes';
import NowLine from './now-line';
import { rgba } from '../../../../misc/color';
import { GRAPH_HEIGHT } from '../../../../constants/graph';
import { FONT_GRAPH_TITLE } from '../../../../constants/graph';
import { COLOR_TRANSLUCENT_LIGHT, COLOR_GRAPH_TITLE } from '../../../../constants/colors';
import { getYearMonthFromKey, getKeyFromYearMonth } from '../../../../misc/data';

export function BaseKey({ title, children }) {
    const [fontSize, fontFamily] = FONT_GRAPH_TITLE;

    return <g className="key">
        <rect x={45} y={8} width={200} height={60}
            fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />

        <text x={65} y={10} color={rgba(COLOR_GRAPH_TITLE)} alignmentBaseline="hanging"
            fontSize={fontSize} fontFamily={fontFamily}>{title}</text>
        {children}
    </g>;
}

BaseKey.propTypes = {
    title: PropTypes.string.isRequired,
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
    const {
        oldOffset,
        breakAtToday,
        startYearMonth: [startYear, startMonth]
    } = props;

    const timeGetter = getTime(props.now, oldOffset, breakAtToday, startYear, startMonth);

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
        width: props.graphWidth,
        height: GRAPH_HEIGHT,
        padding: [40, 0, 0, 0],
        now: DateTime.local(),
        ...ranges
    };

    const beforeLines = subProps => <g>
        <Axes {...subProps} />
        <NowLine {...subProps} />
    </g>;

    const graphProps = {
        beforeLines,
        ...coreProps,
        ...props
    };

    return <LineGraph {...graphProps} />;
}

GraphCashFlow.propTypes = {
    graphWidth: PropTypes.number.isRequired,
    lines: PropTypes.array.isRequired
};

