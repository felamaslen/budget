import React from 'react';
import PropTypes from 'prop-types';

export default function Arrow({
    startX,
    startY,
    length,
    angle,
    arrowWidth = 6,
    arrowHeight = 10,
    color,
    strokeWidth = 1,
    pixX,
    pixY
}) {
    const radius = length - arrowHeight / 2;

    const cosA = Math.cos(angle);
    const sinA = -Math.sin(angle);

    const startPixX = pixX(startX);
    const startPixY = pixY(startY);

    const endPixX = startPixX + radius * cosA;
    const endPixY = startPixY + radius * sinA;

    const arrowHeadParts = [
        [-arrowHeight / 2, -arrowWidth],
        [arrowHeight / 2, 0],
        [-arrowHeight / 2, arrowWidth],
        [-arrowHeight * 0.2, 0]
    ]
        .map(([xPix, yPix]) => ([
            endPixX + (cosA * xPix - sinA * yPix),
            endPixY + (sinA * xPix + cosA * yPix)
        ]))
        .reduce((path, [xPix, yPix], index) => {
            const partKey = index
                ? 'L'
                : 'M';

            return `${path} ${partKey}${xPix.toFixed(1)},${yPix.toFixed(1)}`;
        }, '');

    const arrowHead = `${arrowHeadParts}Z`;

    return <g>
        <line x1={startPixX} y1={startPixY} x2={endPixX} y2={endPixY}
            stroke={color} strokeWidth={strokeWidth} />
        <path d={arrowHead} stroke="none" fill={color} />
    </g>;
}

Arrow.propTypes = {
    startX: PropTypes.number.isRequired,
    startY: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
    angle: PropTypes.number.isRequired,
    arrowWidth: PropTypes.number,
    arrowHeight: PropTypes.number,
    color: PropTypes.string.isRequired,
    strokeWidth: PropTypes.number,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};

