import React, { useMemo } from 'react';
import { DateTime } from 'luxon';

import { rgba } from '~client/modules/color';
import { profitLossColor } from '~client/components/graph/helpers';
import { COLOR_SPENDING } from '~client/constants/colors';
import {
    GraphCashFlow,
    getValuesWithTime,
    TimeValuesProps,
} from '~client/components/graph-cashflow';
import { Key } from '~client/components/graph-spending/key';
import { Line, BasicProps } from '~client/types/graph';

type Props = {
    graphWidth: number;
    now: DateTime;
    valuesNet: number[];
    valuesSpending: number[];
    startDate: DateTime;
};

function processData({
    valuesNet,
    valuesSpending,
    startDate,
}: Pick<Props, 'valuesNet' | 'valuesSpending' | 'startDate'>): Line[] {
    const props: TimeValuesProps = {
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
            color: profitLossColor,
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

function makeAfterLines(): React.FC<BasicProps> {
    const AfterLines: React.FC<BasicProps> = ({ pixX, pixY1, maxX, minY, maxY }) => (
        <g>
            <Key title="Cash flow" pixX={pixX} pixY1={pixY1} maxX={maxX} minY={minY} maxY={maxY} />
        </g>
    );

    return AfterLines;
}

export const GraphSpending: React.FC<Props> = ({
    graphWidth,
    now,
    valuesNet,
    valuesSpending,
    startDate,
}) => {
    const lines = useMemo<Line[]>(
        () =>
            processData({
                valuesNet,
                valuesSpending,
                startDate,
            }),
        [valuesNet, valuesSpending, startDate],
    );

    const afterLines = useMemo(makeAfterLines, []);

    const graphProps = {
        name: 'spend',
        graphWidth,
        now,
        lines,
        afterLines,
    };

    return <GraphCashFlow {...graphProps} />;
};
