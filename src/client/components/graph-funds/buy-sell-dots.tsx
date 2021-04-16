import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import React, { Fragment } from 'react';
import { replaceAtIndex } from 'replace-array';

import { getFundLineName } from './name';

import { Arrow } from '~client/components/arrow';
import type { SiblingProps } from '~client/components/graph';
import type { HLPoint } from '~client/components/graph/hooks';
import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colors } from '~client/styled/variables';
import type { FundLine, FundOrder, Point } from '~client/types';
import { FundMode } from '~client/types/enum';

export type Props = SiblingProps & {
  fundLines: FundLine[];
  startTime: number;
  mode: FundMode;
};

type FundOrderWithLinePoint = FundOrder & { linePoint: Point };

const combineFundOrdersByMatchedDate = (
  orders: FundOrderWithLinePoint[],
): FundOrderWithLinePoint[] =>
  orders.reduce<FundOrderWithLinePoint[]>(
    (last, order, index) =>
      index > 0 && order.linePoint[0] === last[last.length - 1].linePoint[0]
        ? replaceAtIndex(last, last.length - 1, (prev) => ({
            ...prev,
            size: prev.size + order.size,
          }))
        : [...last, order],
    [],
  );

const groupFundOrdersByType = (orders: FundOrderWithLinePoint[]): FundOrderWithLinePoint[] => {
  const buys = orders.filter((order) => !order.isSell && !order.isReinvestment);
  const sells = orders.filter((order) => order.isSell);
  const drips = orders.filter((order) => order.isReinvestment);

  return flatten([buys, sells, drips].map(combineFundOrdersByMatchedDate));
};

const shouldShowOrders = (mode: FundMode, hlPoint: HLPoint | undefined) => (
  fundLine: FundLine,
): boolean => {
  if (!hlPoint) {
    return false;
  }
  if (fundLine.id === GRAPH_FUNDS_OVERALL_ID) {
    return true;
  }
  return mode === FundMode.Value && getFundLineName(fundLine.id, fundLine.item) === hlPoint.group;
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
    {Object.entries(groupBy(fundLines.filter(shouldShowOrders(mode, hlPoint)), 'id'))
      .map<Pick<FundLine, 'id' | 'orders' | 'data'>>(([, lineParts]) => ({
        id: lineParts[0].id,
        orders: lineParts[0].orders,
        data: flatten(lineParts.map((part) => part.data)),
      }))
      .map(({ id, orders, data }) => (
        <Fragment key={id}>
          {groupFundOrdersByType(
            orders
              .filter(
                (order) =>
                  !order.isReinvestment &&
                  // Require the visible scraped data to contain the transaction date
                  data.some(([x]) => x < order.time - startTime) &&
                  data.some(([x]) => x >= order.time - startTime),
              )
              .map<FundOrderWithLinePoint>((order) => {
                const linePointIndex = data.findIndex(([x]) => x >= order.time - startTime);
                return { ...order, linePoint: data[Math.max(0, linePointIndex - 1)] };
              }),
          ).map((order) => (
            <Arrow
              key={`${order.time}-${order.isSell ? 'sell' : 'buy'}`}
              startX={order.linePoint[0]}
              startY={order.linePoint[1]}
              length={mode === FundMode.Roi ? 10 : pixY1(0) - pixY1(order.size)}
              angle={order.isSell ? -Math.PI / 2 : Math.PI / 2}
              color={order.isSell ? colors.loss.dark : colors.profit.dark}
              fill={true}
              arrowSize={-0.1}
              pixX={pixX}
              pixY={pixY1}
            />
          ))}
        </Fragment>
      ))}
  </g>
);
