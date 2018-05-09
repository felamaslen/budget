import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { genPixelCompute } from './helpers';
import Graph from '.';
import HighlightPoint from '../HighlightPoint';
import RenderedLine from './RenderedLine';

export default function LineGraphDumb({ lines, hlPoint, beforeLines, afterLines, ...props }) {
    const pixelFunctions = genPixelCompute({ padding: [0, 0, 0, 0], ...props });
    const subProps = { ...props, ...pixelFunctions };

    if (!lines.size) {
        return <Graph {...subProps} />;
    }

    const renderedLines = lines.map(line => (
        <RenderedLine
            key={line.get('key')}
            line={line}
            {...subProps}
        />
    ));

    let highlightPoint = null;
    if (props.hoverEffect) {
        highlightPoint = <HighlightPoint hlPoint={hlPoint} {...subProps} />;
    }

    return (
        <Graph {...subProps}>
            {beforeLines && beforeLines(subProps)}
            {renderedLines}
            {afterLines && afterLines(subProps)}
            {highlightPoint}
        </Graph>
    );
}

LineGraphDumb.propTypes = {
    beforeLines: PropTypes.func,
    afterLines: PropTypes.func,
    lines: ImmutablePropTypes.list.isRequired,
    hoverEffect: PropTypes.object,
    hlPoint: PropTypes.object,
    minX: PropTypes.number,
    maxX: PropTypes.number,
    minY: PropTypes.number,
    maxY: PropTypes.number
};

