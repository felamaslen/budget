import getUnixTime from 'date-fns/getUnixTime';
import React from 'react';
import { BaseKey } from '~client/components/graph-cashflow/base-key';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { colors } from '~client/styled/variables';
import { Page, Range, PixPrimary } from '~client/types';

type Props = PixPrimary &
  Omit<Range, 'minX'> & {
    now: Date;
    title: string;
  };

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

export const Key: React.FC<Props> = ({ now, pixX, pixY1, maxX, minY, maxY, title }) => {
  const future0 = pixX(getUnixTime(now));
  const future1 = pixY1(maxY);
  const futureW = pixX(maxX) - future0;
  const futureH = pixY1(minY) - future1;

  return (
    <BaseKey title={title}>
      <line
        x1={50}
        y1={40}
        x2={74}
        y2={40}
        stroke={colors[Page.overview].spending}
        strokeWidth={2}
      />
      <text
        x={78}
        y={40}
        fill={colors.dark.light}
        fontFamily={fontFamily}
        fontSize={fontSize}
        alignmentBaseline="middle"
      >
        {'Spending'}
      </text>

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
