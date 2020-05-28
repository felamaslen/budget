import React, { useMemo } from 'react';
import { getSingleLinePath } from './helpers';
import { arrayAverage } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import { Data, Point, Calc } from '~client/types/graph';

type Props = {
  value?: number;
  data: Data;
  secondary?: boolean;
} & Calc;

export const AverageLine: React.FC<Props> = ({ value, data, secondary, ...props }) => {
  const averageLinePath = useMemo(() => {
    if (!value) {
      return null;
    }

    const [points] = data.reduce(
      ([lastPoints, compareData]: [Data, number[]], [xValue, yValue]: Point): [Data, number[]] => {
        const nextCompareData = compareData.slice(1 - value).concat([yValue]);

        return [lastPoints.concat([[xValue, arrayAverage(nextCompareData)]]), nextCompareData];
      },
      [[], []],
    );

    if (!points.length) {
      return null;
    }

    return getSingleLinePath({
      ...props,
      data: points,
      secondary,
      smooth: true,
      fill: false,
    });
  }, [value, data, props, secondary]);

  if (!averageLinePath) {
    return null;
  }

  return (
    <path
      d={averageLinePath}
      stroke={colors['medium-very-light']}
      strokeDasharray="3,5"
      strokeWidth={1}
      fill="none"
    />
  );
};
