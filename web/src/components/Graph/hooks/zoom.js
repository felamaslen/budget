import { useState, useCallback, useEffect } from 'react';
import debounce from 'debounce';

import { GRAPH_ZOOM_SPEED } from '~client/constants/graph';
import { genPixelCompute, pointVisible } from '../helpers';

function pointsVisible(lines) {
    const threshold = 4;

    return Boolean(lines.find(line => line.get('data').size > threshold));
}

export function useZoom({
    dimensions,
    lines,
    isMobile,
    graph,
    hlPoint,
    calc,
    setCalc,
    zoomEffect
}) {
    const [zoom, setZoom] = useState(dimensions);
    const [zoomLevel, setZoomLevel] = useState(0);

    useEffect(() => {
        setZoom(dimensions);
        setZoomLevel(0);
    }, [dimensions]);

    const zoomLines = useCallback((newMinX, newMaxX) => lines.map(line => {
        const data = line.get('data');

        return line.set('data', data.filter((point, index) => {
            if (pointVisible(point.get(0), newMinX, newMaxX)) {
                return true;
            }
            if (index < data.size - 1 &&
                pointVisible(data.getIn([index + 1, 0]), newMinX, newMaxX)) {
                return true;
            }
            if (index > 0 &&
                pointVisible(data.getIn([index - 1, 0]), newMinX, newMaxX)) {
                return true;
            }

            return false;
        }));
    }), [lines]);

    const getZoomedRange = useCallback((position, newZoomLevel) => {
        const range = dimensions.maxX - dimensions.minX;

        let newMinX = zoom.minX;
        let newMaxX = zoom.maxX;

        if (position) {
            const newRange = range * (1 - GRAPH_ZOOM_SPEED) ** newZoomLevel;

            let newMinXTarget = position - newRange / 2;
            let newMaxXTarget = position + newRange / 2;
            if (newMinXTarget < dimensions.minX) {
                newMaxXTarget += dimensions.minX - newMinXTarget;
                newMinXTarget = dimensions.minX;
            } else if (newMaxXTarget > dimensions.maxX) {
                newMinXTarget -= newMaxXTarget - dimensions.maxX;
                newMaxXTarget = dimensions.maxX;
            }

            newMinX = Math.max(dimensions.minX, Math.round(newMinXTarget));
            newMaxX = Math.min(dimensions.maxX, Math.round(newMaxXTarget));
        }

        const zoomedLines = zoomLines(newMinX, newMaxX);
        if (!pointsVisible(zoomedLines)) {
            return null;
        }

        return zoomEffect(zoomedLines, newMinX, newMaxX);
    }, [dimensions.maxX, dimensions.minX, zoom.minX, zoom.maxX, zoomLines, zoomEffect]);

    const onWheel = useCallback(
        debounce(evt => {
            if (isMobile || !zoomEffect) {
                return;
            }

            if (!hlPoint && !(graph.current && graph.current.offsetParent)) {
                return;
            }

            const position = hlPoint
                ? hlPoint.valX
                : calc.valX(evt.pageX - graph.current.offsetParent.offsetLeft);

            // direction: in is -1, out is +1
            const direction = evt.deltaY / Math.abs(evt.deltaY);
            const newZoomLevel = Math.max(0, zoomLevel - direction);

            const newZoom = getZoomedRange(position, newZoomLevel);
            if (!newZoom) {
                return;
            }

            setZoomLevel(newZoomLevel);
            setZoom(newZoom);

            setCalc(genPixelCompute({
                lines,
                ...dimensions,
                ...newZoom
            }));

        }, 10, true),
        [isMobile, zoomEffect, hlPoint, graph, zoomLevel, getZoomedRange, calc, setCalc, lines, dimensions]
    );

    return [zoom, onWheel];
}

