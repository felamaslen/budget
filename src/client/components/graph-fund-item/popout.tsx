/* @jsx jsx */
import { jsx } from '@emotion/react';
import { FC, useCallback, useMemo } from 'react';

import { graphColor } from './color';
import * as Styled from './styles.popout';

import { LineGraph, LineGraphProps } from '~client/components/graph/line-graph';
import { TimeAxes } from '~client/components/graph/time-axes';
import { GRAPH_FUND_ITEM_HEIGHT_LARGE, GRAPH_FUND_ITEM_WIDTH_LARGE } from '~client/constants';
import { useFundHistoryIndividualQuery } from '~client/hooks/gql';
import { lastInArray } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import { DrawProps, Id, Line, Padding, Point, Range } from '~client/types';
import type { FundHistoryIndividual } from '~client/types/gql';

export type Props = {
  id: Id;
};

function processData(id: Id, data: FundHistoryIndividual): Range & Pick<LineGraphProps, 'lines'> {
  const points = data.values.map<Point>(({ date, price }) => [date, price]);
  const minX = data.values[0]?.date ?? 0;
  const maxX = lastInArray(data.values)?.date ?? minX;
  const minY = data.values.reduce<number>((last, { price }) => Math.min(last, price), Infinity);
  const maxY = data.values.reduce<number>((last, { price }) => Math.max(last, price), 0);

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

export const GraphFundItemPopout: FC<Props> = ({ id }) => {
  const [{ data, fetching, error }] = useFundHistoryIndividualQuery({ variables: { id } });

  const BeforeLines = useCallback<FC<DrawProps>>(
    (props) => <TimeAxes {...props} labelY={labelY} hideLines outerTicks />,
    [],
  );

  const processedData = useMemo(
    () => processData(id, data?.fundHistoryIndividual ?? { values: [] }),
    [id, data],
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
