import { rgba } from 'polished';
import React, { useState, useCallback, useMemo, useContext } from 'react';
import { useSelector } from 'react-redux';

import * as Styled from './styles';
import { BlockName, BlockPacker } from '~client/components/block-packer';
import { GRAPH_WIDTH, GRAPH_HEIGHT } from '~client/constants/graph';
import { TodayContext } from '~client/hooks';
import { blockPacker } from '~client/modules/block-packer';
import { colorKey } from '~client/modules/color';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { getCashBreakdown, getPortfolio, getStockValue } from '~client/selectors';
import { Button } from '~client/styled/shared';
import { colors } from '~client/styled/variables';
import type { BlockItem, Id, PortfolioItem } from '~client/types';
import { abbreviateFundName } from '~shared/abbreviation';

const formatLabel = (value: number, total: number, suffix: string): string =>
  `(${formatPercent(value / total, { precision: 1 })}) [${formatCurrency(value, {
    abbreviate: true,
    precision: 1,
  })}] ${suffix}`;

const StockHelp: React.FC<{ item: PortfolioItem }> = ({
  item: {
    item,
    value,
    metadata: {
      unitsBought,
      buyPriceSplitAdj,
      unitsSold,
      sellPriceSplitAdj,
      unitsReinvested,
      reinvestmentPriceSplitAdj,
      feesPaid,
      taxesPaid,
      totalCostOfHolding,
      pnl,
      currentPrice,
    },
  },
}) => (
  <>
    <h6>
      Summary for <em>{item}</em>
    </h6>
    <table>
      <tbody>
        <tr>
          <th>Units bought</th>
          <td>
            {unitsBought} @ {buyPriceSplitAdj ? formatCurrency(buyPriceSplitAdj) : 'N/A'}
          </td>
        </tr>
        <tr>
          <th>Units sold</th>
          <td>
            {unitsSold} @ {sellPriceSplitAdj ? formatCurrency(sellPriceSplitAdj) : 'N/A'}
          </td>
        </tr>
        <tr>
          <th>Units reinvested from dividends</th>
          <td>
            {unitsReinvested} @{' '}
            {reinvestmentPriceSplitAdj ? formatCurrency(reinvestmentPriceSplitAdj) : 'N/A'}
          </td>
        </tr>
        <tr>
          <th>Total fees paid</th>
          <td>{formatCurrency(feesPaid)}</td>
        </tr>
        <tr>
          <th>Total taxes paid</th>
          <td>{formatCurrency(taxesPaid)}</td>
        </tr>
        <tr>
          <th>Current price</th>
          <td>{formatCurrency(currentPrice)}</td>
        </tr>
        <tr>
          <th>Current value of holding</th>
          <td>{formatCurrency(value)}</td>
        </tr>
        <tr>
          <th>PnL</th>
          <td>
            {formatCurrency(pnl, { brackets: true })} {pnl > 0 ? '☝' : '☟'}{' '}
            {formatPercent(pnl / totalCostOfHolding)}
          </td>
        </tr>
      </tbody>
    </table>
  </>
);

export const FundWeights: React.FC = () => {
  const today = useContext(TodayContext);
  const portfolio = useSelector(getPortfolio(today));
  const stockValue = useSelector(getStockValue(today));
  const { cashInBank, cashToInvest, breakdown } = useSelector(getCashBreakdown(today));

  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [stockInfoHelp, setStockInfoHelp] = useState<Id | null>(null);

  const blocks = useMemo(() => {
    const relevantNetWorth = cashInBank + cashToInvest + stockValue;

    return blockPacker<BlockItem>(GRAPH_WIDTH, GRAPH_HEIGHT, [
      {
        name: 'Stocks',
        total: stockValue,
        color: colors.transparent,
        subTree: portfolio.map<BlockItem>(({ id, item, value }) => {
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
            onClick: (): void => {
              setStockInfoHelp(id);
            },
          };
        }),
      },
      {
        name: 'Cash',
        total: cashInBank + cashToInvest,
        color: 'grey',
        text: <Styled.Label small={cashToInvest < relevantNetWorth / 20}>Cash</Styled.Label>,
        subTree: [
          {
            name: formatLabel(cashToInvest, relevantNetWorth, 'Cash to invest'),
            total: cashToInvest,
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
  const onHover = useCallback((main?: BlockName, sub?: BlockName) => {
    setStatus(sub ?? main ?? '');
  }, []);

  if (!portfolio.length) {
    return null;
  }

  return (
    <>
      <BlockPacker blocks={blocks} onHover={onHover} status={status} />
      <Styled.HelpButton>
        <Button
          onClick={(): void => {
            if (stockInfoHelp) {
              setStockInfoHelp(null);
            } else {
              setHelpOpen((last) => !last);
            }
          }}
        >
          {helpOpen || stockInfoHelp ? 'Close help' : '?'}
        </Button>
      </Styled.HelpButton>
      {helpOpen && (
        <Styled.InfoDialogBackground>
          <Styled.InfoDialog>
            <h6>Cash breakdown:</h6>
            <table>
              <tbody>
                <Styled.InfoDialogRowRawValue>
                  <th>
                    C<sub>e</sub>
                  </th>
                  <th>= Net worth &ldquo;Cash (easy access)&rdquo;</th>
                  <td>{formatCurrency(breakdown.Ce)}</td>
                </Styled.InfoDialogRowRawValue>
                <Styled.InfoDialogRowRawValue>
                  <th>S</th>
                  <th>= Net worth &ldquo;Stocks&rdquo;</th>
                  <td>{formatCurrency(breakdown.S)}</td>
                </Styled.InfoDialogRowRawValue>
                <Styled.InfoDialogRowRawValue>
                  <th>
                    V<sub>d</sub>
                  </th>
                  <th>= Stock value at net worth date</th>
                  <td>{formatCurrency(breakdown.Vd)}</td>
                </Styled.InfoDialogRowRawValue>
                <Styled.InfoDialogRowRawValue>
                  <th>I</th>
                  <th>= Investments since net worth date</th>
                  <td>{formatCurrency(breakdown.I)}</td>
                </Styled.InfoDialogRowRawValue>
                <Styled.InfoDialogRowRawValue>
                  <th>N</th>
                  <th>= Income since net worth date</th>
                  <td>{formatCurrency(breakdown.N)}</td>
                </Styled.InfoDialogRowRawValue>
                <Styled.InfoDialogRowRawValue>
                  <th>P</th>
                  <th>= Purchases since net worth date</th>
                  <td>{formatCurrency(breakdown.P)}</td>
                </Styled.InfoDialogRowRawValue>
                <Styled.InfoDialogRowDerived>
                  <th>
                    C<sub>d</sub>
                  </th>
                  <th>
                    = Cash to invest at net worth date = max{'{'}0, S - V<sub>d</sub>
                    {'}'}
                  </th>
                  <td>{formatCurrency(Math.max(0, breakdown.S - breakdown.Vd))}</td>
                </Styled.InfoDialogRowDerived>
                <Styled.InfoDialogRowImportant>
                  <th>
                    C<sub>b</sub>
                  </th>
                  <th>
                    = Cash in bank = C<sub>e</sub> + N - P - max{'{'}0, I - C<sub>d</sub>
                    {'}'}
                  </th>
                  <td>{formatCurrency(cashInBank)}</td>
                </Styled.InfoDialogRowImportant>
                <Styled.InfoDialogRowImportant>
                  <th>
                    C<sub>i</sub>
                  </th>
                  <th>
                    = Cash to invest = max{'{'}0, S - V<sub>d</sub> - I{'}'}
                  </th>
                  <td>{formatCurrency(cashToInvest)}</td>
                </Styled.InfoDialogRowImportant>
              </tbody>
            </table>
          </Styled.InfoDialog>
        </Styled.InfoDialogBackground>
      )}
      {stockInfoHelp && !helpOpen && (
        <Styled.InfoDialogBackground>
          <Styled.InfoDialog>
            <StockHelp item={portfolio.find(({ id }) => id === stockInfoHelp) as PortfolioItem} />
          </Styled.InfoDialog>
        </Styled.InfoDialogBackground>
      )}
    </>
  );
};
