import loadable from '@loadable/component';
import { flatten } from 'array-flatten';
import React, { useCallback, useMemo, useState } from 'react';
import Loader from 'react-spinners/PuffLoader';

import { graphColor } from './color';
import * as Styled from './styles';
import { LineGraph } from '~client/components/graph';
import type { LineGraphProps } from '~client/components/graph/line-graph';
import { GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_HEIGHT } from '~client/constants/graph';
import type { Data, Id, Line, Range, RowPrices, Size } from '~client/types';

export type Props = {
  id: Id;
  item: string;
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

function processData(item: string, data: Data[]): Range & Pick<LineGraphProps, 'lines'> {
  const dataX = flatten(data.map((line) => line.map(([xValue]) => xValue)));
  const dataY = flatten(data.map((line) => line.map(([, yValue]) => yValue)));

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  if (data.length) {
    ({ min: minX, max: maxX } = getRange(dataX));
    ({ min: minY, max: maxY } = getRange(dataY));

    if (minY === maxY) {
      const range = minY / 100;

      minY -= range;
      maxY += range;
    }
  }

  const lines = data.map<Line>((points, index) => ({
    key: String(index),
    name: item,
    data: points,
    strokeWidth: 1,
    smooth: true,
    color: graphColor(points),
  }));

  return {
    lines,
    minX,
    maxX,
    minY,
    maxY,
  };
}

export const GraphFundItem: React.FC<Props> = ({ id, item, sold, values }) => {
  const [popout, setPopout] = useState<boolean>(false);
  const onFocus = useCallback(() => setPopout(!sold), [sold]);
  const onBlur = useCallback(() => setPopout(false), []);
  const processedData = useMemo(() => processData(item, values ?? []), [item, values]);

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
      {popout && <Popout id={id} />}
      {!popout && <LineGraph {...processedData} {...getDimensions(sold)} />}
    </Styled.FundGraph>
  );
};
