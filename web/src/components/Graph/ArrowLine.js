import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import Arrow from '../Arrow';

export default function ArrowLine({ data, color, ...props }) {
    const getColor = typeof color === 'function'
        ? point => color(point)
        : () => color;

    const y0 = props.pixY(0);

    const arrows = data.map((point, key) => {
        const yValue = point.get(1);

        const sizeRatio = yValue > 0
            ? yValue / props.maxY
            : yValue / props.minY;

        return (<Arrow key={key}
            startX={point.get(0)}
            startY={0}
            length={Math.abs(props.pixY(yValue) - y0)}
            angle={Math.PI * (0.5 + ((yValue < 0) >> 0))}
            arrowWidth={6 * (sizeRatio + 0.5)}
            arrowHeight={10 * (sizeRatio + 0.5)}
            color={getColor(point)}
            strokeWidth={3 * sizeRatio}
            {...props}
        />);
    });

    return <g>{arrows}</g>;
}

ArrowLine.propTypes = {
    data: PropTypes.instanceOf(list).isRequired,
    pixY: PropTypes.func.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]).isRequired
};

