import React from 'react';
import PropTypes from 'prop-types';
import BaseKey from '../GraphCashFlow/BaseKey';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { COLOR_SPENDING, COLOR_TRANSLUCENT_LIGHT, COLOR_DARK } from '~client/constants/colors';
import { rgba } from '~client/modules/color';

export default function Key({ pixX, pixY, maxX, minY, maxY, title }) {
    const [fontSize, fontFamily] = FONT_GRAPH_KEY;

    const future0 = pixX(Date.now() / 1000);
    const future1 = pixY(maxY);
    const futureW = pixX(maxX) - future0;
    const futureH = pixY(minY) - future1;

    return <BaseKey title={title}>
        <line x1={50} y1={40} x2={74} y2={40}
            stroke={rgba(COLOR_SPENDING)} strokeWidth={2} />
        <text x={78} y={40}
            fill={rgba(COLOR_DARK)}
            fontFamily={fontFamily}
            fontSize={fontSize}
            alignmentBaseline="middle"
        >{'Spending'}</text>

        <rect x={future0} y={future1} width={futureW} height={futureH}
            fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />
    </BaseKey>;
}

Key.propTypes = {
    title: PropTypes.string.isRequired,
    maxX: PropTypes.number.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};
