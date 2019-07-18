/*
 * Individual fund price graph
 */

import './style.scss';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph from '~client/components/Graph/LineGraph';
import Axes from './Axes';
import { rgba } from '~client/modules/color';
import { separateLines } from '~client/modules/funds';
import {
    GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_WIDTH_LARGE,
    GRAPH_FUND_ITEM_HEIGHT, GRAPH_FUND_ITEM_HEIGHT_LARGE
} from '~client/constants/graph';
import { COLOR_LOSS, COLOR_PROFIT } from '~client/constants/colors';

function getDimensions({ popout, sold }) {
    if (popout) {
        return { width: GRAPH_FUND_ITEM_WIDTH_LARGE, height: GRAPH_FUND_ITEM_HEIGHT_LARGE };
    }
    if (sold) {
        return { width: GRAPH_FUND_ITEM_WIDTH, height: GRAPH_FUND_ITEM_HEIGHT / 2 };
    }

    return { width: GRAPH_FUND_ITEM_WIDTH, height: GRAPH_FUND_ITEM_HEIGHT };
}

const getRange = data => data.reduce(({ min, max }, value) => ({
    min: Math.min(min, value),
    max: Math.max(max, value)
}), { min: Infinity, max: -Infinity });

const valuesColor = [rgba(COLOR_LOSS), rgba(COLOR_PROFIT)];

function processData(data, popout) {
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
    const lines = separateLines(data).map((line, key) => ({
        key,
        data: line,
        strokeWidth: 1 + 0.5 * (popout >> 0),
        smooth: true,
        color: {
            changes: [line[0][1]],
            values: valuesColor
        }
    }));

    return { lines, minX, maxX, minY, maxY };
}

function makeBeforeLines({ popout }) {
    const BeforeLines = ({ minX, minY, maxY, height, pixX, pixY }) => (
        <Axes
            popout={popout}
            minX={minX}
            minY={minY}
            maxY={maxY}
            height={height}
            pixX={pixX}
            pixY={pixY}
        />
    );

    BeforeLines.propTypes = {
        minX: PropTypes.number.isRequired,
        minY: PropTypes.number.isRequired,
        maxY: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        pixX: PropTypes.func.isRequired,
        pixY: PropTypes.func.isRequired
    };

    return BeforeLines;
}

export default function GraphFundItem({ name, sold, values, popout, onToggle }) {
    const { width, height } = getDimensions({ popout, sold });

    const beforeLines = useMemo(() => values && makeBeforeLines({ popout }), [values, popout]);

    const svgProperties = useMemo(() => ({
        onClick: onToggle
    }), [onToggle]);

    if (!values) {
        return null;
    }

    const graphProps = {
        name,
        svgProperties,
        svgClasses: classNames({ popout }),
        beforeLines,
        width,
        height,
        ...processData(values, popout)
    };

    return (
        <div className="fund-graph">
            <LineGraph {...graphProps} />
        </div>
    );
}

GraphFundItem.propTypes = {
    name: PropTypes.string.isRequired,
    sold: PropTypes.bool.isRequired,
    values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired),
    popout: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired
};
