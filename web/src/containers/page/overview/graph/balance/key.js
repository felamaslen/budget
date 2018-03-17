import React from 'react';
import { BaseKey } from '../helpers';
import {
    FONT_GRAPH_KEY_SMALL, COLOR_DARK, COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS
} from '../../../../../misc/config';
import { rgba } from '../../../../../misc/color';

export default function Key() {
    const [fontSize, fontFamily] = FONT_GRAPH_KEY_SMALL;

    return <BaseKey>
        <line x1={50} y1={40} x2={74} y2={40}
            stroke={rgba(COLOR_BALANCE_ACTUAL)} strokeWidth={2} />
        <text x={78} y={40}
            fill={rgba(COLOR_DARK)}
            fontFamily={fontFamily} fontSize={fontSize}
            alignmentBaseline="middle"
        >{'Actual'}</text>

        <line x1={130} y1={40} x2={154} y2={40}
            stroke={rgba(COLOR_BALANCE_PREDICTED)} strokeWidth={2} />
        <text x={158} y={40}
            fill={rgba(COLOR_DARK)}
            fontFamily={fontFamily} fontSize={fontSize}
            alignmentBaseline="middle"
        >{'Predicted'}</text>

        <rect x={50} y={54} width={24} height={6}
            fill={rgba(COLOR_BALANCE_STOCKS)} />
        <text x={78} y={57}
            fill={rgba(COLOR_DARK)}
            fontFamily={fontFamily} fontSize={fontSize}
            alignmentBaseline="middle"
        >{'Stocks'}</text>
    </BaseKey>;
}

