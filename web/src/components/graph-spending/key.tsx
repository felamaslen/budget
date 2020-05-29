import getUnixTime from 'date-fns/getUnixTime';
import React from 'react';
import { BaseKey } from '~client/components/graph-cashflow/base-key';
import { COLOR_SPENDING, COLOR_TRANSLUCENT_LIGHT, COLOR_DARK } from '~client/constants/colors';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { rgba } from '~client/modules/color';
import { Range, PixPrimary } from '~client/types/graph';

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
      <line x1={50} y1={40} x2={74} y2={40} stroke={rgba(COLOR_SPENDING)} strokeWidth={2} />
      <text
        x={78}
        y={40}
        fill={rgba(COLOR_DARK)}
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
        fill={rgba(COLOR_TRANSLUCENT_LIGHT)}
      />
    </BaseKey>
  );
};
