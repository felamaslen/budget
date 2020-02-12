import React, { useMemo } from 'react';

import { getPathProps, getSingleLinePath } from '~client/components/graph/helpers';
import { ArrowLine } from '~client/components/graph/arrow-line';
import { DynamicColorLine } from '~client/components/graph/dynamic-color-line';
import { AverageLine } from '~client/components/graph/average-line';
import { UnkeyedLine, RangeY, Calc, isConstantColor, PathProps } from '~client/types/graph';

function getStyleProps(
    fill: boolean,
    color: string,
): {
    fill: string;
    stroke: string;
} {
    if (fill) {
        return { fill: color, stroke: 'none' };
    }

    return { fill: 'none', stroke: color };
}

type Props = {
    line: UnkeyedLine;
} & RangeY &
    Calc;

export const RenderedLine: React.FC<Props> = ({ line, ...props }) => {
    const {
        data,
        secondary,
        color,
        fill,
        smooth,
        movingAverage,
        arrows,
        strokeWidth,
        dashed,
    } = line;
    const pathProps = useMemo<PathProps | false>(
        () => !arrows && getPathProps({ strokeWidth, dashed }),
        [arrows, strokeWidth, dashed],
    );

    const averageLine = useMemo(
        () =>
            !arrows &&
            data.length && (
                <AverageLine {...props} data={data} secondary={secondary} value={movingAverage} />
            ),
        [arrows, data, secondary, movingAverage, props],
    );

    const linePath = useMemo<string>(
        () =>
            (isConstantColor(color) &&
                !arrows &&
                data.length &&
                getSingleLinePath({
                    data,
                    secondary,
                    smooth,
                    fill,
                    ...props,
                })) ||
            '',
        [color, arrows, data, secondary, smooth, fill, props],
    );

    const styleProps = useMemo(
        () =>
            isConstantColor(color) && !arrows && data.length && getStyleProps(fill || false, color),
        [arrows, data, fill, color],
    );

    if (!(data.length && props.minY !== props.maxY)) {
        return null;
    }
    if (arrows || !pathProps) {
        return <ArrowLine data={data} secondary={secondary} color={color} {...props} />;
    }
    if (isConstantColor(color)) {
        return (
            <g>
                <path d={linePath} {...styleProps} {...pathProps} />
                {averageLine}
            </g>
        );
    }

    return (
        <DynamicColorLine
            data={data}
            color={color}
            fill={fill}
            smooth={smooth}
            pathProps={pathProps}
            {...props}
        >
            {averageLine}
        </DynamicColorLine>
    );
};
