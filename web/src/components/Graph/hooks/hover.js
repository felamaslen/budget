import { useState, useCallback } from 'react';
import debounce from 'debounce';

import { rgba } from '~client/helpers/color';
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

function getClosest(lines, position, mvt) {
    if (!position) {
        return null;
    }

    const { posX, posY } = position;

    return lines.reduce((red, line, lineIndex) => {
        return line.get('data').reduce((last, point, index) => {
            const distX = mvt.pixX(point.get(0)) - posX;
            const distY = mvt.pixY(point.get(1)) - posY;

            const dist = (distX ** 2) + (distY ** 2);

            if (last && dist > last.dist) {
                return last;
            }

            return { dist, lineIndex, point, index };

        }, red);
    }, null);
}

const noop = () => null;

export function useHover({ props }) {
    const {
        lines,
        isMobile
    } = props;

    const [hlPoint, setHlPoint] = useState(null);

    const onHover = useCallback((position, mvt) => {
        if (!lines || isMobile) {
            return null;
        }

        const closest = getClosest(lines, position, mvt);
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
    }, [lines, isMobile]);

    const onMouseMove = useCallback(subProps => {
        const handler = debounce((pageX, pageY, currentTarget) => {
            const { left, top } = currentTarget.getBoundingClientRect();

            onHover({
                posX: pageX - left,
                posY: pageY - top
            }, subProps);

        }, 10, true);

        return evt => {
            const { pageX, pageY, currentTarget } = evt;

            return handler(pageX, pageY, currentTarget);
        };
    }, [onHover]);

    const onMouseLeave = useCallback(() => () => onHover(null), []);

    if (!props.hoverEffect) {
        return [null, noop, noop];
    }

    return [hlPoint, onMouseMove, onMouseLeave];
}

