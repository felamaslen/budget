import React from 'react';
import { DateTime } from 'luxon';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { COLOR_DARK, COLOR_GRAPH_TITLE } from '~client/constants/colors';
import { rgba } from '~client/modules/color';
import { Pix, RangeY } from '~client/types/graph';

type Props = {
    now: DateTime;
} & Pix &
    RangeY;

export const NowLine: React.FC<Props> = ({ now, minY, maxY, pixX, pixY1 }) => {
    if (minY === maxY) {
        return null;
    }

    const nowLineX = Math.floor(pixX(now.toSeconds())) + 0.5;

    const [fontSize, fontFamily] = FONT_GRAPH_KEY;

    return (
        <g>
            <line
                x1={nowLineX}
                y1={pixY1(minY)}
                x2={nowLineX}
                y2={pixY1(maxY)}
                stroke={rgba(COLOR_DARK)}
                strokeWidth={1}
            />

            <text
                x={nowLineX}
                y={pixY1(maxY)}
                color={rgba(COLOR_GRAPH_TITLE)}
                fontSize={fontSize}
                fontFamily={fontFamily}
            >
                {'Now'}
            </text>
        </g>
    );
};
