import { useState, useCallback, useMemo } from 'react';
import debounce from 'debounce';

import { rgba } from '~client/modules/color';
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
        return line.get('data').reduce((last, point, index) => {
            const distX = Math.abs(calc.pixX(point.get(0)) - posX);
            const distY = Math.abs(calc.pixY(point.get(1)) - posY);

            if (last && !(distX < last.distX || (distX === last.distX && distY < last.distY))) {
                return last;
            }

            return { distX, distY, lineIndex, point, index };

        }, red);
    }, null);
}

const noop = () => null;

export function useHover({ lines, isMobile, calc, hoverEffect }) {
    const [hlPoint, setHlPoint] = useState(null);

    const onHover = useCallback(position => {
        if (!calc || !lines || isMobile) {
            return null;
        }

        const closest = getClosest(lines, position, calc);
        if (!closest) {
            return setHlPoint(null);
        }

        const { lineIndex, point, index } = closest;
        const color = getHlColor(lines.getIn([lineIndex, 'color']), point, index);

        return setHlPoint({
            valX: point.get(0),
            valY: point.get(1),
            color
        });
    }, [lines, isMobile, calc]);

    const onMouseMove = useMemo(() => {
        const handler = debounce((pageX, pageY, currentTarget) => {
            const { left, top } = currentTarget.getBoundingClientRect();

            onHover({
                posX: pageX - left,
                posY: pageY - top
            });

        }, 10, true);

        return evt => {
            const { pageX, pageY, currentTarget } = evt;

            return handler(pageX, pageY, currentTarget);
        };
    }, [onHover]);

    const onMouseLeave = useCallback(() => setHlPoint(null), [setHlPoint]);

    if (!hoverEffect) {
        return [null, noop, noop];
    }

    return [hlPoint, onMouseMove, onMouseLeave];
}
