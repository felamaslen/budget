import React, { useMemo } from 'react';

import { profitLossColor } from '~client/components/graph/helpers';
import { LineGraph } from '~client/components/graph/line-graph';
import { GRAPH_STOCKS_WIDTH, GRAPH_STOCKS_HEIGHT } from '~client/constants/graph';
import { Line, Data, Point } from '~client/types/graph';

type Props = {
    history: Data;
};

export const GraphStocks: React.FC<Props> = ({ history }) => {
    const lines = useMemo<Line[]>(
        () => [
            {
                key: 'graph-stock-prices',
                data: history,
                color: profitLossColor,
            },
        ],
        [history],
    );

    return (
        <LineGraph
            name="graph-stocks"
            lines={lines}
            minY={history.reduce((last, [, yValue]: Point) => Math.min(last, yValue), Infinity)}
            maxY={history.reduce((last, [, yValue]: Point) => Math.max(last, yValue), -Infinity)}
            minX={history.reduce((last, [xValue]: Point) => Math.min(last, xValue), Infinity)}
            maxX={history.reduce((last, [xValue]: Point) => Math.max(last, xValue), -Infinity)}
            width={GRAPH_STOCKS_WIDTH}
            height={GRAPH_STOCKS_HEIGHT}
        />
    );
};
