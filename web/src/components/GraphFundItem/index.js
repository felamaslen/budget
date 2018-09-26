/*
 * Individual fund price graph
 */

import './style.scss';
import { List as list, Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph from '../../components/Graph/LineGraph';
import Axes from './Axes';
import { rgba } from '../../helpers/color';
import { separateLines } from '../../helpers/funds';
import {
    GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_WIDTH_LARGE,
    GRAPH_FUND_ITEM_HEIGHT, GRAPH_FUND_ITEM_HEIGHT_LARGE
} from '../../constants/graph';
import { COLOR_LOSS, COLOR_PROFIT } from '../../constants/colors';

function getDimensions({ popout, sold }) {
    if (popout) {
        return { width: GRAPH_FUND_ITEM_WIDTH_LARGE, height: GRAPH_FUND_ITEM_HEIGHT_LARGE };
    }

    if (sold) {
        return { width: GRAPH_FUND_ITEM_WIDTH, height: GRAPH_FUND_ITEM_HEIGHT / 2 };
    }

    return { width: GRAPH_FUND_ITEM_WIDTH, height: GRAPH_FUND_ITEM_HEIGHT };
}

function processData(data, popout) {
    const validData = data.filterNot(item => item.get(1) === 0);

    const dataX = validData.map(item => item.get(0));
    const dataY = validData.map(item => item.get(1));

    const minX = dataX.min();
    const maxX = dataX.max();
    let minY = dataY.min();
    let maxY = dataY.max();

    if (minY === maxY) {
        const range = minY / 100;

        minY -= range;
        maxY += range;
    }

    // split up the line into multiple sections, if there are gaps in the data
    // (this can happen if the fund is sold and then re-bought at a later date)
    const lines = separateLines(data).map((line, key) => map({
        key,
        data: line,
        strokeWidth: 1 + 0.5 * (popout >> 0),
        smooth: true,
        color: {
            changes: [line.getIn([0, 1])],
            values: [rgba(COLOR_LOSS), rgba(COLOR_PROFIT)]
        }
    }));

    return { lines, minX, maxX, minY, maxY };
}

export default function GraphFundItem({ sold, values, popout, onToggle, ...props }) {
    if (!values) {
        return null;
    }

    const { width, height } = getDimensions({ popout, sold });

    const beforeLines = subProps => (<Axes popout={popout} {...subProps} />);

    const graphProps = {
        svgProperties: {
            onClick: () => onToggle
        },
        svgClasses: classNames({ popout }),
        beforeLines,
        width,
        height,
        ...props,
        ...processData(values, popout)
    };

    return (<LineGraph {...graphProps} />);
}

GraphFundItem.propTypes = {
    sold: PropTypes.bool.isRequired,
    values: PropTypes.instanceOf(list),
    popout: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired
};

