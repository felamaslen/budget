/**
 * React component to display a line graph (e.g. time series)
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { genPixelCompute } from '~client/components/Graph/helpers';
import LineGraphDumb from '~client/components/Graph/LineGraphDumb';
import {
    lineShape,
    lineGraphPropTypes,
    rangePropTypes
} from '~client/prop-types/graph';

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
    const graphRef = useRef();
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

    const [, zoomedDimensions] = useZoom({
        dimensions,
        lines,
        isMobile,
        graphRef,
        calc,
        setCalc,
        zoomEffect
    });

    const outerPropertiesProc = useMemo(() => ({
        onMouseMove,
        onMouseOver: onMouseMove,
        onMouseLeave,
        ...outerProperties
    }), [onMouseMove, onMouseLeave, outerProperties]);

    if (!calc) {
        return null;
    }

    const graphProps = {
        name,
        before,
        beforeLines,
        afterLines,
        after,
        dimensions: zoomedDimensions,
        lines,
        calc,
        hlPoint,
        hoverEffect,
        graphRef,
        outerProperties: outerPropertiesProc,
        svgProperties,
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
