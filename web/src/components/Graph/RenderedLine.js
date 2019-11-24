import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { lineShape } from '~client/prop-types/graph';
import { getPathProps, getSingleLinePath } from '~client/components/Graph/helpers';
import ArrowLine from '~client/components/Graph/ArrowLine';
import DynamicColorLine from '~client/components/Graph/DynamicColorLine';
import AverageLine from '~client/components/Graph/AverageLine';

function getStyleProps(fill, color) {
    if (fill) {
        return { fill: color, stroke: 'none' };
    }

    return { fill: 'none', stroke: color };
}

export default function RenderedLine({ line, ...props }) {
    const { data, color, fill, smooth, movingAverage, arrows, strokeWidth, dashed } = line;
    const pathProps = useMemo(() => !arrows && getPathProps({ strokeWidth, dashed }), [
        arrows,
        strokeWidth,
        dashed,
    ]);

    const averageLine = useMemo(
        () =>
            !arrows && data.length && <AverageLine {...props} data={data} value={movingAverage} />,
        [arrows, data, movingAverage, props],
    );

    const constantColor = typeof color === 'string';

    const linePath = useMemo(
        () =>
            constantColor &&
            !arrows &&
            data.length &&
            getSingleLinePath({
                data,
                smooth,
                fill,
                ...props,
            }),
        [constantColor, arrows, data, smooth, fill, props],
    );

    const styleProps = useMemo(
        () => constantColor && !arrows && data.length && getStyleProps(fill, color),
        [constantColor, arrows, data, fill, color],
    );

    if (!(data.length && props.minY !== props.maxY)) {
        return null;
    }
    if (arrows) {
        return <ArrowLine data={data} color={color} {...props} />;
    }
    if (constantColor) {
        return (
            <g>
                <path d={linePath} {...styleProps} {...pathProps} />
                {averageLine}
            </g>
        );
    }

    const lineProps = {
        data,
        color,
        fill,
        smooth,
        movingAverage,
        pathProps,
    };

    return (
        <DynamicColorLine {...lineProps} {...props}>
            {averageLine}
        </DynamicColorLine>
    );
}

RenderedLine.propTypes = {
    line: lineShape,
    minY: PropTypes.number,
    maxY: PropTypes.number,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    valX: PropTypes.func.isRequired,
    valY: PropTypes.func.isRequired,
};
