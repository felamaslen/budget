import React from 'react';
import { DateTime } from 'luxon';

import { LineGraph } from '~client/components/graph/line-graph';
import { TimeAxes } from '~client/components/graph/time-axes';
import { Pix, Range, Dimensions, Line } from '~client/types/graph';

import * as Styled from './styles';

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

type BeforeLinesProps = Pix & Range & Dimensions;

const labelY = (value: number): string => String(value);

type AxisProps = {
    labelY?: (value: number) => string;
    hideMinorTicks?: boolean;
};

const makeBeforeLines = (axisProps: AxisProps = {}): React.FC<BeforeLinesProps> => {
    const BeforeLines: React.FC<BeforeLinesProps> = props => (
        <TimeAxes {...props} yAlign="right" {...axisProps} />
    );

    return BeforeLines;
};

const BeforeLinesFTI = makeBeforeLines({ labelY });
const BeforeLinesNetWorth = makeBeforeLines({
    hideMinorTicks: true,
});

const dimensions = (lines: Line[]): Range => ({
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

export const NetWorthGraph: React.FC<GraphProps> = ({ table }) => {
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

    const dataNetWorth = React.useMemo<[Line, Line, Line]>(
        () => [
            {
                key: 'assets',
                data: table.map(({ date, assets }) => [date.toSeconds(), assets]),
                color: 'darkgreen',
                smooth: true,
            },
            {
                key: 'liabilities',
                data: table.map(({ date, liabilities }) => [date.toSeconds(), -liabilities]),
                secondary: true,
                color: 'darkred',
                smooth: true,
            },
            {
                key: 'expenses',
                data: table.map(({ date, expenses }) => [date.toSeconds(), -expenses]),
                secondary: true,
                color: 'blueviolet',
                smooth: true,
            },
        ],
        [table],
    );

    const dimensionsNetWorthLeft = dimensions(dataNetWorth.slice(1));
    const dimensionsNetWorthRight = dimensions(dataNetWorth.slice(0, 1));

    return (
        <>
            <h3>Assets</h3>
            <LineGraph
                name="assets"
                lines={dataNetWorth.slice(0, 1)}
                width={320}
                height={100}
                {...dimensionsNetWorthRight}
                minY={0}
                beforeLines={BeforeLinesNetWorth}
            />
            <h3>
                <span style={{ color: 'darkred' }}>Liabilities</span> /{' '}
                <span style={{ color: 'blueviolet' }}>Expenses</span>
            </h3>
            <LineGraph
                name="liabilities"
                lines={dataNetWorth.slice(1)}
                width={320}
                height={128}
                {...dimensionsNetWorthLeft}
                minY2={dimensionsNetWorthLeft.minY}
                maxY2={0}
                beforeLines={BeforeLinesNetWorth}
            />
            <Styled.FTILabel>
                FTI
                <Styled.FTIFormula>
                    <Styled.FTIEquals>=</Styled.FTIEquals>
                    <Styled.FTIFraction>
                        <Styled.FTIFormulaNumerator>
                            Net worth &times; Age
                        </Styled.FTIFormulaNumerator>
                        <Styled.FTIFormulaDenominator>Expenses</Styled.FTIFormulaDenominator>
                    </Styled.FTIFraction>
                </Styled.FTIFormula>
            </Styled.FTILabel>
            <LineGraph
                name="fti"
                lines={dataFti}
                width={320}
                height={180}
                padding={[0, 0, 0, 0]}
                {...dimensionsFti}
                maxY={Math.min(2000, 1.5 * dimensionsFti.maxY)}
                beforeLines={BeforeLinesFTI}
            />
        </>
    );
};
