/*
 * Individual fund price graph
 */

import { List as list } from 'immutable';

import { rgba } from '../../../../misc/color';
import {
    GRAPH_FUND_ITEM_WIDTH, GRAPH_FUND_ITEM_WIDTH_LARGE,
    GRAPH_FUND_ITEM_HEIGHT, GRAPH_FUND_ITEM_HEIGHT_LARGE
} from '../../../../misc/const';
import {
    COLOR_LOSS, COLOR_PROFIT, COLOR_DARK, FONT_AXIS_LABEL
} from '../../../../misc/config';
import { aFundItemGraphToggled } from '../../../../actions/graph.actions';

import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph from '../../../../components/graph/line';

function getDimensions(popout) {
    if (popout) {
        return { width: GRAPH_FUND_ITEM_WIDTH_LARGE, height: GRAPH_FUND_ITEM_HEIGHT_LARGE };
    }

    return { width: GRAPH_FUND_ITEM_WIDTH, height: GRAPH_FUND_ITEM_HEIGHT };
}

function processData(data, popout) {
    const validData = data.filterNot(item => item.get(1) === 0);

    const dataX = validData.map(item => item.get(0));
    const dataY = validData.map(item => item.get(1));

    const minX = dataX.min();
    const maxX = dataX.max();
    const minY = dataY.min();
    const maxY = dataY.max();

    const colorProfitLoss = [rgba(COLOR_LOSS), rgba(COLOR_PROFIT)];

    // split up the line into multiple sections, if there are gaps in the data
    // (this can happen if the fund is sold and then re-bought at a later date)
    const lines = data.reduce(({ lastLines, lastValue }, point) => {
        const value = point.get(1);

        if (value === 0) {
            return { lastLines, lastValue: 0 };
        }
        if (lastValue === 0) {
            return { lastLines: lastLines.concat([list.of(point)]), lastValue: value };
        }

        return {
            lastLines: lastLines.slice(0, lastLines.length - 1)
                .concat([lastLines[lastLines.length - 1].push(point)]),
            lastValue: value
        };

    }, { lastLines: [], lastValue: 0 })
        .lastLines
        .map((line, key) => ({
            key,
            data: line,
            strokeWidth: 1 + 0.5 * (popout >> 0),
            smooth: true,
            color: point => colorProfitLoss[(point.get(1) > line.getIn([0, 1])) >> 0]
        }));

    return { lines, minX, maxX, minY, maxY };
}

function Axes({ popout, minX, minY, maxY, height, pixX, pixY }) {
    if (!popout) {
        return null;
    }

    const range = maxY - minY;
    const increment = Math.round(Math.max(20, height / range) / (height / range) / 2) * 2;
    const start = Math.ceil(minY / increment) * increment;
    const numTicks = Math.ceil(range / increment);

    if (!numTicks) {
        return null;
    }

    const x0 = pixX(minX);
    const [fontSize, fontFamily] = FONT_AXIS_LABEL;
    const fontColor = rgba(COLOR_DARK);

    const ticks = new Array(numTicks).fill(0)
        .map((tick, key) => {
            const tickValue = start + key * increment;
            const tickPos = Math.floor(pixY(tickValue)) + 0.5;
            const tickName = `${tickValue.toFixed(1)}p`;

            return <text key={tickName}
                x={x0} y={tickPos} color={fontColor}
                fontSize={fontSize} fontFamily={fontFamily}>{tickName}</text>;
        });

    return <g className="axes">{ticks}</g>;
}

Axes.propTypes = {
    popout: PropTypes.bool.isRequired,
    minX: PropTypes.number.isRequired,
    minY: PropTypes.number.isRequired,
    maxY: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired
};

function GraphFundItem({ id, data, onToggle, popout, ...props }) {
    const dimensions = getDimensions(popout);

    const beforeLines = subProps => <Axes popout={popout} {...subProps} />;

    const graphProps = {
        svgProperties: {
            onClick: () => () => onToggle(id)
        },
        svgClasses: classNames({ popout }),
        beforeLines,
        ...dimensions,
        ...props,
        ...processData(data, popout)
    };

    return <LineGraph {...graphProps} />;
}

GraphFundItem.propTypes = {
    id: PropTypes.number.isRequired,
    data: PropTypes.instanceOf(list).isRequired,
    popout: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    data: state.getIn(['pages', 'funds', 'rows', ownProps.id, 'prices']) || list.of(),
    popout: Boolean(state.getIn(['pages', 'funds', 'rows', ownProps.id, 'historyPopout']))
});

const mapDispatchToProps = dispatch => ({
    onToggle: id => dispatch(aFundItemGraphToggled(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphFundItem);

