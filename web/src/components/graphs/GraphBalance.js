/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { aShowAllToggled } from '../../actions/GraphActions';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import LineGraph from './LineGraph';

import { rgba } from '../../misc/color';
import { formatCurrency, getTickSize } from '../../misc/format';
import { getYearMonthFromKey, getKeyFromYearMonth } from '../../misc/data';
import { YMD } from '../../misc/date';
import { PAGES, GRAPH_WIDTH, GRAPH_HEIGHT } from '../../misc/const';
import {
    COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS,
    COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_LIGHT, COLOR_LIGHT, COLOR_DARK,
    COLOR_LIGHT_GREY,
    FONT_GRAPH_TITLE, FONT_GRAPH_KEY_SMALL, FONT_AXIS_LABEL,
    GRAPH_BALANCE_NUM_TICKS
} from '../../misc/config';

const today = new YMD();

export class GraphBalance extends LineGraph {
    update() {
        this.processData();
        this.padding = [40, 0, 0, 0];
        this.draw();
    }
    getTime(key, offset) {
        // converts a key index to a UNIX time stamp
        const yearMonth = getYearMonthFromKey(
            key - offset, this.props.startYearMonth[0], this.props.startYearMonth[1]
        );

        if (yearMonth[0] === today.year && yearMonth[1] === today.month) {
            // today is 1-indexed

            return today.timestamp();
        }

        // return the last day of this month
        return Math.floor(new Date(yearMonth[0], yearMonth[1], 1).getTime() / 1000) - 86400;
    }
    setRanges() {
        const dataY = this.dataBalance.map(item => item.last());
        const dataX = this.dataBalance.map(item => item.first());

        const minYValue = dataY.min();
        const minY = Math.min(0, minYValue);
        const maxY = dataY.max();
        const minX = dataX.min();
        const maxX = dataX.max();

        this.setRange([minX, maxX, minY, maxY]);

        // find the right tension, given the maximum jump in the data
        const maxJump = dataY.reduce((last, value) => {
            const thisJump = Math.abs(value - last[1]);
            if (thisJump > last[0]) {
                return [thisJump, value];
            }

            return last;
        }, [0, 0])[0];

        this.tension = maxJump > 10 * minYValue
            ? 1
            : 0.5;
    }
    processData() {
        // this doesn't really modify the data, it just puts it in a form ready for drawing

        // futureKey is used to separate past from future data
        const futureKey = this.props.oldOffset + 1 + getKeyFromYearMonth(
            this.props.currentYearMonth[0],
            this.props.currentYearMonth[1],
            this.props.startYearMonth[0],
            this.props.startYearMonth[1]
        );

        this.dataBalance = this.props.balance.map((value, key) => {
            const time = this.getTime(key, this.props.oldOffset);

            return list([time, value]);
        });

        this.dataFunds = this.props.funds.map((value, key) => {
            return list([this.dataBalance.getIn([key, 0]), value]);
        });

        // for changing the colour
        this.colorTransition = [futureKey - 1];
        this.setRanges();
    }
    getTicksY() {
        const minorTicks = 5;
        const numTicks = GRAPH_BALANCE_NUM_TICKS * minorTicks;

        const tickSize = getTickSize(this.minY, this.maxY, numTicks);

        return new Array(numTicks)
            .fill(0)
            .map((item, key) => {
                const pos = Math.floor(this.pixY(key * tickSize)) + 0.5;
                const major = key % minorTicks === 0;
                const value = key * tickSize * 100;

                return { pos, major, value };
            });
    }
    drawAxes() {
        // draw axes
        this.ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
        this.ctx.lineWidth = 1;

        this.ctx.font = FONT_AXIS_LABEL;
        this.ctx.fillStyle = rgba(COLOR_DARK);
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';

        const ticksY = this.getTicksY();

        const drawTick = tick => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.pixX(this.minX), tick.pos);
            this.ctx.lineTo(this.pixX(this.maxX), tick.pos);
            this.ctx.stroke();
            this.ctx.closePath();
        };

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
        const ticksMajor = ticksY.filter(tick => tick.value > 0 && tick.major);
        ticksMajor.forEach(drawTick);
        ticksMajor.forEach(tick => {
            const tickName = formatCurrency(tick.value, {
                raw: true, noPence: true, abbreviate: true
            });
            this.ctx.fillText(tickName, x0, tick.pos);
        });
    }
    drawKeyBackground() {
        this.ctx.beginPath();
        this.ctx.fillStyle = rgba(COLOR_TRANSLUCENT_LIGHT);
        this.ctx.fillRect(45, 8, 200, 60);
        this.ctx.closePath();
    }
    drawKeyActual() {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = rgba(COLOR_BALANCE_ACTUAL);
        this.ctx.moveTo(50, 40);
        this.ctx.lineTo(74, 40);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.font = FONT_GRAPH_KEY_SMALL;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = rgba(COLOR_DARK);
        this.ctx.fillText('Actual', 78, 40);

    }
    drawKeyPredicted() {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = rgba(COLOR_BALANCE_PREDICTED);
        this.ctx.moveTo(130, 40);
        this.ctx.lineTo(154, 40);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fillText('Predicted', 158, 40);
    }
    drawKeyFunds() {
        this.ctx.fillText('Stocks', 78, 57);
        this.ctx.fillStyle = rgba(COLOR_BALANCE_STOCKS);
        this.ctx.fillRect(50, 54, 24, 6);
    }
    drawTitle() {
        this.ctx.font = FONT_GRAPH_TITLE;
        this.ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        this.ctx.fillText('Balance', 65, 10);
    }
    drawKey() {
        // add title and key
        this.drawKeyBackground();
        this.drawKeyActual();
        this.drawKeyPredicted();
        this.drawKeyFunds();

        this.drawTitle();
    }
    drawFundsLine() {
        // plot funds data
        this.ctx.lineWidth = 2;
        this.drawCubicLine(
            this.dataFunds,
            [rgba(COLOR_BALANCE_STOCKS)],
            {
                fill: true,
                stroke: false,
                tension: 1
            }
        );
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
    draw() {
        if (!this.supported) {
            return;
        }

        // clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawAxes();
        this.drawNowLine();

        // plot past + future predicted data
        this.ctx.lineWidth = 2;
        this.drawCubicLine(this.dataBalance, [rgba(COLOR_BALANCE_ACTUAL), rgba(COLOR_BALANCE_PREDICTED)]);

        // plot past + future predicted ISA stock value
        this.drawFundsLine();

        this.drawKey();
    }
    afterCanvas() {
        const showAllClasses = classNames({
            'show-all': true,
            noselect: true,
            enabled: this.props.showAll
        });

        const showAll = () => this.props.toggleShowAll();

        return <span className={showAllClasses} onClick={showAll}>
            <span>Show all</span>
            <a className="checkbox" />
        </span>;
    }
}

GraphBalance.propTypes = {
    currentYearMonth: PropTypes.array.isRequired,
    startYearMonth: PropTypes.array.isRequired,
    yearMonths: PropTypes.array.isRequired,
    showAll: PropTypes.bool.isRequired,
    oldOffset: PropTypes.number.isRequired,
    balance: PropTypes.instanceOf(list).isRequired,
    funds: PropTypes.instanceOf(list).isRequired,
    toggleShowAll: PropTypes.func.isRequired
};

const pageIndex = PAGES.indexOf('overview');

function getBalanceWithFunds(cost, showAll) {
    let oldOffset = 0;
    let balance = cost.get('balanceWithPredicted');
    let funds = cost.get('funds');

    if (showAll) {
        oldOffset = cost.get('old').size;
        balance = cost.get('old').concat(balance);
        funds = cost.get('fundsOld').concat(funds);
    }

    return { oldOffset, balance, funds };
}

const mapStateToProps = state => {
    const showAll = state.getIn(['global', 'other', 'showAllBalanceGraph']);

    const cost = state.getIn(['global', 'pages', pageIndex, 'data', 'cost']);
    const { oldOffset, balance, funds } = getBalanceWithFunds(cost, showAll);

    return {
        width: Math.min(GRAPH_WIDTH, window.innerWidth),
        height: GRAPH_HEIGHT,
        currentYearMonth: state.getIn(
            ['global', 'pages', pageIndex, 'data', 'currentYearMonth']
        ),
        startYearMonth: state.getIn(
            ['global', 'pages', pageIndex, 'data', 'startYearMonth']
        ),
        yearMonths: state.getIn(['global', 'pages', pageIndex, 'data', 'yearMonths']),
        showAll,
        oldOffset,
        balance,
        funds
    };
};

const mapDispatchToProps = dispatch => ({
    toggleShowAll: () => dispatch(aShowAllToggled())
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphBalance);

