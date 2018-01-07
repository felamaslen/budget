/*
 * Graph net cash flow (spending over time)
 */

import { List as list } from 'immutable';
import { rgba } from '../../../../misc/color';
import { GRAPH_SPEND_CATEGORIES } from '../../../../misc/const';
import {
    COLOR_DARK, COLOR_LOSS, COLOR_PROFIT, COLOR_TRANSLUCENT_LIGHT, COLOR_SPENDING,
    FONT_GRAPH_KEY_SMALL
} from '../../../../misc/config';

import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import GraphCashFlow, { getValuesWithTime, drawKey as drawBaseKey } from './cash-flow';

function drawFutureArea({ maxX, minY, maxY }, { ctx }, { pixX, pixY }) {
    const future0 = pixX(Date.now() / 1000);
    const future1 = pixY(maxY);
    const futureW = pixX(maxX) - future0;
    const futureH = pixY(minY) - future1;

    ctx.beginPath();
    ctx.fillStyle = rgba(COLOR_TRANSLUCENT_LIGHT);
    ctx.fillRect(future0, future1, futureW, futureH);
}
function drawKeySpending(props, { ctx }) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(COLOR_SPENDING);
    ctx.moveTo(50, 40);
    ctx.lineTo(74, 40);
    ctx.stroke();
    ctx.closePath();

    ctx.font = FONT_GRAPH_KEY_SMALL;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba(COLOR_DARK);
    ctx.fillText('Spending', 78, 40);
}
function drawKey(...args) {
    drawBaseKey(...args);
    drawKeySpending(...args);
    drawFutureArea(...args);
}

function drawArrow(ctx, minY, maxY, pixY) {
    const colorProfit = rgba(COLOR_PROFIT);
    const colorLoss = rgba(COLOR_LOSS);

    return (xPix, value) => {
        let color = null;
        let direction = null;
        let sizeRatio = null;

        if (value > 0) {
            color = colorProfit;
            direction = 1;
            sizeRatio = value / maxY;
        }
        else {
            color = colorLoss;
            direction = -1;
            sizeRatio = value / minY;
        }

        const arrowWidth = 6 * (sizeRatio + 0.5);
        const arrowHeight = 10 * (sizeRatio + 0.5);

        ctx.beginPath();

        ctx.moveTo(xPix, pixY(0));
        ctx.lineTo(xPix, pixY(value) + direction * arrowHeight / 2);

        ctx.lineWidth = 3 * sizeRatio;
        ctx.strokeStyle = color;
        ctx.stroke();

        // draw the arrow head
        ctx.beginPath();

        ctx.moveTo(xPix - arrowWidth, pixY(value) + direction * arrowHeight);
        ctx.lineTo(xPix, pixY(value));
        ctx.lineTo(xPix + arrowWidth, pixY(value) + direction * arrowHeight);
        ctx.lineTo(xPix, pixY(value) + direction * arrowHeight * 0.7);

        ctx.fillStyle = color;
        ctx.fill();
    };
}

function drawData({
    minY, maxY, data: { dataNet, dataSpending }
}, {
    ctx, width, height
}, {
    pixX, pixY, drawCubicLine
}) {
    ctx.lineWidth = 2;
    drawCubicLine(dataSpending, [rgba(COLOR_SPENDING)]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 0, width, height);

    const arrowDrawer = drawArrow(ctx, minY, maxY, pixY);
    dataNet.forEach(point => {
        arrowDrawer(pixX(point.get(0)), point.get(1));
    });
}

function onDraw(...args) {
    drawData(...args);
    drawKey(...args);
}

function getRanges(dataNet) {
    const dataYNet = dataNet.map(item => item.last());
    const dataX = dataNet.map(item => item.first());

    const minYValue = dataYNet.min();
    const minY = Math.min(0, minYValue);
    const maxY = dataYNet.max();
    const minX = dataX.min();
    const maxX = dataX.max();

    return { minX, maxX, minY, maxY };
}

function processData({ valuesNet, valuesSpending, ...props }) {
    const dataNet = getValuesWithTime(valuesNet, { oldOffset: 0, ...props });
    const dataSpending = getValuesWithTime(valuesSpending, { oldOffset: 0, ...props });

    const ranges = getRanges(dataNet);

    return {
        ...ranges,
        data: { dataNet, dataSpending }
    };
}

function GraphSpend(props) {
    return <GraphCashFlow
        title="Cash flow"
        onDraw={onDraw}
        colorTransition={[null]}
        {...processData(props)}
        {...props}
    />;
}

GraphSpend.propTypes = {
    valuesNet: PropTypes.instanceOf(list).isRequired,
    valuesSpending: PropTypes.instanceOf(list).isRequired
};

const mapStateToProps = state => ({
    startYearMonth: state.getIn(['pages', 'overview', 'data', 'startYearMonth']),
    currentYearMonth: state.getIn(['pages', 'overview', 'data', 'currentYearMonth']),
    valuesNet: GRAPH_SPEND_CATEGORIES.reduce((data, category) => {
        return data.map((item, key) => {
            const cost = state.getIn(['pages', 'overview', 'data', 'cost', category.name, key]);

            return item - cost;
        });
    }, state.getIn(['pages', 'overview', 'data', 'cost', 'income'])),
    valuesSpending: GRAPH_SPEND_CATEGORIES.reduce((data, category) => {
        return data.map((item, key) => {
            const cost = state
                .getIn(['pages', 'overview', 'data', 'cost', category.name, key]);

            return item + cost;
        });
    }, state
        .getIn(['pages', 'overview', 'data', 'cost', 'income'])
        .map(() => 0)
    )
});

export default connect(mapStateToProps)(GraphSpend);

