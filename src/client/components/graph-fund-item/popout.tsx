import fromUnixTime from 'date-fns/fromUnixTime';
import { FC, useCallback, useMemo } from 'react';

import { graphColor } from './color';
import * as Styled from './styles.popout';

import { LineGraph, LineGraphProps } from '~client/components/graph/line-graph';
import { TimeAxes } from '~client/components/graph/time-axes';
import { GRAPH_FUND_ITEM_HEIGHT_LARGE, GRAPH_FUND_ITEM_WIDTH_LARGE } from '~client/constants';
import { useFundHistoryIndividualQuery } from '~client/hooks/gql';
import { getUnitRebase, lastInArray } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import type { DrawProps, Id, Line, Padding, Point, Range, StockSplitNative } from '~client/types';
import type { FundHistoryIndividual } from '~client/types/gql';

export type Props = {
  id: Id;
  stockSplits: StockSplitNative[];
};

function processData(
  id: Id,
  data: FundHistoryIndividual,
  stockSplits: StockSplitNative[],
): Range & Pick<LineGraphProps, 'lines'> {
  const points = data.values.map<Point>(({ date, price }) => {
    const unitRebase = getUnitRebase(stockSplits, fromUnixTime(date));
    return [date, price / unitRebase];
  });
  const minX = data.values[0]?.date ?? 0;
  const maxX = lastInArray(data.values)?.date ?? minX;
  const minY = points.reduce<number>((last, [, price]) => Math.min(last, price), Infinity);
  const maxY = points.reduce<number>((last, [, price]) => Math.max(last, price), 0);

  const lines: Line[] = [
    {
      key: `fund-history-popout-${id}`,
      name: 'Fund history',
      data: points,
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

const labelY = (value: number): string => `${value.toFixed(1)}p`;

const padding: Padding = [0, 0, 24, 24];

export const GraphFundItemPopout: FC<Props> = ({ id, stockSplits }) => {
  const [{ data, fetching, error }] = useFundHistoryIndividualQuery({ variables: { id } });

  const BeforeLines = useCallback<FC<DrawProps>>(
    (props) => <TimeAxes {...props} labelY={labelY} hideLines outerTicks />,
    [],
  );

  const processedData = useMemo(
    () => processData(id, data?.fundHistoryIndividual ?? { values: [] }, stockSplits),
    [id, data, stockSplits],
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
