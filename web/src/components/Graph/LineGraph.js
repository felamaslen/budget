/**
 * React component to display a line graph (e.g. time series)
 */

import { List as list } from 'immutable';
import React, { useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { genPixelCompute } from './helpers';
import LineGraphDumb from './LineGraphDumb';

import { useZoom } from './hooks/zoom';
import { useHover } from './hooks/hover';

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
        maxY
    } = props;

    const padding = customPadding || defaultPadding;

    const graph = useRef(null);

    const [calc, setCalc] = useState(genPixelCompute({
        padding,
        width,
        height,
        lines,
        minY,
        maxY,
        minX,
        maxX
    }));

    const range = useMemo(() => maxX - minX, [minX, maxX]);

    const [hlPoint, onMouseMove, onMouseLeave] = useHover({ props });

    const [zoom, onWheel] = useZoom({ props, padding, range, graph, hlPoint, setCalc });

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

