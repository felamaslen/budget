import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import { FONT_GRAPH_KEY } from '../../constants/graph';
import { COLOR_DARK, COLOR_GRAPH_TITLE } from '../../constants/colors';
import { rgba } from '../../helpers/color';

export default function NowLine({ now, minY, maxY, pixX, pixY }) {
    const nowLineX = Math.floor(pixX(now.ts / 1000)) + 0.5;

    const [fontSize, fontFamily] = FONT_GRAPH_KEY;

    return <g className="now-line">
        <line x1={nowLineX} y1={pixY(minY)} x2={nowLineX} y2={pixY(maxY)}
            stroke={rgba(COLOR_DARK)} strokeWidth={1} />

        <text x={nowLineX} y={pixY(maxY)} color={rgba(COLOR_GRAPH_TITLE)}
            fontSize={fontSize} fontFamily={fontFamily}>{'Now'}</text>
    </g>;
}

NowLine.propTypes = {
    now: PropTypes.instanceOf(DateTime).isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};
