import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { DateTime } from 'luxon';
import LineGraph from '~client/components/Graph/LineGraph';
import Axes from './Axes';
import NowLine from './NowLine';
import { GRAPH_HEIGHT } from '~client/constants/graph';
import { formatCurrency } from '~client/helpers/format';

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

export default function GraphCashFlow(props) {
    const ranges = getRanges(props.lines);

    const coreProps = {
        width: props.graphWidth,
        height: props.graphHeight || GRAPH_HEIGHT,
        padding: [40, 0, 0, 0],
        ...ranges
    };

    const beforeLines = subProps => <g>
        <Axes {...subProps} />
        <NowLine {...subProps} now={props.now} />
    </g>;

    const graphProps = {
        beforeLines,
        hoverEffect: {
            labelX: value => DateTime.fromJSDate(new Date(1000 * value))
                .toFormat('LLL y'),
            labelY: value => formatCurrency(value, { precision: 2 }),
            labelWidthY: 88
        },
        ...coreProps,
        ...props
    };

    return <LineGraph {...graphProps} />;
}

GraphCashFlow.propTypes = {
    now: PropTypes.instanceOf(DateTime).isRequired,
    graphWidth: PropTypes.number.isRequired,
    graphHeight: PropTypes.number,
    lines: ImmutablePropTypes.list.isRequired
};

