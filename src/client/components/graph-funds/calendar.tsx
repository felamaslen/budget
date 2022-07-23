import { css } from '@emotion/react';
import styled from '@emotion/styled';
import formatDate from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import { rem } from 'polished';
import { useMemo } from 'react';

import HoverCost from '../hover-cost';

import { breakpoint, breakpoints, colors } from '~client/styled';
import type { FundItem, FundOrder } from '~client/types';
import { abbreviateFundName } from '~shared/abbreviation';
import { NetWorthAggregate } from '~shared/constants';

function arrow(order: Pick<FundOrder, 'isReinvestment' | 'isSell'>): string {
  if (order.isReinvestment) {
    return '↗';
  }
  return order.isSell ? '↓' : '↑';
}

function arrowColor(order: Pick<FundOrder, 'isReinvestment' | 'isSell'>): string {
  if (order.isReinvestment) {
    return colors.income.arrow;
  }
  return order.isSell ? colors.loss.dark : colors.profit.dark;
}

const CalendarContainer = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  overflow: hidden;

  ${breakpoint(breakpoints.mobile)} {
    padding: ${rem(20)} 0 0 0;
  }
`;

const CalendarList = styled.ul`
  display: grid;
  flex: 1;
  font-family: Hack, monospace;
  font-size: ${rem(13)};
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(auto-fill, ${rem(76)});
  list-style: none;
  margin: 0;
  overflow: auto;
  padding: 0;
`;

const CalendarItem = styled.li`
  align-items: center;
  display: grid;
  grid-template-columns: 3fr 1fr 2fr;
  grid-template-rows: ${rem(12)} auto ${rem(12)};
  height: ${rem(76)};
  overflow: hidden;
  padding: ${rem(8)} ${rem(4)};
  text-align: center;

  &:nth-of-type(8n + 2),
  &:nth-of-type(8n + 4),
  &:nth-of-type(8n + 5),
  &:nth-of-type(8n + 7) {
    opacity: 0.8;
  }
`;

const ItemDate = styled.span`
  grid-column: 1 / span 3;
  grid-row: 3;
`;

const ItemUnits = styled.span`
  font-size: ${rem(14)};
  font-weight: bold;
  grid-column: 1 / span 3;
  grid-row: 2;
  padding: ${rem(4)} 0;
`;

const ItemType = styled.span`
  font-size: ${rem(18)};
  grid-column: 2;
  grid-row: 1;
`;

const ItemName = styled.span`
  grid-column: 3;
  grid-row: 1;
  overflow: hidden;
  padding-left: ${rem(8)};
  position: relative;
  white-space: nowrap;
`;

const ItemValue = styled.span`
  grid-column: 1;
  grid-row: 1;
  height: 100%;
  position: relative;
`;

export const GraphFundsAsCalendar: React.FC<{
  fundItems: FundItem[];
  height: number;
  width: number;
}> = ({ fundItems }) => {
  const orderInfo = useMemo(
    () =>
      fundItems
        .filter((item) => item.id > 0)
        .flatMap((fund) =>
          fund.orders.map((order, index) => ({
            ...order,
            key: `${fund.id}-${order.time}-${index}`,
            name: abbreviateFundName(fund.item),
          })),
        )
        .sort((a, b) => b.time - a.time),
    [fundItems],
  );

  return (
    <CalendarContainer>
      <CalendarList>
        {orderInfo.map((order) => (
          <CalendarItem
            key={order.key}
            css={css`
              background: ${order.isPension
                ? colors.netWorth.aggregate[NetWorthAggregate.pension]
                : colors.netWorth.aggregate[NetWorthAggregate.stocks]};
            `}
          >
            <ItemDate>{formatDate(fromUnixTime(order.time), 'dd MMM yyyy')}</ItemDate>
            <ItemName>{order.name}</ItemName>
            <ItemType
              css={css`
                color: ${arrowColor(order)};
              `}
            >
              {arrow(order)}
            </ItemType>
            <ItemValue>
              <HoverCost value={order.units * order.price + order.fees} />
            </ItemValue>
            <ItemUnits>
              {order.units} @ {order.price}
            </ItemUnits>
          </CalendarItem>
        ))}
      </CalendarList>
    </CalendarContainer>
  );
};
