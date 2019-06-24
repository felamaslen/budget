import React from 'react';
import PropTypes from 'prop-types';
import Arrow from '~client/components/Arrow';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { COLOR_TRANSLUCENT_LIGHT, COLOR_DARK } from '~client/constants/colors';
import { formatCurrency } from '~client/modules/format';
import { rgba } from '~client/modules/color';
import {
    pixelPropTypes as allPixelPropTypes,
    rangePropTypes as allRangePropTypes
} from '~client/prop-types/graph';
import { targetsShape } from '~client/prop-types/graph/balance';

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

export default function Targets({ showAll, targets, minY, maxY, pixX, pixY }) {
    const tags = targets.map(({ tag, value }, index) => (
        <text key={tag}
            x={50}
            y={72 + 22 * index}
            fill={rgba(COLOR_DARK)}
            alignmentBaseline="hanging"
            fontFamily={fontFamily}
            fontSize={fontSize}
        >
            {`${formatCurrency(value, {
                raw: true, noPence: true, abbreviate: true, precision: 0
            })} (${tag})`}
        </text>
    ));

    const monthWidth = pixX(2628000) - pixX(0);

    const arrows = minY !== maxY && targets.map(({ tag, date, value, from, months, last }, index) => (
        <Arrow key={tag}
            startX={date}
            startY={from}
            length={100 * (1 + index) * 0.8 ** (showAll >> 0)}
            angle={Math.atan2(pixY(from) - pixY(value), monthWidth * (months + last))}
            color={rgba(COLOR_DARK)}
            strokeWidth={1}
            arrowSize={months / 24}
            minY={minY}
            maxY={maxY}
            pixX={pixX}
            pixY={pixY}
        />
    ));

    return (
        <g className="savings-targets">
            <rect x={48} y={70} width={100} height={targets.size * 22 + 4}
                fill={rgba(COLOR_TRANSLUCENT_LIGHT)} />
            {tags}
            {arrows}
        </g>
    );
}

const { valX, valY, ...pixelPropTypes } = allPixelPropTypes;
const { minX, maxX, ...rangePropTypes } = allRangePropTypes;

Targets.propTypes = {
    ...pixelPropTypes,
    ...rangePropTypes,
    showAll: PropTypes.bool,
    targets: targetsShape
};
