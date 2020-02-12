import { useState, useCallback, useMemo } from 'react';
import { throttle } from 'throttle-debounce';

import { rgba } from '~client/modules/color';
import { NULL } from '~client/modules/data';
import { COLOR_GRAPH_TITLE } from '~client/constants/colors';
import { Point, Line, Calc, LineColor, isConstantColor } from '~client/types/graph';
import { getPixY } from '~client/components/graph/helpers';

function getHlColor(color: LineColor, point: Point, index: number): string {
    if (isConstantColor(color)) {
        return color;
    }
    if (typeof color === 'function') {
        return color(point, index);
    }

    return rgba(COLOR_GRAPH_TITLE);
}

type Position = {
    posX: number;
    posY: number;
};

type Closest = {
    distX: number;
    distY: number;
    lineIndex: number;
    point: Point;
    index: number;
};

export type HoverEffect = {
    labelX: (value: number) => string;
    labelY: (value: number) => string;
    labelWidthX?: number;
    labelWidthY?: number;
};

export type HLPoint = {
    valX: number;
    valY: number;
    color: string;
};

function getClosest(lines: Line[], position: Position, calc: Calc): Closest | null {
    if (!position) {
        return null;
    }

    const { posX, posY } = position;

    return lines.reduce((red: Closest | null, line: Line, lineIndex: number) => {
        const pixY = getPixY(calc, line.secondary);

        return line.data.reduce((last: Closest | null, point: Point, index: number): Closest => {
            const distX = Math.abs(calc.pixX(point[0]) - posX);
            const distY = Math.abs(pixY(point[1]) - posY);

            if (last && !(distX < last.distX || (distX === last.distX && distY < last.distY))) {
                return last;
            }

            return {
                distX,
                distY,
                lineIndex,
                point,
                index,
            };
        }, red);
    }, null);
}

export function useHover({
    lines,
    isMobile,
    calc,
    hoverEffect,
}: {
    lines: Line[];
    isMobile?: boolean;
    calc: Calc;
    hoverEffect?: HoverEffect;
}): [
    HLPoint | undefined,
    ((o: { pageX: number; pageY: number; currentTarget: HTMLElement }) => void),
    () => void,
] {
    const [hlPoint, setHlPoint] = useState<HLPoint | undefined>();

    const onHover = useCallback(
        (position: Position) => {
            if (!(calc && lines && !isMobile)) {
                return null;
            }

            const closest = getClosest(lines, position, calc);
            if (!closest) {
                return setHlPoint(undefined);
            }

            const { lineIndex, point, index } = closest;
            const color = getHlColor(lines[lineIndex].color, point, index);
            const [valX, valY] = point;

            return setHlPoint({ valX, valY, color });
        },
        [lines, isMobile, calc],
    );

    const onMouseMove = useMemo(() => {
        const handler = throttle(10, true, (pageX, pageY, currentTarget) => {
            const { left, top } = currentTarget.getBoundingClientRect();

            onHover({
                posX: pageX - left,
                posY: pageY - top,
            });
        });

        return ({
            pageX,
            pageY,
            currentTarget,
        }: {
            pageX: number;
            pageY: number;
            currentTarget: HTMLElement;
        }): void => handler(pageX, pageY, currentTarget);
    }, [onHover]);

    const onMouseLeave = useCallback(() => setHlPoint(undefined), []);

    if (!hoverEffect) {
        return [undefined, NULL, NULL];
    }

    return [hlPoint, onMouseMove, onMouseLeave];
}
