import { flatten } from 'array-flatten';
import React, { useCallback, useState } from 'react';

import { Axes } from './axes';
import * as Styled from './styles';
import { LineGraph } from '~client/components/graph';
import {
  GRAPH_FUND_ITEM_WIDTH,
  GRAPH_FUND_ITEM_WIDTH_LARGE,
  GRAPH_FUND_ITEM_HEIGHT,
  GRAPH_FUND_ITEM_HEIGHT_LARGE,
} from '~client/constants/graph';
import { colors } from '~client/styled/variables';
import type { Data, DrawProps, Line, Range, RowPrices, Size } from '~client/types';

export type Props = {
  item: string;
  sold: boolean;
  values: RowPrices;
};

function getDimensions(popout: boolean, sold: boolean): Size {
  if (popout) {
    return {
      width: GRAPH_FUND_ITEM_WIDTH_LARGE,
      height: GRAPH_FUND_ITEM_HEIGHT_LARGE,
    };
  }
  if (sold) {
    return {
      width: GRAPH_FUND_ITEM_WIDTH,
      height: GRAPH_FUND_ITEM_HEIGHT / 2,
    };
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

const valuesColor = [colors.funds.loss, colors.funds.profit];

function processData(
  item: string,
  data: Data[],
  popout: boolean,
): {
  lines: Line[];
} & Range {
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

  const lines = data.map<Line>((line, index) => ({
    key: String(index),
    name: item,
    data: line,
    strokeWidth: popout ? 1.5 : 1,
    smooth: true,
    color: {
      changes: [line[0][1]],
      values: valuesColor,
    },
  }));

  return {
    lines,
    minX,
    maxX,
    minY,
    maxY,
  };
}

export const GraphFundItem: React.FC<Props> = ({ item, sold, values }) => {
  const [popout, setPopout] = useState<boolean>(false);
  const onFocus = useCallback(() => setPopout(!sold), [sold]);
  const onBlur = useCallback(() => setPopout(false), []);
  const { width, height } = getDimensions(popout, sold);

  const BeforeLines = useCallback<React.FC<DrawProps>>(
    (props) => <Axes popout={popout} {...props} />,
    [popout],
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
      <LineGraph
        width={width}
        height={height}
        {...processData(item, values, popout)}
        BeforeLines={BeforeLines}
      />
    </Styled.FundGraph>
  );
};
