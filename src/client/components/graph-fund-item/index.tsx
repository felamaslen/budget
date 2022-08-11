import loadable from '@loadable/component';
import getUnixTime from 'date-fns/getUnixTime';
import { useCallback, useMemo, useState } from 'react';
import Loader from 'react-spinners/PuffLoader';

import { graphColor } from './color';
import { processPoints, TransactionsSplitAdj } from './process-data';
import * as Styled from './styles';

import { LineGraph } from '~client/components/graph';
import type { LineGraphProps } from '~client/components/graph/line-graph';
import { GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_HEIGHT } from '~client/constants/graph';
import { getUnitRebase } from '~client/modules/data';
import { FundNative, Line, Point, Range, RowPrices, Size } from '~client/types';

export type Props = {
  fund: FundNative;
  sold: boolean;
  values: RowPrices;
};

export const Popout = loadable(() => import('./popout'), { fallback: <Loader size={24} /> });

function getDimensions(sold: boolean): Size {
  if (sold) {
    return { width: GRAPH_FUND_ITEM_WIDTH, height: GRAPH_FUND_ITEM_HEIGHT / 2 };
  }
  return { width: GRAPH_FUND_ITEM_WIDTH, height: GRAPH_FUND_ITEM_HEIGHT };
}

const getRange = (data: number[]): { min: number; max: number } =>
  data.reduce(
    ({ min, max }, value) => ({
      min: Math.min(min, value),
      max: Math.max(max, value),
    }),
    { min: Infinity, max: -Infinity },
  );

function processData(
  fund: FundNative,
  transactions: TransactionsSplitAdj,
  prices: NonNullable<RowPrices>,
): Range & Pick<LineGraphProps, 'lines'> {
  const dataX = prices.map((line) => line.map(({ date }) => getUnixTime(date)));
  const dataY = prices.map((line) => line.map(({ priceSplitAdj }) => priceSplitAdj));

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  if (prices.length) {
    ({ min: minX, max: maxX } = getRange(dataX.flat()));
    ({ min: minY, max: maxY } = getRange(dataY.flat()));

    if (minY === maxY) {
      const range = minY / 100;

      minY -= range;
      maxY += range;
    }
  }

  const lines = prices.map<Line>((line, index) => {
    const points = processPoints(fund.stockSplits, transactions, line);

    return {
      key: `${fund.id}-${line[0].date}`,
      name: fund.item,
      data: dataX[index].map<Point>((x, pointIndex) => [x, dataY[index][pointIndex]]),
      strokeWidth: 1,
      smooth: true,
      color: graphColor(points),
    };
  });

  return {
    lines,
    minX,
    maxX,
    minY,
    maxY,
  };
}

export const GraphFundItem: React.FC<Props> = ({ fund, sold, values }) => {
  const transactionsSplitAdj = useMemo(
    () =>
      fund.transactions.map((transaction) => {
        const unitRebase = getUnitRebase(fund.stockSplits, transaction.date);

        return {
          date: transaction.date,
          price: transaction.price / unitRebase,
          units: transaction.units * unitRebase,
        };
      }),
    [fund.stockSplits, fund.transactions],
  );

  const [popout, setPopout] = useState<boolean>(false);
  const onFocus = useCallback(() => setPopout(!sold), [sold]);
  const onBlur = useCallback(() => setPopout(false), []);
  const processedData = useMemo(
    () => processData(fund, transactionsSplitAdj, values ?? []),
    [fund, transactionsSplitAdj, values],
  );

  if (!values?.length) {
    return null;
  }

  return (
    <Styled.FundGraph
      role="button"
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      data-testid="fund-graph"
      sold={sold}
      popout={popout}
    >
      {popout && <Popout {...fund} transactions={transactionsSplitAdj} />}
      {!popout && <LineGraph {...processedData} {...getDimensions(sold)} />}
    </Styled.FundGraph>
  );
};
