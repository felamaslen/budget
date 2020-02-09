import React from 'react';
import { DateTime } from 'luxon';

import LineGraph from '~client/components/Graph/LineGraph';
import TimeAxes from '~client/components/Graph/TimeAxes';
import { Pix, Dimensions, Line } from '~client/types/graph';

type GraphProps = {
    table: {
        id: string;
        date: DateTime;
        assets: number;
        liabilities: number;
        expenses: number;
        fti: number;
    }[];
};

type BeforeLinesProps = Pix & Dimensions;

const labelY = (value: number): string => String(value);

type AxisProps = {
    labelY?: (value: number) => string;
    hideMinorTicks?: boolean;
};

const makeBeforeLines = (axisProps: AxisProps = {}): React.FunctionComponent<BeforeLinesProps> => {
    const BeforeLines: React.FunctionComponent<BeforeLinesProps> = props => (
        <TimeAxes {...props} yAlign="right" {...axisProps} />
    );

    return BeforeLines;
};

const BeforeLinesFTI = makeBeforeLines({ labelY });
const BeforeLinesNetWorth = makeBeforeLines({
    hideMinorTicks: true,
});

const dimensions = (lines: Line[]): Dimensions => ({
    minX: lines.reduce(
        (last, { data }) => data.reduce((lineLast, [value]) => Math.min(lineLast, value), last),
        Infinity,
    ),
    maxX: lines.reduce(
        (last, { data }) => data.reduce((lineLast, [value]) => Math.max(lineLast, value), last),
        -Infinity,
    ),
    minY: lines.reduce(
        (last, { data }) => data.reduce((lineLast, [, value]) => Math.min(lineLast, value), last),
        Infinity,
    ),
    maxY: lines.reduce(
        (last, { data }) => data.reduce((lineLast, [, value]) => Math.max(lineLast, value), last),
        -Infinity,
    ),
});

const NetWorthGraph: React.FunctionComponent<GraphProps> = ({ table }) => {
    const dataFti = React.useMemo<[Line]>(
        () => [
            {
                key: 'fti',
                data: table.map(({ date, fti }) => [date.toSeconds(), fti]),
                color: '#000',
                smooth: true,
            },
        ],
        [table],
    );

    const dimensionsFti = dimensions(dataFti);

    const dataAssets = React.useMemo<[Line]>(
        () => [
            {
                key: 'assets',
                data: table.map(({ date, assets }) => [date.toSeconds(), assets]),
                color: 'darkgreen',
                smooth: true,
            },
        ],
        [table],
    );

    const dataLiabilities = React.useMemo<[Line, Line]>(
        () => [
            {
                key: 'liabilities',
                data: table.map(({ date, liabilities }) => [date.toSeconds(), -liabilities]),
                color: 'darkred',
                smooth: true,
            },
            {
                key: 'expenses',
                data: table.map(({ date, expenses }) => [date.toSeconds(), -expenses]),
                color: 'blueviolet',
                smooth: true,
            },
        ],
        [table],
    );

    return (
        <>
            <h3>Assets</h3>
            <LineGraph
                name="assets"
                lines={dataAssets}
                width={320}
                height={100}
                {...dimensions(dataAssets)}
                minY={0}
                beforeLines={BeforeLinesNetWorth}
            />
            <h3>
                <span style={{ color: 'darkred' }}>Liabilities</span> /{' '}
                <span style={{ color: 'blueviolet' }}>Expenses</span>
            </h3>
            <LineGraph
                name="liabilities"
                lines={dataLiabilities}
                width={320}
                height={100}
                {...dimensions(dataLiabilities)}
                maxY={0}
                beforeLines={BeforeLinesNetWorth}
            />
            <h3>FTI</h3>
            <LineGraph
                name="fti"
                lines={dataFti}
                width={320}
                height={180}
                {...dimensionsFti}
                maxY={Math.min(2000, 1.5 * dimensionsFti.maxY)}
                beforeLines={BeforeLinesFTI}
            />
        </>
    );
};

export default NetWorthGraph;
