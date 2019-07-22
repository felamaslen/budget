import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Graph from '~client/components/Graph';
import {
    lineGraphPropTypes,
    rangePropTypes,
    pixelPropTypes,
    lineShape
} from '~client/prop-types/graph';
import RenderedLine from '~client/components/Graph/RenderedLine';
import HighlightPoint from '~client/components/HighlightPoint';

function useBeforeAfter(component, basicProps) {
    return useMemo(
        () => component && component(basicProps),
        [component, basicProps]
    );
}

export default function LineGraphDumb({
    name,
    before,
    after,
    dimensions,
    calc,
    lines,
    hlPoint,
    beforeLines,
    afterLines,
    graphRef,
    outerProperties,
    svgProperties,
    svgClasses,
    hoverEffect
}) {
    const basicProps = useMemo(() => ({
        ...dimensions,
        ...calc
    }), [dimensions, calc]);

    const graphProps = {
        name,
        before,
        after,
        graphRef,
        outerProperties,
        svgProperties,
        svgClasses,
        ...basicProps
    };

    const renderedLines = useMemo(() => lines.map(({ key, ...line }) => (
        <RenderedLine
            key={key}
            line={line}
            {...dimensions}
            {...calc}
        />
    )), [dimensions, lines, calc]);

    const beforeLinesProc = useBeforeAfter(beforeLines, basicProps);
    const afterLinesProc = useBeforeAfter(afterLines, basicProps);

    if (!lines.length) {
        return <Graph {...graphProps} />;
    }

    return (
        <Graph {...graphProps}>
            {beforeLinesProc}
            {renderedLines}
            {afterLinesProc}
            {hoverEffect && <HighlightPoint
                pixX={calc.pixX}
                pixY={calc.pixY}
                minY={dimensions.minY}
                maxY={dimensions.maxY}
                width={dimensions.width}
                height={dimensions.height}
                hlPoint={hlPoint}
                hoverEffect={hoverEffect}
            />}
        </Graph>
    );
}

LineGraphDumb.propTypes = {
    name: PropTypes.string.isRequired,
    before: PropTypes.func,
    beforeLines: PropTypes.func,
    afterLines: PropTypes.func,
    after: PropTypes.func,
    dimensions: PropTypes.shape({
        ...lineGraphPropTypes,
        ...rangePropTypes
    }).isRequired,
    calc: PropTypes.shape(pixelPropTypes).isRequired,
    lines: PropTypes.arrayOf(lineShape.isRequired).isRequired,
    hoverEffect: PropTypes.object,
    graphRef: PropTypes.object,
    outerProperties: PropTypes.object.isRequired,
    svgProperties: PropTypes.object.isRequired,
    svgClasses: PropTypes.string,
    hlPoint: PropTypes.object
};

LineGraphDumb.defaultProps = {
    graphRef: null,
    before: null,
    after: null
};
