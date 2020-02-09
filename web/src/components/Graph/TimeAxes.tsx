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
import { getTimeScale } from '~client/components/Graph/helpers';

const [fontSize, fontFamily] = FONT_AXIS_LABEL;

type IProps = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    pixX: (x: number) => number;
    pixY: (y: number) => number;
    offset?: number;
    tickSizeY?: number;
    hideMinorTicks?: boolean;
    yAlign?: 'left' | 'right';
    labelY?: (value: number) => string;
};

type TimeScale = {
    pix: number;
    major: 0 | 1 | 2;
    text: string;
}[];

function getTicksY({
    minY,
    maxY,
    pixY,
    tickSizeY = 0,
    hideMinorTicks,
}: IProps): {
    pos: number;
    major: boolean;
    value: number;
}[] {
    const minorTicks = hideMinorTicks ? 1 : 5;

    const tickSize = tickSizeY || getTickSize(minY, maxY, 5 * minorTicks);
    const majorTickSize = tickSize * minorTicks;
    const tickStart = Math.floor(minY / tickSize) * tickSize;

    const numTicks = Math.ceil((maxY - minY) / tickSize);
    if (numTicks > 50) {
        return [];
    }

    return new Array(numTicks + 1).fill(0).map((item, index) => {
        const value = tickStart + index * tickSize;
        const pos = Math.floor(pixY(value)) + 0.5;

        const major = value % majorTickSize === 0;

        return { pos, major, value };
    });
}

const axisColor = rgba(COLOR_LIGHT_GREY);
const lightColor = rgba(COLOR_LIGHT);

const defaultLabelY = value =>
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

const TimeAxes: React.FunctionComponent<IProps> = props => {
    const {
        minX,
        minY,
        maxX,
        maxY,
        pixX,
        pixY,
        offset = 0,
        hideMinorTicks = false,
        yAlign = 'left',
        labelY = defaultLabelY,
    } = props;

    const ticksY = getTicksY(props);
    const x0 = pixX(minX);
    const xMax = pixX(maxX);
    const y0 = pixY(minY);

    const ticksYMajor = ticksY
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
        ));

    const ticksYMinor = ticksY
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
        ));

    const valueTicksXPos = yAlign === 'left' ? x0 : xMax;

    const ticksYText = ticksY
        .filter(({ major }) => major)
        .map(({ value, pos }) => (
            <text
                key={pos}
                x={valueTicksXPos}
                textAnchor={yAlign === 'left' ? 'start' : 'end'}
                y={pos - 2}
                fontFamily={fontFamily}
                fontSize={fontSize}
                alignmentBaseline="baseline"
            >
                {labelY(value)}
            </text>
        ));

    const timeScale: TimeScale = getTimeScale({ minX, maxX, pixX })(offset);

    const ticksXForeground = timeScale.map(({ pix, major }) => (
        <line
            key={pix}
            x1={pix}
            y1={y0}
            x2={pix}
            y2={y0 - timeTickSize(major)}
            stroke={timeTickColor(major)}
            strokeWidth={1}
        />
    ));

    const ticksXBackground = timeScale
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
        ));

    const ticksXText = timeScale
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
        ));

    return (
        <g>
            <g>{ticksYMajor}</g>
            {!hideMinorTicks && <g>{ticksYMinor}</g>}
            <g>{ticksYText}</g>
            <g>{ticksXBackground}</g>
            <g>{ticksXForeground}</g>
            <g>{ticksXText}</g>
        </g>
    );
};

export default TimeAxes;
