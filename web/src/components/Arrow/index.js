import React from 'react';
import PropTypes from 'prop-types';

export default function Arrow({
    startX,
    startY,
    length,
    angle,
    arrowSize = 0,
    color,
    strokeWidth = 1,
    fill,
    dashed,
    pixX,
    pixY
}) {
    const arrowWidth = 6 * (arrowSize + 0.5);
    const arrowHeight = 10 * (arrowSize + 0.5);

    const radius = length - (arrowHeight + strokeWidth / 2) * 0.6;

    const cosA = Math.cos(angle);
    const sinA = -Math.sin(angle);

    const startPixX = pixX(startX);
    const startPixY = pixY(startY);

    const endPixX = startPixX + radius * cosA;
    const endPixY = startPixY + radius * sinA;

    const arrowHeadParts = [
        [-(arrowHeight - strokeWidth) * 0.3, -(arrowWidth - strokeWidth / 2)],
        [(arrowHeight - strokeWidth) * 0.6, 0],
        [-(arrowHeight - strokeWidth) * 0.3, arrowWidth - strokeWidth / 2],
        [0, 0]
    ]
        .map(([xPix, yPix]) => ([
            endPixX + (cosA * xPix - sinA * yPix),
            endPixY + (sinA * xPix + cosA * yPix)
        ]))
        .reduce((path, [xPix, yPix]) => {
            return `${path} L${xPix.toFixed(1)},${yPix.toFixed(1)}`;
        }, '');

    const arrowHead = `M${startPixX},${startPixY} L${endPixX},${endPixY} ${arrowHeadParts}`;

    const lineFill = fill
        ? color
        : 'none';

    return <g>
        <path d={arrowHead}
            stroke={color}
            fill={lineFill}
            strokeWidth={strokeWidth}
            strokeDasharray={dashed || null }
        />
    </g>;
}

Arrow.propTypes = {
    startX: PropTypes.number.isRequired,
    startY: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
    angle: PropTypes.number.isRequired,
    arrowSize: PropTypes.number,
    color: PropTypes.string.isRequired,
    strokeWidth: PropTypes.number,
    fill: PropTypes.bool,
    dashed: PropTypes.string,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};

