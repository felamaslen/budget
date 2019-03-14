/*
 * Graph general cash flow (balance over time)
 */

import { List as list, Map as map } from 'immutable';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import LineGraph from '../../components/Graph/LineGraph';
import { GRAPH_STOCKS_WIDTH, GRAPH_STOCKS_HEIGHT } from '../../constants/graph';
import { COLOR_PROFIT, COLOR_LOSS } from '../../constants/colors';

export default function GraphStocks({ history }) {
    const lines = useMemo(() => list.of(map({
        key: 'graph-stock-prices',
        data: history,
        color: value => {
            if (value >= 0) {
                return COLOR_PROFIT;
            }

            return COLOR_LOSS;
        }
    })), [history]);

    return (
        <LineGraph
            lines={lines}
            width={GRAPH_STOCKS_WIDTH}
            height={GRAPH_STOCKS_HEIGHT}
        />
    );
}

GraphStocks.propTypes = {
    history: PropTypes.instanceOf(list).isRequired
};

