import React from 'react';
import { COLOR_LIGHT, COLOR_DARK, COLOR_LIGHT_GREY, COLOR_GRAPH_TITLE } from '~client/constants/colors';
import { GRAPH_CASHFLOW_NUM_TICKS, FONT_AXIS_LABEL } from '~client/constants/graph';
import { rgba } from '~client/modules/color';
import { getTickSize, formatCurrency } from '~client/modules/format';
import { getTimeScale } from '~client/components/Graph/helpers';
import { pixelPropTypes } from '~client/prop-types/graph';

function getTicksY(numMajorTicks = GRAPH_CASHFLOW_NUM_TICKS) {
    return (minY, maxY, pixY) => {
        const minorTicks = 5;
        const numTicks = numMajorTicks * minorTicks;

        const tickSize = getTickSize(minY, maxY, numTicks);
        const keyOffset = Math.ceil(minY / tickSize);

        return new Array(numTicks)
            .fill(0)
            .map((item, tickKey) => {
                const key = tickKey + keyOffset;

                const pos = Math.floor(pixY(key * tickSize)) + 0.5;
                const major = key % minorTicks === 0;
                const value = key * tickSize;

                return { pos, major, value };
            });
    };
}

export default function Axes({ minX, maxX, minY, maxY, pixX, pixY }) {
    if (maxY === minY || maxX === minX) {
        return null;
    }

    const x0 = pixX(minX);
    const xMax = pixX(maxX);
    const y0 = pixY(minY);

    const ticksY = getTicksY()(minY, maxY, pixY);

    const axisColor = rgba(COLOR_LIGHT_GREY);
    const lightColor = rgba(COLOR_LIGHT);

    const valueTicksMajor = ticksY.filter(({ major }) => major)
        .map(({ pos }) => (
            <line key={pos}
                x1={x0} y1={pos} x2={xMax} y2={pos}
                stroke={axisColor} strokeWidth={1}
            />
        ));

    const valueTicksBackground = ticksY.filter(({ major }) => !major)
        .map(({ pos }) => (
            <line key={pos}
                x1={x0} y1={pos} x2={xMax} y2={pos}
                stroke={lightColor} strokeWidth={1}
            />
        ));

    const timeScale = getTimeScale({ minX, maxX, pixX })(0);

    const tickLength = 10;

    const timeTickColors = [rgba(COLOR_GRAPH_TITLE), rgba(COLOR_DARK)];
    const timeLineColors = [lightColor, rgba(COLOR_LIGHT_GREY)];

    const timeTickColor = major => timeTickColors[(major > 0) >> 0];
    const timeLineColor = major => timeLineColors[(major > 1) >> 0];

    const tickSize = major => tickLength * 0.5 * (major + 1);

    const timeTicksBackground = timeScale.map(({ pix, major }) => (
        <line key={pix}
            x1={pix} y1={y0 - tickSize(major)} x2={pix} y2={0}
            stroke={timeLineColor(major)} strokeWidth={0.5}
        />
    ));

    const timeTicksAxis = timeScale.map(({ pix, major }) => (
        <line key={pix}
            x1={pix} y1={y0} x2={pix} y2={y0 - tickSize(major)}
            stroke={timeTickColor(major)} strokeWidth={1}
        />
    ));

    const [fontSize, fontFamily] = FONT_AXIS_LABEL;

    const transformText = (xPix, yPix) => `rotate(-30 ${xPix} ${yPix})`;

    const timeTicksText = timeScale.filter(({ text }) => text)
        .map(({ text, pix, major }) => (
            <text key={pix} x={pix} y={y0 - tickSize(major)}
                fontFamily={fontFamily} fontSize={fontSize} alignmentBaseline="baseline"
                transform={transformText(pix, y0 - tickSize(major))}
            >
                {text}
            </text>
        ));

    const valueTicksText = ticksY.filter(({ major }) => major)
        .map(({ value, pos }) => (
            <text key={pos} x={x0} y={pos - 2}
                fontFamily={fontFamily} fontSize={fontSize} alignmentBaseline="baseline"
            >
                {formatCurrency(value, { raw: true, noPence: true, abbreviate: true, precision: 1 })}
            </text>
        ));

    return (
        <g className="axes">
            <g className="value-ticks-bg">
                {valueTicksBackground}
            </g>
            <g className="time-ticks-bg">
                {timeTicksBackground}
            </g>
            <g className="value-ticks-major">
                {valueTicksMajor}
            </g>
            <g className="time-ticks-axis">
                {timeTicksAxis}
            </g>
            <g className="time-ticks-text">
                {timeTicksText}
            </g>
            <g className="value-ticks-text">
                {valueTicksText}
            </g>
        </g>
    );
}

const { valX, valY, ...propTypes } = pixelPropTypes;

Axes.propTypes = {
    ...propTypes
};
