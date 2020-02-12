import React from 'react';

import { getTickSize, formatCurrency } from '~client/modules/format';
import {
    COLOR_LIGHT,
    COLOR_DARK,
    COLOR_LIGHT_GREY,
    COLOR_GRAPH_TITLE,
} from '~client/constants/colors';
import { FONT_AXIS_LABEL } from '~client/constants/graph';
import { rgba } from '~client/modules/color';
import { getTimeScale } from '~client/components/graph/helpers';
import { Range, Pix, TimeScale } from '~client/types/graph';

const [fontSize, fontFamily] = FONT_AXIS_LABEL;

export type LabelY = (value: number) => string;

type Props = {
    dualAxis?: boolean;
    offset?: number;
    tickSizeY?: number;
    hideMinorTicks?: boolean;
    yAlign?: 'left' | 'right';
    labelY?: LabelY;
} & Range &
    Pix;

type YAxisProps = {
    x0: number;
    xMax: number;
    min: number;
    max: number;
    pix: (value: number) => number;
    hideMinorTicks: boolean;
    tickSizeY: number;
    labelY: LabelY;
    align: 'left' | 'right';
    alignPos: number;
};

type TicksY = {
    pos: number;
    major: boolean;
    value: number;
}[];

function getTicksY({ min, max, pix, tickSizeY = 0, hideMinorTicks }: YAxisProps): TicksY {
    const minorTicks = hideMinorTicks ? 1 : 5;

    const tickSize = tickSizeY || getTickSize(min, max, 5 * minorTicks);
    const majorTickSize = tickSize * minorTicks;
    const tickStart = Math.floor(min / tickSize) * tickSize;

    const numTicks = Math.ceil((max - min) / tickSize);
    if (numTicks > 50) {
        return [];
    }

    return new Array(numTicks + 1).fill(0).map((item, index) => {
        const value = tickStart + index * tickSize;
        const pos = Math.floor(pix(value)) + 0.5;

        const major = value % majorTickSize === 0;

        return { pos, major, value };
    });
}

const axisColor = rgba(COLOR_LIGHT_GREY);
const lightColor = rgba(COLOR_LIGHT);

const defaultLabelY = (value: number): string =>
    formatCurrency(value, {
        raw: true,
        noPence: true,
        abbreviate: true,
        precision: 1,
    });

const timeTickLength = 10;
const timeTickSize = (major: 0 | 1 | 2): number => timeTickLength * 0.5 * (major + 1);

const timeLineColors: string[] = [lightColor, rgba(COLOR_LIGHT_GREY)];
const timeLineColor = (major: 0 | 1 | 2): string => timeLineColors[major > 1 ? 1 : 0];

const timeTickColors: string[] = [rgba(COLOR_GRAPH_TITLE), rgba(COLOR_DARK)];
const timeTickColor = (major: 0 | 1 | 2): string => timeTickColors[major > 0 ? 1 : 0];

const transformText = (xPix: number, yPix: number): string => `rotate(-30 ${xPix} ${yPix})`;

type YAxisPartProps = {
    ticksY: TicksY;
};

type YAxisTicksProps = YAxisPartProps & {
    x0: number;
    xMax: number;
};

const TicksYMajor: React.FC<YAxisTicksProps> = ({ x0, xMax, ticksY }) => (
    <g>
        {ticksY
            .filter(({ major }) => major)
            .map(({ pos }) => (
                <line
                    key={pos}
                    x1={x0}
                    y1={pos}
                    x2={xMax}
                    y2={pos}
                    stroke={axisColor}
                    strokeWidth={1}
                />
            ))}
    </g>
);

const TicksYMinor: React.FC<YAxisTicksProps> = ({ x0, xMax, ticksY }) => (
    <g>
        {ticksY
            .filter(({ major }) => !major)
            .map(({ pos }) => (
                <line
                    key={pos}
                    x1={x0}
                    y1={pos}
                    x2={xMax}
                    y2={pos}
                    stroke={lightColor}
                    strokeWidth={1}
                />
            ))}
    </g>
);

type YAxisTextProps = YAxisPartProps & {
    align: 'left' | 'right';
    alignPos: number;
    labelY: LabelY;
};

const TicksYText: React.FC<YAxisTextProps> = ({ ticksY, labelY, align, alignPos }) => (
    <g>
        {ticksY
            .filter(({ major }) => major)
            .map(({ value, pos }) => (
                <text
                    key={pos}
                    x={alignPos}
                    textAnchor={align === 'left' ? 'start' : 'end'}
                    y={pos - 2}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    alignmentBaseline="baseline"
                >
                    {labelY(value)}
                </text>
            ))}
    </g>
);

const YAxis: React.FC<YAxisProps> = props => {
    const { x0, xMax, align, alignPos, hideMinorTicks, labelY } = props;
    const ticksY = getTicksY(props);

    return (
        <>
            <TicksYMajor x0={x0} xMax={xMax} ticksY={ticksY} />
            {!hideMinorTicks && <TicksYMinor x0={x0} xMax={xMax} ticksY={ticksY} />}
            <TicksYText ticksY={ticksY} labelY={labelY} align={align} alignPos={alignPos} />
        </>
    );
};

type TicksXProps = {
    timeScale: TimeScale;
    y0: number;
};

type TicksXBackgroundProps = TicksXProps & {
    hideMinorTicks: boolean;
};

const TicksXBackground: React.FC<TicksXBackgroundProps> = ({ timeScale, y0, hideMinorTicks }) => (
    <g>
        {timeScale
            .filter(({ major }) => major || !hideMinorTicks)
            .map(({ pix, major }) => (
                <line
                    key={pix}
                    x1={pix}
                    y1={y0 - timeTickSize(major)}
                    x2={pix}
                    y2={0}
                    stroke={timeLineColor(major)}
                    strokeWidth={0.5}
                />
            ))}
    </g>
);

type TicksXForegroundProps = TicksXProps;

const TicksXForeground: React.FC<TicksXForegroundProps> = ({ timeScale, y0 }) => {
    return (
        <g>
            {timeScale.map(({ pix, major }) => (
                <line
                    key={`${pix}-${major}`}
                    x1={pix}
                    y1={y0}
                    x2={pix}
                    y2={y0 - timeTickSize(major)}
                    stroke={timeTickColor(major)}
                    strokeWidth={1}
                />
            ))}
        </g>
    );
};

type TicksXTextProps = TicksXProps;

const TicksXText: React.FC<TicksXTextProps> = ({ timeScale, y0 }) => (
    <g>
        {timeScale
            .filter(({ text }) => text)
            .map(({ text, pix, major }) => (
                <text
                    key={pix}
                    x={pix}
                    y={y0 - timeTickSize(major)}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    alignmentBaseline="baseline"
                    transform={transformText(pix, y0 - timeTickSize(major))}
                >
                    {text}
                </text>
            ))}
    </g>
);

export const TimeAxes: React.FC<Props> = props => {
    const {
        minX,
        minY,
        minY2 = minY,
        maxX,
        maxY,
        maxY2 = maxY,
        pixX,
        pixY1,
        pixY2,
        offset = 0,
        dualAxis,
        hideMinorTicks = false,
        tickSizeY = 0,
        yAlign = 'left',
        labelY = defaultLabelY,
    } = props;

    if (minY === maxY || minY2 === maxY2) {
        return null;
    }

    const x0 = pixX(minX);
    const xMax = pixX(maxX);
    const y0 = pixY1(minY);

    const timeScale: TimeScale = getTimeScale({ minX, maxX, pixX })(offset);

    const yAxisProps = {
        hideMinorTicks,
        tickSizeY,
        labelY,
        x0,
        xMax,
    };

    const alignPrimary = yAlign === 'left' ? 'left' : 'right';
    const alignSecondary = yAlign === 'right' ? 'left' : 'right';

    const [alignPosPrimary, alignPosSecondary] = yAlign === 'left' ? [x0, xMax] : [xMax, x0];

    return (
        <g>
            <YAxis
                min={minY}
                max={maxY}
                pix={pixY1}
                align={alignPrimary}
                alignPos={alignPosPrimary}
                {...yAxisProps}
            />
            {dualAxis && (
                <YAxis
                    min={minY2}
                    max={maxY2}
                    pix={pixY2}
                    align={alignSecondary}
                    alignPos={alignPosSecondary}
                    {...yAxisProps}
                />
            )}
            <TicksXBackground y0={y0} timeScale={timeScale} hideMinorTicks={hideMinorTicks} />
            <TicksXForeground y0={y0} timeScale={timeScale} />
            <TicksXText y0={y0} timeScale={timeScale} />
        </g>
    );
};
