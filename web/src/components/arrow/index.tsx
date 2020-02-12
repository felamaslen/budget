import React from 'react';
import { PixX, SVGPathProps } from '~client/types/graph';

type Props = {
    startX: number;
    startY: number;
    length: number;
    angle: number;
    arrowSize?: number;
    color: string;
    fill?: boolean;
    pixY: (y: number) => number;
} & PixX &
    SVGPathProps;

export const Arrow: React.FC<Props> = ({
    startX,
    startY,
    length,
    angle,
    arrowSize = 0,
    color,
    strokeWidth = 1,
    fill,
    strokeDasharray,
    pixX,
    pixY,
}) => {
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
        [0, 0],
    ]
        .map(([xPix, yPix]) => [
            endPixX + (cosA * xPix - sinA * yPix),
            endPixY + (sinA * xPix + cosA * yPix),
        ])
        .reduce((path, [xPix, yPix]) => `${path} L${xPix.toFixed(1)},${yPix.toFixed(1)}`, '');

    const arrowHead = `M${startPixX},${startPixY} L${endPixX},${endPixY} ${arrowHeadParts}`;

    const lineFill = fill ? color : 'none';

    return (
        <g>
            <path
                d={arrowHead}
                stroke={color}
                fill={lineFill}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
            />
        </g>
    );
};
