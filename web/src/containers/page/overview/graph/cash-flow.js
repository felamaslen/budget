import { List as list } from 'immutable';
import { GRAPH_WIDTH, GRAPH_HEIGHT } from '../../../../misc/const';
import {
    COLOR_DARK, COLOR_LIGHT,
    COLOR_GRAPH_TITLE, COLOR_LIGHT_GREY, COLOR_TRANSLUCENT_LIGHT,
    FONT_AXIS_LABEL, FONT_GRAPH_TITLE,
    GRAPH_CASHFLOW_NUM_TICKS
} from '../../../../misc/config';
import { getYearMonthFromKey, getKeyFromYearMonth } from '../../../../misc/data';
import { getTickSize, formatCurrency } from '../../../../misc/format';
import { getNow } from '../../../../misc/date';
import { rgba } from '../../../../misc/color';

import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import LineGraph from '../../../../components/graph/line';

function drawTitle({ title }, { ctx }) {
    ctx.font = FONT_GRAPH_TITLE;
    ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillText(title, 65, 10);
}

function drawKeyBackground(props, { ctx }) {
    ctx.beginPath();
    ctx.fillStyle = rgba(COLOR_TRANSLUCENT_LIGHT);
    ctx.fillRect(45, 8, 200, 60);
    ctx.closePath();
}

export function drawKey(props, state, graph) {
    // add title and key
    drawKeyBackground(props, state, graph);
    drawTitle(props, state, graph);
}

function GraphCashFlow({ onDraw, ...props }) {
    const onDrawProc = (...args) => {
        drawAxes(...args);
        onDraw(...args);
    };

    return <LineGraph
        padding={[40, 0, 0, 0]}
        onDraw={onDrawProc}
        {...props}
    />;
}

GraphCashFlow.propTypes = {
    yearMonths: PropTypes.instanceOf(list).isRequired,
    currentYearMonth: PropTypes.array.isRequired,
    startYearMonth: PropTypes.array.isRequired,
    oldOffset: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    breakAtToday: PropTypes.bool,
    onDraw: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    width: Math.min(GRAPH_WIDTH, window.innerWidth),
    height: GRAPH_HEIGHT,
    yearMonths: list(state.getIn(['pages', 'overview', 'data', 'yearMonths'])),
    oldOffset: 0
});

export default connect(mapStateToProps)(GraphCashFlow);

