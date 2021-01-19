import React, { memo, SVGProps, useMemo } from 'react';

import { ArrowLine } from './arrow-line';
import { DynamicColorLine } from './dynamic-color-line';
import {
  getPathProps,
  getSingleLinePath,
  isConstantColor,
  transformToMovingAverage,
} from './helpers';
import type {
  UnkeyedLine,
  RangeY,
  Calc,
  PathProps,
  LineAppearance,
  Line,
  Data,
} from '~client/types';

function getStyleProps(fill: boolean | undefined, color: string): SVGProps<SVGPathElement> {
  if (fill) {
    return { fill: color, stroke: 'none' };
  }
  return { fill: 'none', stroke: color };
}

type ExtraProps = RangeY & Calc;

type Props = {
  line: UnkeyedLine;
} & ExtraProps;

type RenderedPathProps = {
  appearance: LineAppearance;
} & ExtraProps &
  Pick<Props['line'], 'data' | 'secondary' | 'stack'>;

const RenderedLinePath: React.FC<RenderedPathProps> = ({
  appearance,
  data,
  secondary,
  stack,
  ...props
}) => {
  const { color, dashed, fill, smooth, strokeWidth } = appearance;
  const pathProps = useMemo<PathProps>(() => getPathProps({ strokeWidth, dashed }), [
    strokeWidth,
    dashed,
  ]);

  const linePath = useMemo<string>(
    () =>
      (isConstantColor(color) &&
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
    [color, data, stack, secondary, smooth, fill, props],
  );

  if (isConstantColor(color)) {
    return <path d={linePath} {...getStyleProps(fill, color)} {...pathProps} />;
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
    />
  );
};

type AverageProps = {
  movingAverage: Required<Line>['movingAverage'];
  data: Data;
  secondary?: boolean;
} & RangeY &
  Calc;

const AverageLine: React.FC<AverageProps> = ({ data, movingAverage, ...props }) => {
  const { period, ...appearance } = movingAverage;
  const points = transformToMovingAverage(data, period);
  return points.length > 0 ? (
    <RenderedLinePath data={points} appearance={appearance} {...props} />
  ) : null;
};

const RenderedLine: React.FC<Props> = ({
  line: { data, stack, secondary, color, fill, smooth, movingAverage, arrows, strokeWidth, dashed },
  ...props
}) => {
  if (arrows) {
    return <ArrowLine data={data} secondary={secondary} color={color} {...props} />;
  }
  if (!data.length || props.minY === props.maxY) {
    return null;
  }

  return (
    <g>
      <RenderedLinePath
        data={data}
        stack={stack}
        secondary={secondary}
        appearance={{ color, dashed, fill, smooth, strokeWidth }}
        {...props}
      />
      {movingAverage && (
        <AverageLine data={data} secondary={secondary} movingAverage={movingAverage} {...props} />
      )}
    </g>
  );
};
const RenderedLineMemo = memo(RenderedLine);
export { RenderedLineMemo as RenderedLine };

type GroupProps = {
  lines: Line[];
} & ExtraProps;

const RenderedLineGroup: React.FC<GroupProps> = ({ lines, ...rest }) => (
  <>
    {lines.map((line) => (
      <RenderedLineMemo key={line.key} line={line} {...rest} />
    ))}
  </>
);
const RenderedLineGroupMemo = memo(RenderedLineGroup);
export { RenderedLineGroupMemo as RenderedLineGroup };
