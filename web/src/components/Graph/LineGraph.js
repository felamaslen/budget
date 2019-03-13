/**
 * React component to display a line graph (e.g. time series)
 */

import { List as list } from 'immutable';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import debounce from 'debounce';
import { rgba } from '../../helpers/color';
import { genPixelCompute } from './helpers';
import { COLOR_GRAPH_TITLE } from '../../constants/colors';
import { GRAPH_ZOOM_SPEED } from '../../constants/graph';
import LineGraphDumb from './LineGraphDumb';

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

const pointVisible = (valX, minX, maxX) => valX >= minX && valX <= maxX;

function pointsVisible(lines) {
    const threshold = 4;

    return Boolean(lines.find(line => line.get('data').size > threshold));
}

function getHlColor(color, point, index) {
    if (typeof color === 'string') {
        return color;
    }
    if (typeof color === 'function') {
        return color(point, index);
    }

    return rgba(COLOR_GRAPH_TITLE);
}

const defaultPadding = [0, 0, 0, 0];

export default function LineGraph(props) {
    const {
        lines,
        width,
        height,
        padding: customPadding,
        minX,
        maxX,
        minY,
        maxY,
        zoomEffect,
        isMobile
    } = props;

    const padding = customPadding || defaultPadding;

    const graph = useRef(null);

    const [zoom, setZoom] = useState({ minX, maxX });
    const [zoomLevel, setZoomLevel] = useState(0);

    const [calc, setCalc] = useState(genPixelCompute({
        padding,
        width,
        height,
        lines,
        minY,
        maxY,
        minX,
        maxX,
        ...zoom
    }));

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

    const range = useMemo(() => maxX - minX, [minX, maxX]);

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

    if (!calc) {
        return null;
    }

    const outerProperties = useMemo(() => ({
        onMouseMove,
        onMouseLeave,
        ...(props.outerProperties || {})
    }), [onMouseMove, onMouseLeave, props.outerProperties]);

    const svgProperties = useMemo(() => ({
        onWheel,
        ...(props.svgProperties || {})
    }), [onWheel, props.svgProperties]);

    return (
        <LineGraphDumb
            svgRef={graph}
            {...props}
            {...zoom}
            calc={calc}
            outerProperties={outerProperties}
            svgProperties={svgProperties}
            hlPoint={hlPoint}
        />
    );
}

LineGraph.propTypes = {
    lines: PropTypes.instanceOf(list).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.array,
    minX: PropTypes.number,
    maxX: PropTypes.number,
    minY: PropTypes.number,
    maxY: PropTypes.number,
    isMobile: PropTypes.bool,
    hoverEffect: PropTypes.object,
    outerProperties: PropTypes.object,
    svgProperties: PropTypes.object,
    zoomEffect: PropTypes.func
};

