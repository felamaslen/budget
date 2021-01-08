import { rgba } from 'polished';
import React, { useState, useCallback, useMemo, useContext } from 'react';
import { useSelector } from 'react-redux';

import * as Styled from './styles';
import { BlockPacker } from '~client/components/block-packer';
import { GRAPH_WIDTH, GRAPH_HEIGHT } from '~client/constants/graph';
import { TodayContext } from '~client/hooks';
import { blockPacker } from '~client/modules/block-packer';
import { colorKey } from '~client/modules/color';
import { abbreviateFundName } from '~client/modules/finance';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { getCashToInvest, getPortfolio, getStockValue, getCashInBank } from '~client/selectors';
import { colors } from '~client/styled/variables';
import type { BlockItem } from '~client/types';

const formatLabel = (value: number, total: number, suffix: string): string =>
  `(${formatPercent(value / total, { precision: 1 })}) [${formatCurrency(value, {
    abbreviate: true,
    precision: 1,
  })}] ${suffix}`;

export const FundWeights: React.FC = () => {
  const today = useContext(TodayContext);
  const portfolio = useSelector(getPortfolio(today));
  const stockValue = useSelector(getStockValue(today));
  const cashToInvest = useSelector(getCashToInvest(today));
  const cashInBank = useSelector(getCashInBank(today));

  const blocks = useMemo(() => {
    const relevantNetWorth = cashToInvest + stockValue;

    return blockPacker<BlockItem>(GRAPH_WIDTH, GRAPH_HEIGHT, [
      {
        name: 'Stocks',
        total: stockValue,
        color: colors.transparent,
        subTree: portfolio.map(({ item, value }) => {
          const nameAbbreviated = abbreviateFundName(item);

          return {
            name: formatLabel(value, relevantNetWorth, item),
            total: value,
            color: colorKey(nameAbbreviated),
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
        total: cashToInvest,
        color: 'grey',
        text: <Styled.Label small={cashToInvest < relevantNetWorth / 20}>Cash</Styled.Label>,
        subTree: [
          {
            name: formatLabel(cashToInvest - cashInBank, relevantNetWorth, 'Cash to invest'),
            total: cashToInvest - cashInBank,
            color: colors.transparent,
          },
          {
            name: formatLabel(cashInBank, relevantNetWorth, 'Cash in bank'),
            total: cashInBank,
            color: rgba(colors.green, 0.1),
          },
        ],
      },
    ]);
  }, [portfolio, stockValue, cashToInvest, cashInBank]);

  const [status, setStatus] = useState<string>('');
  const onHover = useCallback((name?: string | null, subName?: string | null): void => {
    setStatus(subName ?? name ?? '');
  }, []);

  if (!portfolio.length) {
    return null;
  }

  return <BlockPacker blocks={blocks} onHover={onHover} status={status} />;
};