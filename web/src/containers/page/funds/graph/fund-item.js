/*
 * Graph general cash flow (balance over time)
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
import { separateLine } from './helpers';

import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph from '../../../../components/graph/line';

function onDraw({ minX, minY, maxY, data, popout }, { ctx, height }, { pixX, pixY, drawCubicLine }) {
    // draw axes
    ctx.lineWidth = 1;
    if (popout) {
        ctx.fillStyle = rgba(COLOR_DARK);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.font = FONT_AXIS_LABEL;

        const range = maxY - minY;
        const increment = Math.round(Math.max(20, height / range) / (height / range) / 2) * 2;
        const start = Math.ceil(minY / increment) * increment;
        const numTicks = Math.ceil(range / increment);

        if (numTicks > 0) {
            new Array(numTicks)
                .fill(0)
                .forEach((tick, key) => {
                    const tickValue = start + key * increment;
                    const tickPos = Math.floor(pixY(tickValue)) + 0.5;
                    const tickName = `${tickValue.toFixed(1)}p`;
                    ctx.fillText(tickName, pixX(minX), tickPos);
                });
        }
    }

    // plot data
    ctx.lineWidth = 1.5;

    const { values: initialValues } = data
        .map(item => item.get(1))
        .reduce(({ values, last }, value, index) => {
            if (last === 0 && value > 0) {
                return {
                    values: [...values, value],
                    last: value
                };
            }

            return { values, last: value };

        }, {
            values: [data.getIn([0, 1])],
            last: data.getIn([0, 1])
        });

    const colorLoss = rgba(COLOR_LOSS);
    const colorProfit = rgba(COLOR_PROFIT);
    const colorValue = lineKey => {
        const initialValue = initialValues[lineKey];

        return value => {
            if (value < initialValue) {
                return colorLoss;
            }

            return colorProfit;
        };
    };

    const lines = separateLine(data);

    lines.forEach((line, key) => drawCubicLine(line, colorValue(key)));
}

function getDimensions({ popout }) {
    if (popout) {
        return { width: GRAPH_FUND_ITEM_WIDTH_LARGE, height: GRAPH_FUND_ITEM_HEIGHT_LARGE };
    }

    return { width: GRAPH_FUND_ITEM_WIDTH, height: GRAPH_FUND_ITEM_HEIGHT };
}

function processData({ data, ...props }) {
    const validData = data.filter(item => item.last() !== 0);

    const dataY = validData.map(item => item.last());
    const dataX = validData.map(item => item.first());

    const minY = dataY.min();
    const maxY = dataY.max();
    const minX = dataX.min();
    const maxX = dataX.max();

    return { minX, maxX, minY, maxY, ...getDimensions(props) };
}

function GraphFundItem({ id, onToggle, ...props }) {
    const canvasProperties = {
        onClick: () => () => onToggle(id)
    };

    const canvasClasses = classNames({ popout: props.popout });

    return <LineGraph
        name={id}
        canvasProperties={canvasProperties}
        canvasClasses={canvasClasses}
        onDraw={onDraw}
        colorTransition={[null]}
        {...processData(props)}
        {...props}
    />;
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

