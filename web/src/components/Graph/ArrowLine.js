import React from 'react';
import PropTypes from 'prop-types';
import Arrow from '../Arrow';

export default function ArrowLine({ data, color, ...props }) {
    if (props.minY === 0 || props.maxY === 0) {
        return null;
    }

    const getColor = typeof color === 'function'
        ? (point) => color(point)
        : () => color;

    const y0 = props.pixY(0);

    const arrows = data.map((point, key) => {
        const [xValue, yValue] = point;
        const sizeRatio = yValue > 0
            ? yValue / props.maxY
            : yValue / props.minY;

        return (<Arrow key={key}
            startX={xValue}
            startY={0}
            length={Math.abs(props.pixY(yValue) - y0)}
            angle={Math.PI * (0.5 + ((yValue < 0) >> 0))}
            arrowSize={sizeRatio}
            color={getColor(point)}
            fill={true}
            strokeWidth={3 * sizeRatio}
            {...props}
        />);
    });

    return <g>{arrows}</g>;
}

ArrowLine.propTypes = {
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired).isRequired,
    pixY: PropTypes.func.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]).isRequired,
};
