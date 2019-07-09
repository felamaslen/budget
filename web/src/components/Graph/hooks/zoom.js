import { useState, useMemo, useEffect } from 'react';
import { throttle } from 'throttle-debounce';

import { GRAPH_ZOOM_SPEED } from '~client/constants/graph';
import { genPixelCompute, pointVisible } from '~client/components/Graph/helpers';

const threshold = 4;

const noop = () => null;

const getZoomedLines = (lines, [minX, maxX]) => lines.map(({ data, ...rest }) => ({
    data: data.filter(([xValue], index) =>
        pointVisible(xValue, minX, maxX) ||
        (index < data.length - 1 && pointVisible(data[index + 1][0], minX, maxX)) ||
        (index > 0 && pointVisible(data[index - 1][0], minX, maxX))
    ),
    ...rest
}));

const pointsVisible = lines => lines.some(({ data }) => data.length > threshold);

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

    const [range, setRange] = useState([dimensions.minX, dimensions.maxX]);
    const [zoomedLines, setZoomedLines] = useState(lines);
    const [zoomedDimensions, setZoomedDimensions] = useState(dimensions);

    const [wheelEvent, setWheelEvent] = useState({ time: 0, pageX: 0, level: 0 });
    const [position, setPosition] = useState(0);
    const [lastZoomTime, setLastZoomTime] = useState(0);
    useEffect(() => {
        if (graphRef.current && wheelEvent.time !== lastZoomTime) {
            setLastZoomTime(wheelEvent.time);
            setPosition(calc.valX(wheelEvent.pageX - graphRef.current.offsetParent.offsetLeft));
        }
    }, [calc, graphRef, lastZoomTime, wheelEvent]);

    const [lastLines, setLastLines] = useState(lines);
    useEffect(() => {
        if (lines !== lastLines) {
            setLastLines(lines);
            setRange([dimensions.minX, dimensions.maxX]);
            setZoomedLines(lines);
            setZoomedDimensions(dimensions);
            setWheelEvent({ time: 0, pageX: 0, level: 0 });
            setPosition(0);
            setCalc(genPixelCompute(dimensions));
        }
    }, [setCalc, lines, lastLines, dimensions]);

    const fullWidth = dimensions.maxX - dimensions.minX;
    const zoomedWidth = fullWidth * (1 - GRAPH_ZOOM_SPEED) ** wheelEvent.level;

    // SET ZOOMED MINX/MAXX RANGE (<- position (<- wheelEvent.time), (zoomedWidth <- level))
    useEffect(() => {
        if (disabled || !position) {
            return;
        }

        let newMinX = position - zoomedWidth / 2;
        let newMaxX = position + zoomedWidth / 2;
        if (newMinX < dimensions.minX) {
            newMaxX += dimensions.minX - newMinX;
            newMinX = dimensions.minX;
        } else if (newMaxX > dimensions.maxX) {
            newMinX -= newMaxX - dimensions.maxX;
            newMaxX = dimensions.maxX;
        }

        newMinX = Math.max(dimensions.minX, Math.round(newMinX));
        newMaxX = Math.min(dimensions.maxX, Math.round(newMaxX));

        setRange(lastRange => {
            if (newMinX === lastRange[0] && newMaxX === lastRange[1]) {
                return lastRange;
            }

            return [newMinX, newMaxX];
        });
    }, [disabled, dimensions.minX, dimensions.maxX, zoomedWidth, position]);

    // SET ZOOMED LINES (<- range)
    useEffect(() => {
        setZoomedLines(lastZoomedLines => {
            if (disabled) {
                return lastZoomedLines;
            }

            const nextZoomedLines = getZoomedLines(lines, range);

            if (!pointsVisible(nextZoomedLines)) {
                return lastZoomedLines;
            }

            return nextZoomedLines;
        });
    }, [disabled, lines, range]);

    // SET ZOOMED DIMENSIONS (<- range, (zoomedLines <- range))
    useEffect(() => {
        setZoomedDimensions(lastZoomedDimensions => {
            if (disabled) {
                return lastZoomedDimensions;
            }

            const { minX, maxX } = lastZoomedDimensions;
            const [zoomMinX, zoomMaxX] = range;

            const nextZoomedDimensions = zoomEffect(zoomedLines, zoomMinX, zoomMaxX);
            if (nextZoomedDimensions.minX === minX && nextZoomedDimensions.maxX === maxX) {
                return lastZoomedDimensions;
            }

            return { ...dimensions, ...nextZoomedDimensions };
        });
    }, [disabled, zoomEffect, dimensions, zoomedLines, range]);

    useEffect(() => {
        setCalc(genPixelCompute({
            lines: zoomedLines,
            ...zoomedDimensions
        }));
    }, [setCalc, zoomedLines, zoomedDimensions]);

    const onWheel = useMemo(() => {
        if (disabled) {
            return noop;
        }

        const handler = throttle(10, evt => {
            setWheelEvent(({ level }) => ({
                time: performance.now(),
                pageX: evt.pageX,
                level: Math.max(0, level - evt.deltaY / Math.abs(evt.deltaY))
            }));
        });

        return evt => {
            evt.preventDefault();
            handler(evt);
        };
    }, [disabled]);

    // EVENT LISTENERS
    useEffect(() => {
        let lastRef = null;
        setImmediate(() => {
            if (graphRef.current) {
                graphRef.current.addEventListener('wheel', onWheel);
            }
            lastRef = graphRef.current;
        });

        return () => {
            if (lastRef) {
                lastRef.removeEventListener('wheel', onWheel);
            }
        };
    }, [graphRef, onWheel]);

    return [zoomedLines, zoomedDimensions];
}
