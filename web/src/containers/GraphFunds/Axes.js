import React from 'react';
import PropTypes from 'prop-types';
import { FONT_AXIS_LABEL } from '../../constants/graph';
import { COLOR_LIGHT_MED, COLOR_DARK, COLOR_GRAPH_TITLE } from '../../constants/colors';
import { rgba } from '../../helpers/color';
import { formatValue } from '../../helpers/funds';
import { getTimeScale } from '../../components/Graph/LineGraph';

function calculateTicksY({ tickSizeY, minY, maxY, pixY }) {
    // calculate tick range
    const numTicks = typeof tickSizeY === 'undefined' || isNaN(tickSizeY)
        ? 0
        : Math.floor((maxY - minY) / tickSizeY);

    if (!numTicks) {
        return [];
    }

    return new Array(numTicks)
        .fill(0)
        .map((item, key) => {
            const value = minY + (key + 1) * tickSizeY;
            const pos = Math.floor(pixY(value)) + 0.5;

            return { value, pos };
        });
}

export default function Axes(props) {
    const textColor = rgba(COLOR_DARK);
    const [fontSize, fontFamily] = FONT_AXIS_LABEL;

    const { startTime, mode, minX, maxX, minY, maxY, pixX, pixY } = props;

    const x0 = pixX(minX);
    const xMax = pixX(maxX);
    const y0 = pixY(minY);
    const yMax = pixY(maxY);

    const tickSize = 10;
    const tickAngle = -30;
    const transformText = (xPix, yPix) => `rotate(${tickAngle} ${xPix} ${yPix})`;

    const axisColor = value => {
        if (value === 0) {
            return rgba(COLOR_DARK);
        }

        return rgba(COLOR_LIGHT_MED);
    };

    const ticksY = calculateTicksY(props).map(({ pos, value }) => (
        <g key={value}>
            <line x1={x0} y1={pos} x2={xMax} y2={pos}
                stroke={axisColor(value)} strokeWidth={1} />
            <text x={xMax} y={pos - 2} color={textColor}
                fontSize={fontSize} fontFamily={fontFamily}
                alignmentBaseline="baseline" textAnchor="end">{formatValue(value, mode)}</text>
        </g>
    ));

    const timeTicks = getTimeScale(props)(startTime);

    const tickColors = [rgba(COLOR_DARK), rgba(COLOR_GRAPH_TITLE)];
    const getColor = major => tickColors[(major > 0) >> 0];
    const getTickSize = major => tickSize * 0.5 * (major + 1);

    const timeTicksSmall = timeTicks.map(({ pix, major }, key) => (
        <line key={key} x1={pix} y1={y0} x2={pix} y2={y0 - getTickSize(major)}
            stroke={getColor(major)} strokeWidth={1} />
    ));

    const timeTicksMajor = timeTicks.filter(({ major }) => major > 1)
        .map(({ pix, major }, key) => (
            <line key={key} x1={pix} y1={y0 - getTickSize(major)} x2={pix} y2={yMax}
                stroke={axisColor} strokeWidth={1} />
        ));

    const timeTicksText = timeTicks.filter(({ text }) => text)
        .map(({ text, pix, major }) => (
            <text key={pix} x={pix} y={y0 - getTickSize(major)}
                fontFamily={fontFamily} fontSize={fontSize} alignmentBaseline="baseline"
                transform={transformText(pix, y0 - getTickSize(major))}
            >{text}</text>
        ));

    return <g className="axes">
        <g>{ticksY}</g>
        <g>{timeTicksSmall}</g>
        <g>{timeTicksMajor}</g>
        <g>{timeTicksText}</g>
    </g>;
}

Axes.propTypes = {
    startTime: PropTypes.number.isRequired,
    tickSizeY: PropTypes.number,
    mode: PropTypes.number.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    minX: PropTypes.number.isRequired,
    maxX: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};

