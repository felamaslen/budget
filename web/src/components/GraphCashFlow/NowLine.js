import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { COLOR_DARK, COLOR_GRAPH_TITLE } from '~client/constants/colors';
import { rgba } from '~client/modules/color';

export default function NowLine({ now, minY, maxY, pixX, pixY }) {
    if (minY === maxY) {
        return null;
    }

    const nowLineX = Math.floor(pixX(now.ts / 1000)) + 0.5;

    const [fontSize, fontFamily] = FONT_GRAPH_KEY;

    return (
        <g>
            <line
                x1={nowLineX}
                y1={pixY(minY)}
                x2={nowLineX}
                y2={pixY(maxY)}
                stroke={rgba(COLOR_DARK)}
                strokeWidth={1}
            />

            <text
                x={nowLineX}
                y={pixY(maxY)}
                color={rgba(COLOR_GRAPH_TITLE)}
                fontSize={fontSize}
                fontFamily={fontFamily}
            >
                {'Now'}
            </text>
        </g>
    );
}

NowLine.propTypes = {
    now: PropTypes.instanceOf(DateTime).isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
};
