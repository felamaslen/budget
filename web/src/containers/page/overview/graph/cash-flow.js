import extendableContainer from '../../../container-extender';

import { List as list } from 'immutable';
import PropTypes from 'prop-types';

import { GRAPH_WIDTH, GRAPH_HEIGHT } from '../../../../misc/const';
import {
    COLOR_DARK, COLOR_LIGHT,
    COLOR_GRAPH_TITLE, COLOR_LIGHT_GREY, COLOR_TRANSLUCENT_LIGHT,
    FONT_AXIS_LABEL, FONT_GRAPH_TITLE,
    GRAPH_CASHFLOW_NUM_TICKS
} from '../../../../misc/config';
import { getYearMonthFromKey, getKeyFromYearMonth } from '../../../../misc/data';
import { getTickSize, formatCurrency } from '../../../../misc/format';
import { YMD } from '../../../../misc/date';
import { rgba } from '../../../../misc/color';

import LineGraph from '../../../../components/graph/line';

const today = new YMD();

export class GraphCashFlow extends LineGraph {
    update() {
        this.processData();
        this.padding = [40, 0, 0, 0];
        this.draw();
    }
    getTime(key, offset) {
        // converts a key index to a UNIX time stamp
        const yearMonth = getYearMonthFromKey(
            key - offset, this.props.startYear, this.props.startMonth
        );

        if (this.props.breakAtToday &&
            yearMonth[0] === today.year && yearMonth[1] === today.month) {
            // today is 1-indexed

            return today.timestamp();
        }

        // return the last day of this month
        return Math.floor(new Date(yearMonth[0], yearMonth[1], 1).getTime() / 1000) - 86400;
    }
    getFutureKey() {
        return 1 + getKeyFromYearMonth(
            this.props.currentYear,
            this.props.currentMonth,
            this.props.startYear,
            this.props.startMonth
        );
    }
    getValuesWithTime(data) {
        return data.map((value, key) => {
            const time = this.getTime(key, this.props.oldOffset);

            return list([time, value]);
        });
    }
    drawNowLine() {
        // draw a line indicating where the present ends and the future starts
        const nowLineX = Math.floor(this.pixX(today.timestamp())) + 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(nowLineX, this.pixY(this.minY));
        this.ctx.lineTo(nowLineX, this.pixY(this.maxY));
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = rgba(COLOR_DARK);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
        this.ctx.fillText('Now', nowLineX, this.pixY(this.maxY));
    }
    getTicksY(numMajorTicks = GRAPH_CASHFLOW_NUM_TICKS) {
        const minorTicks = 5;
        const numTicks = numMajorTicks * minorTicks;

        const tickSize = getTickSize(this.minY, this.maxY, numTicks);
        const keyOffset = Math.ceil(this.minY / tickSize);

        return new Array(numTicks)
            .fill(0)
            .map((item, tickKey) => {
                const key = tickKey + keyOffset;

                const pos = Math.floor(this.pixY(key * tickSize)) + 0.5;
                const major = key % minorTicks === 0;
                const value = key * tickSize;

                return { pos, major, value };
            });
    }
    drawAxes() {
        const ticksY = this.getTicksY();

        const drawTick = tick => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.pixX(this.minX), tick.pos);
            this.ctx.lineTo(this.pixX(this.maxX), tick.pos);
            this.ctx.stroke();
            this.ctx.closePath();
        };

        // draw axes
        this.ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
        this.ctx.lineWidth = 1;

        this.ctx.font = FONT_AXIS_LABEL;
        this.ctx.fillStyle = rgba(COLOR_DARK);
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';

        // draw minor Y ticks
        this.ctx.strokeStyle = rgba(COLOR_LIGHT);
        ticksY.filter(tick => !tick.major).forEach(drawTick);

        // draw time (X axis) ticks
        const y0 = this.pixY(this.minY);
        const tickAngle = -Math.PI / 6;
        const tickLength = 10;
        const timeTicks = this.getTimeScale(0);
        timeTicks.forEach(tick => {
            const thisTickSize = tickLength * 0.5 * (tick.major + 1);

            // tick
            this.ctx.beginPath();
            this.ctx.strokeStyle = tick.major
                ? rgba(COLOR_GRAPH_TITLE)
                : rgba(COLOR_DARK);
            this.ctx.moveTo(tick.pix, y0);
            this.ctx.lineTo(tick.pix, y0 - thisTickSize);
            this.ctx.stroke();
            this.ctx.closePath();

            // vertical line
            this.ctx.beginPath();
            this.ctx.strokeStyle = tick.major > 1
                ? rgba(COLOR_LIGHT_GREY)
                : rgba(COLOR_LIGHT);
            this.ctx.moveTo(tick.pix, y0 - thisTickSize);
            this.ctx.lineTo(tick.pix, 0);
            this.ctx.stroke();
            this.ctx.closePath();

            if (tick.text) {
                this.ctx.save();
                this.ctx.translate(tick.pix, y0 - thisTickSize);
                this.ctx.rotate(tickAngle);
                this.ctx.fillText(tick.text, 0, 0);
                this.ctx.restore();
            }
        });

        // draw major Y ticks
        this.ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
        const x0 = this.pixX(this.minX);
        const ticksMajor = ticksY.filter(tick => tick.major);
        ticksMajor.forEach(drawTick);
        ticksMajor.forEach(tick => {
            const tickName = formatCurrency(tick.value, {
                raw: true, noPence: true, abbreviate: true, precision: 1
            });
            this.ctx.fillText(tickName, x0, tick.pos);
        });
    }
    drawTitle(title) {
        this.ctx.font = FONT_GRAPH_TITLE;
        this.ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        this.ctx.fillText(title, 65, 10);
    }
    drawKeyBackground() {
        this.ctx.beginPath();
        this.ctx.fillStyle = rgba(COLOR_TRANSLUCENT_LIGHT);
        this.ctx.fillRect(45, 8, 200, 60);
        this.ctx.closePath();
    }
    drawKey() {
        // add title and key
        this.drawKeyBackground();

        this.drawTitle();
    }
    draw() {
        if (!this.supported) {
            return;
        }

        // clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawAxes();
        this.drawNowLine();
    }
}

GraphCashFlow.propTypes = {
    yearMonths: PropTypes.instanceOf(list).isRequired,
    currentYear: PropTypes.number.isRequired,
    currentMonth: PropTypes.number.isRequired,
    startYear: PropTypes.number.isRequired,
    startMonth: PropTypes.number.isRequired,
    oldOffset: PropTypes.number.isRequired,
    breakAtToday: PropTypes.bool
};

const stateDefault = pageIndex => state => {
    const [currentYear, currentMonth] = state.getIn(['pages', pageIndex, 'data', 'currentYearMonth']);
    const [startYear, startMonth] = state.getIn(['pages', pageIndex, 'data', 'startYearMonth']);

    return {
        width: Math.min(GRAPH_WIDTH, window.innerWidth),
        height: GRAPH_HEIGHT,
        yearMonths: list(state.getIn(['pages', pageIndex, 'data', 'yearMonths'])),
        currentYear,
        currentMonth,
        startYear,
        startMonth,
        oldOffset: 0
    };
};

const dispatchDefault = () => () => ({});

export default pageIndex => extendableContainer(stateDefault, dispatchDefault)(pageIndex);

