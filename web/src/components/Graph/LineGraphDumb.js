import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Graph from '.';
import HighlightPoint from '../HighlightPoint';
import RenderedLine from './RenderedLine';

export default function LineGraphDumb(allProps) {
    const { calc, lines, hlPoint, beforeLines, afterLines, ...props } = allProps;

    const subProps = useMemo(() => ({
        ...calc,
        ...props
    }), [calc, ...Object.keys(props).map(key => props[key])]);

    const renderedLines = useMemo(() => lines.map(line => (
        <RenderedLine
            key={line.get('key')}
            line={line}
            {...subProps}
        />
    )), [lines, subProps]);

    if (!lines.size) {
        return <Graph {...subProps} />;
    }

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
    calc: PropTypes.object.isRequired,
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

