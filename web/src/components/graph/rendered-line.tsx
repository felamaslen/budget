import React, { useMemo } from 'react';

import { ArrowLine } from './arrow-line';
import { AverageLine } from './average-line';
import { DynamicColorLine } from './dynamic-color-line';
import { getPathProps, getSingleLinePath } from './helpers';
import { UnkeyedLine, RangeY, Calc, isConstantColor, PathProps } from '~client/types';

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

export const RenderedLine: React.FC<Props> = ({
  line: { data, stack, secondary, color, fill, smooth, movingAverage, arrows, strokeWidth, dashed },
  ...props
}) => {
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
          stack,
          secondary,
          smooth,
          fill,
          ...props,
        })) ||
      '',
    [color, arrows, data, stack, secondary, smooth, fill, props],
  );

  const styleProps = useMemo(
    () => isConstantColor(color) && !arrows && data.length && getStyleProps(fill || false, color),
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
      stack={stack}
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
