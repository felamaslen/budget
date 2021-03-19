import getUnixTime from 'date-fns/getUnixTime';
import React from 'react';
import { BaseKey } from '~client/components/graph-cashflow/base-key';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { colors } from '~client/styled/variables';
import type { PixPrimary, Range } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

type Props = PixPrimary &
  Omit<Range, 'minX'> & {
    now: Date;
    title: string;
    isCumulative: boolean;
  };

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

export const Key: React.FC<Props> = ({
  isCumulative,
  now,
  pixX,
  pixY1,
  maxX,
  minY,
  maxY,
  title,
}) => {
  const future0 = pixX(getUnixTime(now));
  const future1 = pixY1(maxY);
  const futureW = pixX(maxX) - future0;
  const futureH = pixY1(minY) - future1;

  const keys: { text: string; color: string }[] = [
    {
      text: `Spending (${isCumulative ? 'cumulative' : 'quarterly avg.'})`,
      color: colors[PageNonStandard.Overview].spending,
    },
    {
      text: isCumulative ? 'Income' : 'Savings ratio (yearly avg.)',
      color: colors.green,
    },
    {
      text: isCumulative ? 'Investments' : 'Investment ratio',
      color: colors[PageNonStandard.Funds].main,
    },
  ];

  return (
    <BaseKey title={title}>
      {keys.map(({ text, color }, index) => (
        <React.Fragment key={text}>
          <line
            x1={50}
            y1={40 + 18 * index}
            x2={74}
            y2={40 + 18 * index}
            stroke={color}
            strokeWidth={2}
          />
          <text
            x={78}
            y={40 + 18 * index}
            fill={colors.dark.light}
            fontFamily={fontFamily}
            fontSize={fontSize}
            alignmentBaseline="middle"
          >
            {text}
          </text>
        </React.Fragment>
      ))}
      <rect
        x={future0}
        y={future1}
        width={futureW}
        height={futureH}
        fill={colors.translucent.light.dark}
      />
    </BaseKey>
  );
};
