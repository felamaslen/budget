import React from 'react';
import PropTypes from 'prop-types';
import { getDynamicLinePaths } from '~client/components/Graph/helpers';
import { dataShape } from '~client/prop-types/graph';

export default function DynamicColorLine({
    fill,
    data,
    smooth,
    color,
    children,
    pathProps,
    ...props
}) {
    if (props.minY === props.maxY) {
        return null;
    }
    if (fill) {
        throw new Error('Dynamically coloured, filled graph not implemented');
    }

    const linePaths = getDynamicLinePaths({
        data,
        smooth,
        color,
        ...props,
    });
    if (!linePaths) {
        return null;
    }

    const paths = linePaths.map(({ path, stroke }, key) => (
        <path key={key} d={path} stroke={stroke} {...pathProps} fill="none" />
    ));

    return (
        <g>
            {children}
            {paths}
        </g>
    );
}

DynamicColorLine.propTypes = {
    fill: PropTypes.bool,
    data: dataShape.isRequired,
    smooth: PropTypes.bool,
    color: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({
            changes: PropTypes.array.isRequired,
            values: PropTypes.array.isRequired,
        }),
    ]).isRequired,
    minY: PropTypes.number,
    maxY: PropTypes.number,
    children: PropTypes.object,
    pathProps: PropTypes.object.isRequired,
};
