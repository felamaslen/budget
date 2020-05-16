import { rgba as rgbaNormal } from 'polished';
import React from 'react';
import { BaseKey, Props } from '~client/components/graph-cashflow/base-key';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { colors as netWorthColors } from '~client/components/net-worth-graph/styles';
import {
  COLOR_DARK,
  COLOR_BALANCE_ACTUAL,
  COLOR_BALANCE_PREDICTED,
  COLOR_BALANCE_STOCKS,
} from '~client/constants/colors';
import { rgba } from '~client/modules/color';
import { colors } from '~client/styled/variables';
import { Aggregate } from '~client/types/net-worth';

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

const keyLineWidth = 24;
const keyMargin = 4;

const keyX0 = 50;
const keyTextX0 = keyX0 + keyLineWidth + keyMargin;

const keyX1 = 130;
const keyTextX1 = keyX1 + keyLineWidth + keyMargin;

const keyY0 = 40;
const keyY1 = 56;
const keyY2 = 72;

export const Key: React.FC<Props> = props => (
  <BaseKey {...props} height={80}>
    <line
      x1={keyX0}
      y1={keyY0}
      x2={keyX0 + keyLineWidth}
      y2={keyY0}
      stroke={rgba(COLOR_BALANCE_ACTUAL)}
      strokeWidth={2}
    />
    <text
      x={keyTextX0}
      y={keyY0}
      fill={rgba(COLOR_DARK)}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Actual
    </text>

    <line
      x1={keyX1}
      y1={keyY0}
      x2={keyX1 + keyLineWidth}
      y2={keyY0}
      stroke={rgba(COLOR_BALANCE_PREDICTED)}
      strokeWidth={2}
    />
    <text
      x={keyTextX1}
      y={keyY0}
      fill={rgba(COLOR_DARK)}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Predicted
    </text>

    <rect
      x={keyX0}
      y={keyY1 - 3}
      width={keyLineWidth}
      height={6}
      fill={rgba(COLOR_BALANCE_STOCKS)}
    />
    <text
      x={keyTextX0}
      y={keyY1}
      fill={rgba(COLOR_DARK)}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Stocks
    </text>

    <rect
      x={keyX1}
      y={keyY1 - 3}
      width={keyLineWidth}
      height={6}
      fill={rgbaNormal(rgba(COLOR_BALANCE_STOCKS), 0.3)}
    />
    <text
      x={keyTextX1}
      y={keyY1}
      fill={rgba(COLOR_DARK)}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Locked cash
    </text>

    <rect
      x={keyX1}
      y={keyY2 - 3}
      width={keyLineWidth}
      height={6}
      fill={rgbaNormal(colors.netWorth.aggregate[Aggregate.pension], 0.5)}
    />
    <text
      x={keyTextX1}
      y={keyY2}
      fill={rgba(COLOR_DARK)}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Pension
    </text>

    <line
      x1={keyX0}
      y1={keyY2 + 0.5}
      x2={keyX0 + keyLineWidth}
      y2={keyY2 + 0.5}
      stroke={netWorthColors.options}
      strokeDasharray="3,4"
      strokeWidth={1}
    />
    <text
      x={keyTextX0}
      y={keyY2}
      fill={rgba(COLOR_DARK)}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Options
    </text>
  </BaseKey>
);
