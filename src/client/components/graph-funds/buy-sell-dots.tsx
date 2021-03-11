import React from 'react';

import { getFundLineName } from './name';

import { Arrow } from '~client/components/arrow';
import type { SiblingProps } from '~client/components/graph';
import { GRAPH_FUNDS_OVERALL_ID, Mode } from '~client/constants/graph';
import { colors } from '~client/styled/variables';
import type { FundLine } from '~client/types';

export type Props = SiblingProps & {
  fundLines: FundLine[];
  startTime: number;
  mode: Mode;
};

export const BuySellDots: React.FC<Props> = ({
  fundLines,
  hlPoint,
  mode,
  pixX,
  pixY1,
  startTime,
}) => (
  <g>
    {fundLines
      .filter(
        (fund) =>
          (mode !== Mode.Value || fund.id === GRAPH_FUNDS_OVERALL_ID) &&
          hlPoint &&
          getFundLineName(fund.id, fund.item) === hlPoint.group,
      )
      .reduce<Pick<FundLine, 'id' | 'orders' | 'data'>[]>(
        (last, next) =>
          next.id === last[last.length - 1]?.id
            ? [
                ...last.slice(0, last.length - 1),
                {
                  ...last[last.length - 1],
                  data: [...last[last.length - 1].data, ...next.data],
                },
              ]
            : [
                ...last,
                {
                  id: next.id,
                  orders: next.orders,
                  data: next.data,
                },
              ],
        [],
      )
      .map(({ id, orders, data }) => (
        <g key={id}>
          {orders
            .filter((order) => !order.isReinvestment)
            .map((order) => {
              const linePoint = data.find(([x]) => x >= order.time - startTime);
              if (!linePoint) {
                return null;
              }
              return (
                <Arrow
                  key={order.time}
                  startX={linePoint[0]}
                  startY={linePoint[1]}
                  length={10}
                  angle={order.isSell ? -Math.PI / 2 : Math.PI / 2}
                  color={order.isSell ? colors.loss.dark : colors.profit.dark}
                  fill={true}
                  arrowSize={-0.1}
                  pixX={pixX}
                  pixY={pixY1}
                />
              );
            })}
        </g>
      ))}
  </g>
);
