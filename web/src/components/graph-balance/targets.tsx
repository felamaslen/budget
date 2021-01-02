import React from 'react';
import { getValuesWithTime } from '~client/components/graph-cashflow';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { exponentialRegression } from '~client/modules/data';
import { formatCurrency } from '~client/modules/format';
import { colors } from '~client/styled/variables';
import { Data } from '~client/types';

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

const targetPeriodYears = [1, 3, 5];

export type TargetValue = {
  tag: string;
  value: number;
};

export function getTargets(
  startDate: Date,
  allNetWorth: number[],
  showAll: boolean,
  oldOffset: number,
): {
  line: Data;
  targetValues: TargetValue[];
} {
  const { slope, intercept, logValues, points } = exponentialRegression(allNetWorth);
  if (!points.length) {
    return { line: [], targetValues: [] };
  }

  const targetValues = targetPeriodYears.map<TargetValue>((years) => ({
    tag: `${years}y`,
    value: Math.exp(slope * (logValues.length + years * 12) + intercept),
  }));

  const line = getValuesWithTime(showAll ? points : points.slice(oldOffset), {
    startDate,
    oldOffset: showAll ? oldOffset : 0,
  });

  return { line, targetValues };
}

type Props = {
  targetValues: TargetValue[];
};

const yOffset = 92;

export const Targets: React.FC<Props> = ({ targetValues }) => (
  <g>
    <rect
      x={48}
      y={yOffset - 4}
      width={64}
      height={targetValues.length * 22 - 4}
      fill={colors.translucent.light.dark}
    />
    {targetValues.map(({ tag, value }, index) => (
      <text
        key={tag}
        x={50}
        y={yOffset + 22 * index}
        fill={colors.dark.light}
        alignmentBaseline="hanging"
        fontFamily={fontFamily}
        fontSize={fontSize}
      >
        {`${formatCurrency(value, {
          raw: true,
          noPence: true,
          abbreviate: true,
          precision: 0,
        })} (${tag})`}
      </text>
    ))}
  </g>
);
