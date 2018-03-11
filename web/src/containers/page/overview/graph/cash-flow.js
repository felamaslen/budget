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

const now = getNow();
const today = {
    year: now.get('year'),
    month: now.get('month') + 1,
    date: now.get('date')
};

function getTicksY(numMajorTicks = GRAPH_CASHFLOW_NUM_TICKS) {
    return (minY, maxY, pixY) => {
        const minorTicks = 5;
        const numTicks = numMajorTicks * minorTicks;

        const tickSize = getTickSize(minY, maxY, numTicks);
        const keyOffset = Math.ceil(minY / tickSize);

        return new Array(numTicks)
            .fill(0)
            .map((item, tickKey) => {
                const key = tickKey + keyOffset;

                const pos = Math.floor(pixY(key * tickSize)) + 0.5;
                const major = key % minorTicks === 0;
                const value = key * tickSize;

                return { pos, major, value };
            });
    };
}

function drawAxes({ minX, minY, maxX, maxY }, { ctx }, { pixX, pixY, getTimeScale }) {
    const ticksY = getTicksY()(minY, maxY, pixY);

    const drawTick = ({ pos }) => {
        ctx.beginPath();
        ctx.moveTo(pixX(minX), pos);
        ctx.lineTo(pixX(maxX), pos);
        ctx.stroke();
        ctx.closePath();
    };

    // draw axes
    ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
    ctx.lineWidth = 1;

    ctx.font = FONT_AXIS_LABEL;
    ctx.fillStyle = rgba(COLOR_DARK);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    // draw minor Y ticks
    ctx.strokeStyle = rgba(COLOR_LIGHT);
    ticksY.filter(({ major }) => !major)
        .forEach(drawTick);

    // draw time (X axis) ticks
    const y0 = pixY(minY);
    const tickAngle = -Math.PI / 6;
    const tickLength = 10;
    const timeTicks = getTimeScale(0);
    timeTicks.forEach(({ text, pix, major }) => {
        const thisTickSize = tickLength * 0.5 * (major + 1);

        // tick
        ctx.beginPath();
        ctx.strokeStyle = major
            ? rgba(COLOR_GRAPH_TITLE)
            : rgba(COLOR_DARK);
        ctx.moveTo(pix, y0);
        ctx.lineTo(pix, y0 - thisTickSize);
        ctx.stroke();
        ctx.closePath();

        // vertical line
        ctx.beginPath();
        ctx.strokeStyle = major > 1
            ? rgba(COLOR_LIGHT_GREY)
            : rgba(COLOR_LIGHT);
        ctx.moveTo(pix, y0 - thisTickSize);
        ctx.lineTo(pix, 0);
        ctx.stroke();
        ctx.closePath();

        if (text) {
            ctx.save();
            ctx.translate(pix, y0 - thisTickSize);
            ctx.rotate(tickAngle);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
    });

    // draw major Y ticks
    ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
    const x0 = pixX(minX);

    const ticksMajor = ticksY.filter(({ major }) => major);

    ticksMajor.forEach(drawTick);
    ticksMajor.forEach(({ value, pos }) => {
        const tickName = formatCurrency(value, {
            raw: true, noPence: true, abbreviate: true, precision: 1
        });
        ctx.fillText(tickName, x0, pos);
    });
}

export function getFutureKey({
    currentYearMonth: [currentYear, currentMonth],
    startYearMonth: [startYear, startMonth]
}) {
    return 1 + getKeyFromYearMonth(
        currentYear,
        currentMonth,
        startYear,
        startMonth
    );
}

function getTime(offset, breakAtToday, startYear, startMonth) {
    // converts a key index to a UNIX time stamp
    return key => {
        const [year, month] = getYearMonthFromKey(key - offset, startYear, startMonth);

        if (breakAtToday && year === today.year && month === today.month) {
            return now.ts / 1000;
        }

        // return the last day of this month
        return Math.floor(new Date(year, month, 1).getTime() / 1000) - 86400;
    };
}

export function getValuesWithTime(data, {
    oldOffset,
    breakAtToday,
    startYearMonth: [startYear, startMonth]
}) {

    const timeGetter = getTime(oldOffset, breakAtToday, startYear, startMonth);

    return data.map((value, index) => {

        const time = timeGetter(index);

        return list([time, value]);
    });
}

function drawNowLine({ minY, maxY }, { ctx }, { pixX, pixY }) {
    // draw a line indicating where the present ends and the future starts
    const nowLineX = Math.floor(pixX(now.ts / 1000)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(nowLineX, pixY(minY));
    ctx.lineTo(nowLineX, pixY(maxY));
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(COLOR_DARK);
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
    ctx.fillText('Now', nowLineX, pixY(maxY));
}

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
        drawNowLine(...args);
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

