import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { DateTime } from 'luxon';
import LineGraph from '../../components/Graph/LineGraph';
import Axes from './Axes';
import NowLine from './NowLine';
import { GRAPH_HEIGHT } from '../../constants/graph';

function getTime(now, offset, breakAtToday, startDate) {
    // converts a key index to a UNIX time stamp
    return key => {
        const date = startDate.plus({ months: key - offset });

        if (breakAtToday && date.year === now.year && date.month === now.month) {
            return now.ts / 1000;
        }

        return date.endOf('month').ts / 1000;
    };
}

export function getValuesWithTime(data, props) {
    const { oldOffset, breakAtToday, startDate } = props;

    const timeGetter = getTime(props.now, oldOffset, breakAtToday, startDate);

    return data.map((value, index) => list([timeGetter(index), value]));
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
    lines: ImmutablePropTypes.list.isRequired
};

