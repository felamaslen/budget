import React from 'react';
import { getDynamicLinePaths } from '~client/components/graph/helpers';
import { RangeY, Pix, Data, PathProps, DynamicLineColor } from '~client/types/graph';

export type Props = {
  fill?: boolean;
  data: Data;
  smooth?: boolean;
  color: DynamicLineColor;
  children?: React.ReactNode;
  pathProps: PathProps;
} & RangeY &
  Pix;

export const DynamicColorLine: React.FC<Props> = ({
  fill,
  data,
  smooth,
  color,
  children,
  pathProps,
  ...props
}) => {
  if (props.minY === props.maxY) {
    return null;
  }
  if (fill) {
    throw new Error('Dynamically coloured, filled graph not implemented');
  }

  return (
    <g>
      {children}
      {getDynamicLinePaths({
        data,
        smooth,
        color,
        ...props,
      }).map(({ path, stroke }, key) => (
        <path key={key} d={path} stroke={stroke} {...pathProps} fill="none" />
      ))}
    </g>
  );
};
