import type { GraphCashFlowTitle } from './types';

import { FONT_GRAPH_TITLE } from '~client/constants/graph';
import { colors } from '~client/styled/variables';

export type Props = {
  title: GraphCashFlowTitle;
  setMobileGraph: React.Dispatch<React.SetStateAction<GraphCashFlowTitle>>;
  height?: number;
  width?: number;
  children?: React.ReactNode;
};

const [fontSize, fontFamily] = FONT_GRAPH_TITLE;

export const BaseKey: React.FC<Props> = ({
  title,
  setMobileGraph,
  children,
  height = 60,
  width = 200,
}) => (
  <g>
    <rect x={45} y={8} width={width} height={height} fill={colors.translucent.light.dark} />

    <text
      x={65}
      y={10}
      color={colors.black}
      alignmentBaseline="hanging"
      fontSize={fontSize}
      fontFamily={fontFamily}
      onClick={(): void => setMobileGraph(title === 'Net worth' ? 'Cash flow' : 'Net worth')}
    >
      {title}
    </text>
    {children}
  </g>
);
