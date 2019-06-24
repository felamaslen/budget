/**
 * React component to display a line graph (e.g. time series)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { genPixelCompute } from '~client/components/Graph/helpers';
import LineGraphDumb from '~client/components/Graph/LineGraphDumb';
import {
    lineShape,
    lineGraphPropTypes,
    rangePropTypes
} from '~client/components/Graph/prop-types';

import { useZoom } from './hooks/zoom';
import { useHover } from './hooks/hover';

const defaultPadding = [0, 0, 0, 0];

export default function LineGraph({
    name,
    before,
    beforeLines,
    afterLines,
    after,
    lines,
    width,
    height,
    padding,
    minX,
    maxX,
    minY,
    maxY,
    outerProperties,
    svgProperties,
    svgClasses,
    isMobile,
    hoverEffect,
    zoomEffect
}) {
    const graph = useRef(null);

    const [calc, setCalc] = useState(null);

    const dimensions = useMemo(() => ({
        width,
        height,
        padding,
        minY,
        maxY,
        minX,
        maxX
    }), [width, height, padding, minY, maxY, minX, maxX]);

    useEffect(() => {
        setCalc(genPixelCompute(dimensions));
    }, [dimensions]);

    const [hlPoint, onMouseMove, onMouseLeave] = useHover({
        lines,
        isMobile,
        calc,
        hoverEffect
    });

    const [zoom, onWheel] = useZoom({
        dimensions,
        lines,
        isMobile,
        graph,
        hlPoint,
        calc,
        setCalc,
        zoomEffect
    });

    const zoomedDimensions = useMemo(() => {
        if (zoom) {
            return {
                ...dimensions,
                ...zoom
            };
        }

        return dimensions;
    }, [zoom, dimensions]);

    const outerPropertiesProc = useMemo(() => ({
        onMouseMove,
        onMouseOver: onMouseMove,
        onMouseLeave,
        ...outerProperties
    }), [onMouseMove, onMouseLeave, outerProperties]);

    const svgPropertiesProc = useMemo(() => ({
        onWheel,
        ...svgProperties
    }), [onWheel, svgProperties]);

    if (!calc) {
        return null;
    }

    const graphProps = {
        name,
        svgRef: graph,
        before,
        beforeLines,
        afterLines,
        after,
        dimensions: zoomedDimensions,
        lines,
        calc,
        hlPoint,
        hoverEffect,
        outerProperties: outerPropertiesProc,
        svgProperties: svgPropertiesProc,
        svgClasses
    };

    return <LineGraphDumb {...graphProps} />;
}

LineGraph.propTypes = {
    name: PropTypes.string.isRequired,
    before: PropTypes.func,
    beforeLines: PropTypes.func,
    afterLines: PropTypes.func,
    after: PropTypes.func,
    ...lineGraphPropTypes,
    ...rangePropTypes,
    lines: PropTypes.arrayOf(lineShape.isRequired).isRequired,
    isMobile: PropTypes.bool,
    hoverEffect: PropTypes.shape({
        labelX: PropTypes.func.isRequired,
        labelY: PropTypes.func.isRequired,
        labelWidthY: PropTypes.number
    }),
    outerProperties: PropTypes.object.isRequired,
    svgProperties: PropTypes.object.isRequired,
    svgClasses: PropTypes.string,
    zoomEffect: PropTypes.func
};

LineGraph.defaultProps = {
    isMobile: false,
    before: null,
    after: null,
    padding: defaultPadding,
    outerProperties: {},
    svgProperties: {}
};
