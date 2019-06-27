/*
 * Graph general cash flow (balance over time)
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import LineGraph from '~client/components/Graph/LineGraph';
import { GRAPH_STOCKS_WIDTH, GRAPH_STOCKS_HEIGHT } from '~client/constants/graph';
import { COLOR_PROFIT, COLOR_LOSS } from '~client/constants/colors';

export default function GraphStocks({ history }) {
    const lines = useMemo(() => ([{
        key: 'graph-stock-prices',
        data: history,
        color: value => {
            if (value >= 0) {
                return COLOR_PROFIT;
            }

            return COLOR_LOSS;
        }
    }]), [history]);

    return (
        <LineGraph
            name="graph-stocks"
            lines={lines}
            width={GRAPH_STOCKS_WIDTH}
            height={GRAPH_STOCKS_HEIGHT}
        />
    );
}

GraphStocks.propTypes = {
    history: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
};
