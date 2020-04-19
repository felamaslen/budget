import React, { useMemo } from 'react';
import { LineGraph, Props as GraphProps } from '~client/components/graph/line-graph';
import { Axes } from '~client/components/graph-fund-item/axes';
import { rgba } from '~client/modules/color';
import { separateLines } from '~client/modules/funds';
import {
  GRAPH_FUND_ITEM_WIDTH,
  GRAPH_FUND_ITEM_WIDTH_LARGE,
  GRAPH_FUND_ITEM_HEIGHT,
  GRAPH_FUND_ITEM_HEIGHT_LARGE,
} from '~client/constants/graph';
import { COLOR_LOSS, COLOR_PROFIT } from '~client/constants/colors';
import { Size, Range, BasicProps, Data, Line } from '~client/types/graph';

import * as Styled from './styles';

type Props = {
  popout: boolean;
  sold: boolean;
  values: Data;
  onToggle: () => void;
} & Pick<GraphProps, 'name'>;

function getDimensions({ popout, sold }: Pick<Props, 'popout' | 'sold'>): Size {
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

const valuesColor = [rgba(COLOR_LOSS), rgba(COLOR_PROFIT)];

function processData(
  data: Data,
  popout: boolean,
): {
  lines: Line[];
} & Range {
  const validData = data.filter(([, yValue]) => yValue !== 0);
  const dataX = validData.map(([xValue]) => xValue);
  const dataY = validData.map(([, yValue]) => yValue);

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  if (validData.length) {
    ({ min: minX, max: maxX } = getRange(dataX));
    ({ min: minY, max: maxY } = getRange(dataY));

    if (minY === maxY) {
      const range = minY / 100;

      minY -= range;
      maxY += range;
    }
  }

  // split up the line into multiple sections, if there are gaps in the data
  // (this can happen if the fund is sold and then re-bought at a later date)
  const lines = separateLines(data).map((line: Data, index: number) => ({
    key: String(index),
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

function makeBeforeLines({ popout }: Pick<Props, 'popout'>): React.FC<BasicProps> {
  const BeforeLines: React.FC<BasicProps> = props => <Axes popout={popout} {...props} />;

  return BeforeLines;
}

export const GraphFundItem: React.FC<Props> = ({ name, sold, values, popout, onToggle }) => {
  const { width, height } = getDimensions({ popout, sold });

  const beforeLines = useMemo(() => values && makeBeforeLines({ popout }), [values, popout]);

  const svgProperties = useMemo(
    () => ({
      onClick: onToggle,
    }),
    [onToggle],
  );

  if (!values) {
    return null;
  }

  const graphProps = {
    name,
    svgProperties,
    beforeLines,
    width,
    height,
    ...processData(values, popout),
  };

  return (
    <Styled.FundGraph sold={sold} popout={popout}>
      <LineGraph {...graphProps} />
    </Styled.FundGraph>
  );
};
