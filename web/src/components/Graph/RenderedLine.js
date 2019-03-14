import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { getPathProps, getSingleLinePath } from './helpers';
import ArrowLine from './ArrowLine';
import DynamicColorLine from './DynamicColorLine';
import AverageLine from './AverageLine';

function getStyleProps(fill, color) {
    if (fill) {
        return { fill: color, stroke: 'none' };
    }

    return { fill: 'none', stroke: color };
}

export default function RenderedLine(allProps) {
    const { line, ...props } = allProps;

    const data = line.get('data');
    const color = line.get('color');
    const fill = line.get('fill');
    const smooth = line.get('smooth');
    const movingAverage = line.get('movingAverage');
    const arrows = line.get('arrows');

    if (!data.size) {
        return null;
    }

    if (arrows) {
        return <ArrowLine data={data} color={color} {...props} />;
    }

    const pathProps = useMemo(() => getPathProps(line), [line]);

    const averageLine = <AverageLine {...props} data={data} value={movingAverage} />;

    if (typeof color === 'string') {
        const linePath = useMemo(
            () => getSingleLinePath({ data, smooth, fill, ...props }),
            [data, smooth, fill, ...Object.keys(props).map(key => props[key])]
        );
        const styleProps = useMemo(() => getStyleProps(fill, color), [fill, color]);

        return <g className="line">
            <path d={linePath} {...styleProps} {...pathProps} />
            {averageLine}
        </g>;
    }

    const lineProps = { data, color, fill, smooth, movingAverage, pathProps };

    return (
        <DynamicColorLine {...lineProps} {...props}>
            {averageLine}
        </DynamicColorLine>
    );
}

RenderedLine.propTypes = {
    line: ImmutablePropTypes.contains({
        data: ImmutablePropTypes.list.isRequired,
        color: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
            PropTypes.shape({
                changes: PropTypes.array.isRequired,
                values: PropTypes.array.isRequired
            })
        ]).isRequired,
        strokeWidth: PropTypes.number,
        dashed: PropTypes.bool,
        fill: PropTypes.bool,
        smooth: PropTypes.bool,
        movingAverage: PropTypes.number,
        arrows: PropTypes.bool
    }),
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    valX: PropTypes.func.isRequired,
    valY: PropTypes.func.isRequired
};

