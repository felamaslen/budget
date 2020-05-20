import React, { memo, useMemo } from 'react';
import { averageColor, scoreColor } from '~client/modules/color';
import { colors } from '~client/styled/variables';

import * as Styled from './styles';
import { Page } from '~client/types/app';

const categories = ['bills', 'food', 'general', 'holiday', 'social'];

const rB = 0.1;

type Props = {
  data: number[][];
};

const Timeline: React.FC<Props> = ({ data }) => {
  const sums = useMemo(() => data.map(row => row.reduce((sum, value) => sum + value, 0)), [data]);
  const getSumScore = useMemo<(value: number) => number>(() => {
    const range = sums.reduce((max, sum) => Math.max(max, sum), -Infinity);
    const rA = (Math.E ** (1 / rB) - 1) / range;

    return (value): number => rB * Math.log(rA * value + 1);
  }, [sums]);

  return (
    <Styled.Timeline>
      {data.map((row, timeIndex) => {
        const score = getSumScore(sums[timeIndex]);
        const backgroundColor = averageColor(
          row
            .map(value => score * (value / sums[timeIndex]) || 0)
            .map((value, index) =>
              scoreColor(Reflect.get(colors[Page.overview].category, categories[index]), value),
            ),
        );

        return <Styled.DataItem key={timeIndex} color={backgroundColor} />;
      })}
    </Styled.Timeline>
  );
};

export default memo(Timeline);
