import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';

export function Arrow({ xv, yv, color, minY, maxY, pixX, pixY }) {
    const xPix = pixX(xv);

    const direction = 2 * ((yv > 0) >> 0) - 1;
    const sizeRatio = yv > 0
        ? yv / maxY
        : yv / minY;

    const arrowWidth = 6 * (sizeRatio + 0.5);
    const arrowHeight = 10 * (sizeRatio + 0.5);

    const arrowBottom = pixY(yv) + direction * arrowHeight / 2;
    const arrowTop = pixY(yv) + direction * arrowHeight;

    const arrowPath = [
        ['M', xPix - arrowWidth, arrowTop],
        ['L', xPix, pixY(yv)],
        ['L', xPix + arrowWidth, arrowTop],
        ['L', xPix, pixY(yv) + direction * arrowHeight * 0.7]
    ]
        .map(([type, ...part]) => [type, ...part.map(value => value.toFixed(1))])
        .map(([type, ...part]) => `${type}${part.join(' ')}`)
        .concat(['Z'])
        .join(' ');

    return <g>
        <line x1={xPix} y1={pixY(0)} x2={xPix} y2={arrowBottom}
            stroke={color} strokeWidth={3 * sizeRatio} />

        <path d={arrowPath} stroke="none" fill={color} />
    </g>;
}

Arrow.propTypes = {
    xv: PropTypes.number.isRequired,
    yv: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};

export default function ArrowLine({ data, color, ...props }) {
    const getColor = typeof color === 'function'
        ? point => color(point)
        : () => color;

    const arrows = data.map((point, key) => (
        <Arrow key={key} xv={point.get(0)} yv={point.get(1)}
            color={getColor(point)} {...props} />
    ));

    return <g>{arrows}</g>;
}

ArrowLine.propTypes = {
    data: PropTypes.instanceOf(list).isRequired,
    color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]).isRequired
};

