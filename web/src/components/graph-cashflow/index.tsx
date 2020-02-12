import React, { useCallback, useMemo } from 'react';
import { DateTime } from 'luxon';
import { PickUnion } from '~client/types';
import { LineGraph, Props as GraphProps } from '~client/components/graph/line-graph';
import { TimeAxes } from '~client/components/graph/time-axes';
import { NowLine } from '~client/components/graph-cashflow/now-line';
import { GRAPH_HEIGHT, GRAPH_CASHFLOW_PADDING } from '~client/constants/graph';
import { formatCurrency } from '~client/modules/format';
import { Range, Pix, BasicProps, Line } from '~client/types/graph';

export type Props = PickUnion<GraphProps, 'name' | 'lines' | 'afterLines' | 'after'> & {
    isMobile?: boolean;
    now: DateTime;
    graphWidth: number;
    graphHeight?: number;
};

function getTime(
    key: number,
    offset: number,
    startDate: DateTime,
    now?: DateTime,
    breakAtToday?: boolean,
): DateTime {
    // converts a key index to a UNIX time stamp
    const date = startDate.plus({ months: key - offset }).endOf('month');

    if (breakAtToday && now && date.year === now.year && date.month === now.month) {
        return now;
    }

    return date;
}

export type TimeValuesProps = {
    now?: DateTime;
    oldOffset: number;
    breakAtToday?: boolean;
    startDate: DateTime;
};

export function getValuesWithTime(data: number[], props: TimeValuesProps): [number, number][] {
    const { oldOffset, breakAtToday, startDate } = props;

    return data.map((value, index) => {
        const date = getTime(index, oldOffset, startDate, props.now, breakAtToday);

        return [date.toSeconds(), value];
    });
}

export function getRanges(lines: Line[]): Range {
    return lines.reduce(
        ({ minX, maxX, minY, maxY }, { data }) => {
            const dataX = data.map(([xValue]) => xValue);
            const dataY = data.map(([, yValue]) => yValue);

            return {
                minX: dataX.reduce((min, value) => Math.min(min, value), minX),
                maxX: dataX.reduce((max, value) => Math.max(max, value), maxX),
                minY: dataY.reduce((min, value) => Math.min(min, value), minY),
                maxY: dataY.reduce((max, value) => Math.max(max, value), maxY),
            };
        },
        {
            minX: Infinity,
            maxX: -Infinity,
            minY: 0,
            maxY: -Infinity,
        },
    );
}

function makeBeforeLines({ now }: Pick<Props, 'now'>): React.FC<BasicProps> {
    const BeforeLines: React.FC<Range & Pix> = props => (
        <g>
            <TimeAxes {...props} />
            <NowLine now={now} {...props} />
        </g>
    );

    return BeforeLines;
}

export const GraphCashFlow: React.FC<Props> = ({
    name,
    isMobile = false,
    now,
    graphWidth,
    graphHeight = GRAPH_HEIGHT,
    lines,
    afterLines,
    after,
}) => {
    const ranges = useMemo<Range>(() => getRanges(lines), [lines]);

    const beforeLines = useMemo(() => makeBeforeLines({ now }), [now]);

    const labelX = useCallback(
        value => DateTime.fromJSDate(new Date(1000 * value)).toFormat('LLL y'),
        [],
    );

    const labelY = useCallback(value => formatCurrency(value, { precision: 2 }), []);

    const hoverEffect = useMemo(
        () => ({
            labelX,
            labelY,
            labelWidthY: 88,
        }),
        [labelX, labelY],
    );

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
        ...ranges,
    };

    return <LineGraph {...graphProps} />;
};
