import { useState, useCallback, useMemo } from 'react';
import { throttle } from 'throttle-debounce';

import { rgba } from '~client/modules/color';
import { NULL } from '~client/modules/data';
import { COLOR_GRAPH_TITLE } from '~client/constants/colors';

function getHlColor(color, point, index) {
    if (typeof color === 'string') {
        return color;
    }
    if (typeof color === 'function') {
        return color(point, index);
    }

    return rgba(COLOR_GRAPH_TITLE);
}

function getClosest(lines, position, calc) {
    if (!position) {
        return null;
    }

    const { posX, posY } = position;

    return lines.reduce((red, line, lineIndex) => {
        return line.data.reduce((last, point, index) => {
            const distX = Math.abs(calc.pixX(point[0]) - posX);
            const distY = Math.abs(calc.pixY(point[1]) - posY);

            if (last && !(distX < last.distX || (distX === last.distX && distY < last.distY))) {
                return last;
            }

            return { distX, distY, lineIndex, point, index };

        }, red);
    }, null);
}

export function useHover({ lines, isMobile, calc, hoverEffect }) {
    const [hlPoint, setHlPoint] = useState(null);

    const onHover = useCallback(position => {
        if (!(calc && lines && !isMobile)) {
            return null;
        }

        const closest = getClosest(lines, position, calc);
        if (!closest) {
            return setHlPoint(null);
        }

        const { lineIndex, point, index } = closest;
        const color = getHlColor(lines[lineIndex].color, point, index);
        const [valX, valY] = point;

        return setHlPoint({ valX, valY, color });
    }, [lines, isMobile, calc]);

    const onMouseMove = useMemo(() => {
        const handler = throttle(10, true, (pageX, pageY, currentTarget) => {
            const { left, top } = currentTarget.getBoundingClientRect();

            onHover({
                posX: pageX - left,
                posY: pageY - top
            });
        });

        return ({ pageX, pageY, currentTarget }) => handler(pageX, pageY, currentTarget);
    }, [onHover]);

    const onMouseLeave = useCallback(() => setHlPoint(null), []);

    if (!hoverEffect) {
        return [null, NULL, NULL];
    }

    return [hlPoint, onMouseMove, onMouseLeave];
}
