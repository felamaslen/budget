import { useReducer, useMemo, useEffect } from 'react';
import { throttle } from 'throttle-debounce';

import { GRAPH_ZOOM_SPEED } from '~client/constants/graph';
import { genPixelCompute, pointVisible } from '~client/components/Graph/helpers';

const threshold = 4;

const noop = () => null;

const pointsVisible = lines => lines.some(({ data }) => data.length > threshold);

function getZoomedLines(lines, minX, maxX) {
    const zoomedLines = lines.map(({ data, ...rest }) => ({
        data: data.filter(([xValue], index) =>
            pointVisible(xValue, minX, maxX) ||
            (index < data.length - 1 && pointVisible(data[index + 1][0], minX, maxX)) ||
            (index > 0 && pointVisible(data[index - 1][0], minX, maxX))
        ),
        ...rest
    }));

    if (!pointsVisible(zoomedLines)) {
        return lines;
    }

    return zoomedLines;
}

function getZoomedRange(position, zoomedWidth, { minX, maxX }) {
    let zoomedMinX = position - zoomedWidth / 2;
    let zoomedMaxX = position + zoomedWidth / 2;
    if (zoomedMinX < minX) {
        zoomedMaxX += minX - zoomedMinX;
        zoomedMinX = minX;
    } else if (zoomedMaxX > maxX) {
        zoomedMinX -= zoomedMaxX - maxX;
        zoomedMaxX = maxX;
    }

    return [
        Math.max(minX, Math.round(zoomedMinX)),
        Math.min(maxX, Math.round(zoomedMaxX))
    ];
}

const init = ({ disabled, dimensions, lines, calc, zoomEffect, graphRef }) => ({
    disabled,
    valX: calc && calc.valX,
    zoomEffect,
    graphRef,
    fullWidth: dimensions.maxX - dimensions.minX,
    lastLines: lines,
    lastDimensions: dimensions,
    zoomLevel: 0,
    zoomedLines: lines,
    zoomedDimensions: dimensions
});

function onWheel(state, { evt }) {
    if (state.disabled || !state.graphRef.current) {
        return state;
    }

    const zoomLevel = Math.max(0, state.zoomLevel - evt.deltaY / Math.abs(evt.deltaY));
    const position = state.valX(evt.pageX - state.graphRef.current.offsetParent.offsetLeft);

    if (!position) {
        return state;
    }

    const zoomedWidth = state.fullWidth * (1 - GRAPH_ZOOM_SPEED) ** zoomLevel;

    const [zoomedMinX, zoomedMaxX] = getZoomedRange(position, zoomedWidth, state.lastDimensions);

    const zoomedLines = getZoomedLines(state.lastLines, zoomedMinX, zoomedMaxX);

    const nextZoomedDimensions = state.zoomEffect(zoomedLines, zoomedMinX, zoomedMaxX);

    if (nextZoomedDimensions.minX === state.zoomedDimensions.minX &&
        nextZoomedDimensions.maxX === state.zoomedDimensions.maxX) {

        return state;
    }

    const zoomedDimensions = { ...state.zoomedDimensions, ...nextZoomedDimensions };

    return {
        ...state,
        zoomLevel,
        zoomedLines,
        zoomedDimensions
    };
}

function reducer(state, action) {
    if (action.type === 'reset') {
        return init(action);
    }
    if (action.type === 'wheel') {
        return onWheel(state, action);
    }

    throw new Error(`Unhandled zoom hook action: ${action.type}`);
}

export function useZoom({
    dimensions,
    lines,
    isMobile,
    graphRef,
    calc,
    setCalc,
    zoomEffect
}) {
    const disabled = isMobile || !zoomEffect;

    const [state, dispatch] = useReducer(reducer, {
        dimensions,
        lines,
        calc,
        zoomEffect,
        graphRef
    }, init);

    useEffect(() => {
        if ((disabled && !state.disabled) || lines !== state.lastLines) {
            dispatch({
                type: 'reset',
                disabled,
                dimensions,
                lines,
                calc,
                zoomEffect,
                graphRef
            });
            setCalc(genPixelCompute(dimensions));
        }
    }, [
        disabled,
        state.disabled,
        state.lastLines,
        setCalc,
        dimensions,
        lines,
        calc,
        zoomEffect,
        graphRef
    ]);

    useEffect(() => {
        setCalc(genPixelCompute({
            lines: state.zoomedLines,
            ...state.zoomedDimensions
        }));
    }, [setCalc, state.zoomedLines, state.zoomedDimensions]);

    const onWheelThrottled = useMemo(() => {
        if (disabled) {
            return noop;
        }

        const handler = throttle(10, evt => dispatch({ type: 'wheel', evt }));

        return evt => {
            evt.preventDefault();
            handler(evt);
        };
    }, [disabled]);

    useEffect(() => {
        let lastRef = null;
        setImmediate(() => {
            if (graphRef.current) {
                graphRef.current.addEventListener('wheel', onWheelThrottled);
            }
            lastRef = graphRef.current;
        });

        return () => {
            if (lastRef) {
                lastRef.removeEventListener('wheel', onWheelThrottled);
            }
        };
    }, [graphRef, onWheelThrottled]);

    return [state.zoomedLines, state.zoomedDimensions];
}
