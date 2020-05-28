import { compose } from '@typed/compose';
import { setLightness, rgba } from 'polished';
import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import * as Styled from './styles';
import { BlockPacker } from '~client/components/BlockPacker';
import { GRAPH_WIDTH, GRAPH_HEIGHT } from '~client/constants/graph';
import { blockPacker } from '~client/modules/block-packer';
import { colorKey } from '~client/modules/color';
import { abbreviateFundName } from '~client/modules/finance';
import { formatPercent } from '~client/modules/format';
import { getNetWorthTable } from '~client/selectors';
import { colors } from '~client/styled/variables';
import { Portfolio, Aggregate, BlockItem } from '~client/types';

export type Props = {
  portfolio: Portfolio;
};

export const FundWeights: React.FC<Props> = ({ portfolio }) => {
  const netWorth = useSelector(getNetWorthTable);

  const blocks = useMemo(() => {
    const latestNetWorth = netWorth[netWorth.length - 1]?.aggregate;

    const stocksIncludingCash = latestNetWorth?.[Aggregate.stocks] ?? 0;
    const otherCash =
      (latestNetWorth?.[Aggregate.cashOther] ?? 0) +
      (latestNetWorth?.[Aggregate.cashEasyAccess] ?? 0);

    const relevantNetWorth = stocksIncludingCash + otherCash;

    const stockValue = portfolio.reduce<number>((last, { value }) => last + value, 0);
    const cashToInvest = stocksIncludingCash - stockValue;
    const allCash = cashToInvest + otherCash;

    return blockPacker<BlockItem>(GRAPH_WIDTH, GRAPH_HEIGHT, [
      {
        name: 'Stocks',
        total: stockValue,
        color: colors.transparent,
        subTree: portfolio.map(({ item, value }) => {
          const nameAbbreviated = abbreviateFundName(item);

          return {
            name: `(${formatPercent(value / relevantNetWorth, { precision: 1 })}) ${item}`,
            total: value,
            color: compose(setLightness(0.3))(colorKey(item)),
            text: (
              <Styled.Label small={nameAbbreviated.length > 5 || value < stockValue / 40}>
                {nameAbbreviated}
              </Styled.Label>
            ),
          };
        }),
      },
      {
        name: 'Cash',
        total: allCash,
        color: 'grey',
        text: <Styled.Label small={allCash < relevantNetWorth / 20}>Cash</Styled.Label>,
        subTree: [
          {
            name: `(${formatPercent(cashToInvest / relevantNetWorth, {
              precision: 1,
            })}) Cash to invest`,
            total: cashToInvest,
            color: colors.transparent,
          },
          {
            name: `(${formatPercent(otherCash / relevantNetWorth, {
              precision: 1,
            })}) Cash in bank`,
            total: otherCash,
            color: rgba(colors.green, 0.1),
          },
        ],
      },
    ]);
  }, [portfolio, netWorth]);

  const [status, setStatus] = useState<string>('');
  const onHover = useCallback((name?: string | null, subName?: string | null): void => {
    setStatus(subName ?? name ?? '');
  }, []);

  if (!portfolio.length) {
    return null;
  }

  return <BlockPacker blocks={blocks} onHover={onHover} status={status} />;
};
