import React, { useMemo } from 'react';

import { dataShape } from '~client/prop-types/graph';
import LineGraph from '~client/components/Graph/LineGraph';
import { GRAPH_STOCKS_WIDTH, GRAPH_STOCKS_HEIGHT } from '~client/constants/graph';
import { COLOR_PROFIT, COLOR_LOSS } from '~client/constants/colors';
import { rgba } from '~client/modules/color';

const colors = [rgba(COLOR_PROFIT), rgba(COLOR_LOSS)];

export default function GraphStocks({ history }) {
    const lines = useMemo(() => ([{
        key: 'graph-stock-prices',
        data: history,
        color: ([, value]) => colors[(value < 0) >> 0],
    }]), [history]);

    return (
        <LineGraph
            name="graph-stocks"
            lines={lines}
            minY={history.reduce((last, [, yValue]) => Math.min(last, yValue), Infinity)}
            maxY={history.reduce((last, [, yValue]) => Math.max(last, yValue), -Infinity)}
            minX={history.reduce((last, [xValue]) => Math.min(last, xValue), Infinity)}
            maxX={history.reduce((last, [xValue]) => Math.max(last, xValue), -Infinity)}
            width={GRAPH_STOCKS_WIDTH}
            height={GRAPH_STOCKS_HEIGHT}
        />
    );
}

GraphStocks.propTypes = {
    history: dataShape.isRequired,
};
