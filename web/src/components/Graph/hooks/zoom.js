import { useState, useCallback } from 'react';
import debounce from 'debounce';

import { GRAPH_ZOOM_SPEED } from '../../../constants/graph';
import { genPixelCompute, pointVisible } from '../helpers';

function pointsVisible(lines) {
    const threshold = 4;

    return Boolean(lines.find(line => line.get('data').size > threshold));
}

export function useZoom({ props, padding, range, graph, hlPoint, setCalc }) {
    const {
        lines,
        width,
        height,
        minX,
        maxX,
        minY,
        maxY,
        zoomEffect,
        isMobile
    } = props;

    const [zoom, setZoom] = useState({ minX, maxX });
    const [zoomLevel, setZoomLevel] = useState(0);

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
        let newMinX = zoom.minX;
        let newMaxX = zoom.maxX;

        if (position) {
            const newRange = range * (1 - GRAPH_ZOOM_SPEED) ** newZoomLevel;

            let newMinXTarget = position - newRange / 2;
            let newMaxXTarget = position + newRange / 2;
            if (newMinXTarget < minX) {
                newMaxXTarget += minX - newMinXTarget;
                newMinXTarget = minX;
            } else if (newMaxXTarget > maxX) {
                newMinXTarget -= newMaxXTarget - maxX;
                newMaxXTarget = maxX;
            }

            newMinX = Math.max(minX, Math.round(newMinXTarget));
            newMaxX = Math.min(maxX, Math.round(newMaxXTarget));
        }

        const zoomedLines = zoomLines(newMinX, newMaxX);
        if (!pointsVisible(zoomedLines)) {
            return null;
        }

        return zoomEffect(props, zoomedLines, { minX: newMinX, maxX: newMaxX });
    });

    const onWheel = useCallback(
        ({ valX }) => debounce(evt => {
            if (isMobile || !zoomEffect) {
                return;
            }

            evt.preventDefault();

            if (!hlPoint && !(graph.current && graph.current.offsetParent)) {
                return;
            }

            const position = hlPoint
                ? hlPoint.valX
                : valX(evt.pageX - graph.current.offsetParent.offsetLeft);

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
                padding,
                width,
                height,
                lines,
                minY,
                maxY,
                minX,
                maxX,
                ...newZoom
            }));

        }, 10, true),
        [
            isMobile,
            zoomEffect,
            padding,
            width,
            height,
            lines,
            minY,
            maxY,
            minX,
            maxX,
            zoom,
            zoomLevel
        ]
    );

    return [zoom, onWheel];
}

