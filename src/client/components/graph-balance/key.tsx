import { rgba } from 'polished';
import React from 'react';
import { BaseKey, Props } from '~client/components/graph-cashflow/base-key';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { colors } from '~client/styled/variables';
import { Aggregate } from '~client/types/net-worth';

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

const keyLineWidth = 24;
const keyMargin = 4;

const keyX0 = 50;
const keyTextX0 = keyX0 + keyLineWidth + keyMargin;

const keyX1 = 130;
const keyTextX1 = keyX1 + keyLineWidth + keyMargin;

const keyX2 = 220;
const keyTextX2 = keyX2 + keyLineWidth + keyMargin;

const keyY0 = 40;
const keyY1 = 56;
const keyY2 = 72;

export const Key: React.FC<Props> = (props) => (
  <BaseKey {...props} height={80}>
    <line
      x1={keyX0}
      y1={keyY0}
      x2={keyX0 + keyLineWidth}
      y2={keyY0}
      stroke={colors.overview.balanceActual}
      strokeWidth={2}
    />
    <text
      x={keyTextX0}
      y={keyY0}
      fill={colors.dark.light}
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
      stroke={colors.overview.balancePredicted}
      strokeWidth={2}
    />
    <text
      x={keyTextX1}
      y={keyY0}
      fill={colors.dark.light}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Predicted
    </text>

    <rect
      x={keyX1}
      y={keyY2 - 3}
      width={keyLineWidth}
      height={6}
      fill={rgba(colors.netWorth.homeEquity, 0.5)}
    />
    <text
      x={keyTextX1}
      y={keyY2}
      fill={colors.dark.light}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Home equity
    </text>

    <rect
      x={keyX0}
      y={keyY1 - 3}
      width={keyLineWidth}
      height={6}
      fill={rgba(colors.funds.main, 0.5)}
    />
    <text
      x={keyTextX0}
      y={keyY1}
      fill={colors.dark.light}
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
      fill={colors.netWorth.aggregate[Aggregate.cashOther]}
    />
    <text
      x={keyTextX1}
      y={keyY1}
      fill={colors.dark.light}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Locked cash
    </text>

    <rect
      x={keyX0}
      y={keyY2 - 3}
      width={keyLineWidth}
      height={6}
      fill={rgba(colors.netWorth.aggregate[Aggregate.pension], 0.5)}
    />
    <text
      x={keyTextX0}
      y={keyY2}
      fill={colors.dark.light}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Pension
    </text>

    <line
      x1={keyX2}
      y1={keyY0 + 0.5}
      x2={keyX2 + keyLineWidth}
      y2={keyY0 + 0.5}
      stroke={colors.netWorth.options}
      strokeDasharray="3,4"
      strokeWidth={2}
    />
    <text
      x={keyTextX2}
      y={keyY0}
      fill={colors.dark.light}
      fontFamily={fontFamily}
      fontSize={fontSize}
      alignmentBaseline="middle"
    >
      Options
    </text>
  </BaseKey>
);
