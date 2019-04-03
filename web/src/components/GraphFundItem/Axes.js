import React from 'react';
import PropTypes from 'prop-types';
import { FONT_AXIS_LABEL } from '~client/constants/graph';
import { COLOR_DARK } from '~client/constants/colors';
import { rgba } from '~client/modules/color';

export default function Axes({ popout, minX, minY, maxY, height, pixX, pixY }) {
    if (!popout) {
        return null;
    }

    const range = maxY - minY;
    const increment = Math.round(Math.max(20, height / range) / (height / range) / 2) * 2;
    const start = Math.ceil(minY / increment) * increment;
    const numTicks = Math.ceil(range / increment);

    if (!numTicks) {
        return null;
    }

    const x0 = pixX(minX);
    const [fontSize, fontFamily] = FONT_AXIS_LABEL;
    const fontColor = rgba(COLOR_DARK);

    const ticks = new Array(numTicks).fill(0)
        .map((tick, key) => {
            const tickValue = start + key * increment;
            const tickPos = Math.floor(pixY(tickValue)) + 0.5;
            const tickName = `${tickValue.toFixed(1)}p`;

            return <text key={tickName}
                x={x0} y={tickPos} color={fontColor}
                fontSize={fontSize} fontFamily={fontFamily}>{tickName}</text>;
        });

    return <g className="axes">{ticks}</g>;
}

Axes.propTypes = {
    popout: PropTypes.bool.isRequired,
    minX: PropTypes.number.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};


