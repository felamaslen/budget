import { FC, useCallback, useMemo } from 'react';

import { graphColor } from './color';
import { costBasisLine } from './cost-basis';
import { processPoints, TransactionsSplitAdj } from './process-data';
import * as Styled from './styles.popout';

import { LineGraph, LineGraphProps } from '~client/components/graph/line-graph';
import { TimeAxes } from '~client/components/graph/time-axes';
import { GRAPH_FUND_ITEM_HEIGHT_LARGE, GRAPH_FUND_ITEM_WIDTH_LARGE } from '~client/constants';
import { useFundHistoryIndividualQuery } from '~client/hooks/gql';
import { lastInArray } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import type {
  DrawProps,
  FundNative,
  Id,
  Line,
  Padding,
  Range,
  StockSplitNative,
} from '~client/types';
import type { FundHistoryIndividual } from '~client/types/gql';

export type Props = Pick<FundNative, 'id' | 'stockSplits'> & {
  transactions: TransactionsSplitAdj;
};

const labelY = (value: number): string => `${value.toFixed(1)}p`;

const padding: Padding = [0, 0, 24, 24];

function processData(
  id: Id,
  { values }: FundHistoryIndividual,
  stockSplits: StockSplitNative[],
  transactions: { date: Date; price: number; units: number }[],
): Range & Pick<LineGraphProps, 'lines'> {
  const points = processPoints(stockSplits, transactions, values);

  const minX = values[0]?.date ?? 0;
  const maxX = lastInArray(values)?.date ?? minX;
  const minY = points.reduce<number>(
    (last, { costBasis, point: [, price] }) =>
      costBasis > 0 ? Math.min(last, costBasis, price) : Math.min(last, price),
    Infinity,
  );
  const maxY = points.reduce<number>(
    (last, { costBasis, point: [, price] }) =>
      costBasis > 0 ? Math.max(last, costBasis, price) : Math.max(last, price),
    0,
  );

  const lines: Line[] = [
    costBasisLine({
      key: `fund-history-popout-cost-basis-${id}`,
      name: 'Fund history cost basis',
      data: points.map(({ costBasis, point }) => [point[0], costBasis]),
    }),
    {
      key: `fund-history-popout-${id}`,
      name: 'Fund history',
      data: points.map(({ point }) => point),
      color: points.length > 0 ? graphColor(points) : colors.black,
      strokeWidth: 1,
      smooth: false,
    },
  ];

  return {
    minX,
    maxX,
    minY,
    maxY,
    lines,
  };
}

export const GraphFundItemPopout: FC<Props> = ({ id, stockSplits, transactions }) => {
  const [{ data, fetching, error }] = useFundHistoryIndividualQuery({ variables: { id } });

  const BeforeLines = useCallback<FC<DrawProps>>(
    (props) => <TimeAxes {...props} labelY={labelY} hideLines outerTicks />,
    [],
  );

  const processedData = useMemo(
    () => processData(id, data?.fundHistoryIndividual ?? { values: [] }, stockSplits, transactions),
    [id, data, stockSplits, transactions],
  );

  return (
    <Styled.Popout>
      {fetching && 'Loading data...'}
      {!fetching && error && `Error: ${error.message}`}
      {!fetching && data && (
        <LineGraph
          height={GRAPH_FUND_ITEM_HEIGHT_LARGE}
          width={GRAPH_FUND_ITEM_WIDTH_LARGE}
          padding={padding}
          BeforeLines={BeforeLines}
          {...processedData}
        />
      )}
    </Styled.Popout>
  );
};
export default GraphFundItemPopout;
