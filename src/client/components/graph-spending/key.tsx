import React from 'react';
import { BaseKey } from '~client/components/graph-cashflow/base-key';
import type { GraphCashFlowTitle } from '~client/components/graph-cashflow/types';
import { FONT_GRAPH_KEY } from '~client/constants/graph';
import { colors } from '~client/styled/variables';
import type { PixPrimary, Range } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

type Props = PixPrimary &
  Omit<Range, 'minX'> & {
    setMobileGraph: React.Dispatch<React.SetStateAction<GraphCashFlowTitle>>;
    now: Date;
    title: GraphCashFlowTitle;
    isCumulative: boolean;
  };

const [fontSize, fontFamily] = FONT_GRAPH_KEY;

export const Key: React.FC<Props> = ({ isCumulative, title, setMobileGraph }) => {
  const keys: { text: string; color: string }[] = [
    {
      text: `Spending (${isCumulative ? 'cumulative' : 'quarterly avg.'})`,
      color: colors[PageNonStandard.Overview].spending,
    },
    {
      text: isCumulative ? 'Income' : 'Savings ratio (yearly avg.)',
      color: colors.green,
    },
    {
      text: isCumulative ? 'Investments' : 'Investment ratio',
      color: colors[PageNonStandard.Funds].main,
    },
  ];

  return (
    <BaseKey title={title} setMobileGraph={setMobileGraph}>
      {keys.map(({ text, color }, index) => (
        <React.Fragment key={text}>
          <line
            x1={50}
            y1={40 + 18 * index}
            x2={74}
            y2={40 + 18 * index}
            stroke={color}
            strokeWidth={2}
          />
          <text
            x={78}
            y={40 + 18 * index}
            fill={colors.dark.light}
            fontFamily={fontFamily}
            fontSize={fontSize}
            alignmentBaseline="middle"
          >
            {text}
          </text>
        </React.Fragment>
      ))}
    </BaseKey>
  );
};
