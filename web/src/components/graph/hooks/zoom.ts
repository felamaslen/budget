import { useReducer, useMemo, useEffect } from 'react';
import { throttle } from 'throttle-debounce';

import { NULL } from '~client/modules/data';
import { GRAPH_ZOOM_SPEED } from '~client/constants/graph';
import { GraphRef } from '~client/components/graph';
import { ZoomEffect } from '~client/components/graph/line-graph';
import { genPixelCompute, pointVisible } from '~client/components/graph/helpers';
import { Dimensions, RangeX, Calc, Line } from '~client/types/graph';

const threshold = 4;

const pointsVisible = (lines: Line[]): boolean => lines.some(({ data }) => data.length > threshold);

function getZoomedLines(lines: Line[], minX: number, maxX: number): Line[] {
    const zoomedLines = lines.map(({ data, ...rest }) => ({
        data: data.filter(
            ([xValue], index) =>
                pointVisible(xValue, minX, maxX) ||
                (index < data.length - 1 && pointVisible(data[index + 1][0], minX, maxX)) ||
                (index > 0 && pointVisible(data[index - 1][0], minX, maxX)),
        ),
        ...rest,
    }));

    if (!pointsVisible(zoomedLines)) {
        return lines;
    }

    return zoomedLines;
}

function getZoomedRange(
    position: number,
    zoomedWidth: number,
    { minX, maxX }: RangeX,
): [number, number] {
    let zoomedMinX = position - zoomedWidth / 2;
    let zoomedMaxX = position + zoomedWidth / 2;
    if (zoomedMinX < minX) {
        zoomedMaxX += minX - zoomedMinX;
        zoomedMinX = minX;
    } else if (zoomedMaxX > maxX) {
        zoomedMinX -= zoomedMaxX - maxX;
        zoomedMaxX = maxX;
    }

    return [Math.max(minX, Math.round(zoomedMinX)), Math.min(maxX, Math.round(zoomedMaxX))];
}

type ZoomState = {
    disabled?: boolean;
    valX?: (p: number) => number;
    zoomEffect?: ZoomEffect;
    graphRef: GraphRef;
    fullWidth: number;
    calc: Calc;
    lines: Line[];
    lastLines: Line[];
    dimensions: Dimensions;
    lastDimensions: Dimensions;
    level: number;
    pageX: number | null;
    position: number;
    zoomedLines: Line[];
    zoomedDimensions: Dimensions;
};

interface ZoomAction {
    type: string;
}

type ResetAction = ZoomAction & {
    type: 'reset';
    disabled: boolean;
    dimensions: Dimensions;
    lines: Line[];
    calc: Calc;
    zoomEffect: ZoomEffect;
    graphRef: GraphRef;
};

const isResetAction = (action: ZoomAction): action is ResetAction => action.type === 'reset';

const init = (
    state: ZoomState,
    { disabled, dimensions, lines, calc, zoomEffect, graphRef }: ResetAction,
): ZoomState => ({
    ...state,
    disabled,
    valX: calc && calc.valX,
    zoomEffect,
    graphRef,
    fullWidth: dimensions.maxX - dimensions.minX,
    lastLines: lines,
    lastDimensions: dimensions,
    level: 0,
    pageX: null,
    position: 0,
    zoomedLines: lines,
    zoomedDimensions: dimensions,
});

type WheelAction = ZoomAction & {
    type: 'wheel';
    evt: WheelEvent;
};

const isWheelAction = (action: ZoomAction): action is WheelAction => action.type === 'wheel';

function onWheel(state: ZoomState, { evt }: WheelAction): ZoomState {
    if (state.disabled || !state.zoomEffect || !state.graphRef.current || !evt.deltaY) {
        return state;
    }

    const level = Math.max(0, state.level - evt.deltaY / Math.abs(evt.deltaY));
    const position =
        evt.pageX === state.pageX || !state.valX
            ? state.position
            : state.valX(evt.pageX - state.graphRef.current.offsetLeft);

    if (!position) {
        return state;
    }

    const zoomedWidth = state.fullWidth * (1 - GRAPH_ZOOM_SPEED) ** level;

    const [zoomedMinX, zoomedMaxX] = getZoomedRange(position, zoomedWidth, state.lastDimensions);

    const zoomedLines = getZoomedLines(state.lastLines, zoomedMinX, zoomedMaxX);

    const nextZoomedDimensions = state.zoomEffect(zoomedLines, zoomedMinX, zoomedMaxX);

    if (
        nextZoomedDimensions.minX === state.zoomedDimensions.minX &&
        nextZoomedDimensions.maxX === state.zoomedDimensions.maxX
    ) {
        return state;
    }

    const zoomedDimensions = { ...state.zoomedDimensions, ...nextZoomedDimensions };

    return {
        ...state,
        level,
        pageX: evt.pageX,
        position,
        zoomedLines,
        zoomedDimensions,
    };
}

function reducer(state: ZoomState, action: ZoomAction): ZoomState {
    if (isResetAction(action)) {
        return init(state, action);
    }
    if (isWheelAction(action)) {
        return onWheel(state, action);
    }

    throw new Error(`Unhandled zoom hook action: ${action.type}`);
}

type ZoomProps = {
    dimensions: Dimensions;
    lines: Line[];
    isMobile?: boolean;
    graphRef: GraphRef;
    calc: Calc;
    setCalc: (next: Calc) => void;
    zoomEffect?: ZoomEffect;
};

type OnWheel = (evt: WheelEvent) => void;

export function useZoom({
    dimensions,
    lines,
    isMobile,
    graphRef,
    calc,
    setCalc,
    zoomEffect,
}: ZoomProps): [Line[], Dimensions] {
    const disabled = isMobile || !zoomEffect;

    const [state, dispatch] = useReducer(reducer, {
        dimensions,
        lastDimensions: dimensions,
        zoomedDimensions: dimensions,
        lines,
        lastLines: lines,
        calc,
        zoomEffect,
        graphRef,
        fullWidth: 0,
        level: 0,
        pageX: 0,
        position: 0,
        zoomedLines: [],
    });

    useEffect(() => {
        if (
            (disabled && !state.disabled) ||
            lines !== state.lastLines ||
            dimensions !== state.lastDimensions
        ) {
            const nextCalc = genPixelCompute(dimensions);
            dispatch({
                type: 'reset',
                disabled,
                dimensions,
                lines,
                calc: nextCalc,
                zoomEffect,
                graphRef,
            } as ResetAction);
            setCalc(nextCalc);
        }
    }, [
        disabled,
        state.disabled,
        state.lastLines,
        state.lastDimensions,
        setCalc,
        dimensions,
        lines,
        calc,
        zoomEffect,
        graphRef,
    ]);

    useEffect(() => {
        setCalc(genPixelCompute(state.zoomedDimensions));
    }, [setCalc, state.zoomedLines, state.zoomedDimensions]);

    const onWheelThrottled = useMemo<OnWheel>(() => {
        if (disabled) {
            return NULL;
        }

        const handler = throttle(10, evt => dispatch({ type: 'wheel', evt } as WheelAction));

        return (evt: WheelEvent): void => {
            evt.preventDefault();
            handler(evt);
        };
    }, [disabled]);

    useEffect(() => {
        let lastRef: HTMLElement | undefined;
        setImmediate(() => {
            if (graphRef.current && onWheelThrottled !== NULL) {
                graphRef.current.addEventListener<'wheel'>('wheel', onWheelThrottled);
            }
            lastRef = graphRef.current;
        });

        return (): void => {
            if (lastRef) {
                lastRef.removeEventListener('wheel', onWheelThrottled);
            }
        };
    }, [graphRef, onWheelThrottled]);

    return [state.zoomedLines, state.zoomedDimensions];
}
