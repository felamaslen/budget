/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LineGraph } from './LineGraph';
import { formatCurrency, getTickSize } from '../../misc/format';
import { getYearMonthFromKey, getKeyFromYearMonth } from '../../misc/data';
import { YMD } from '../../misc/date';
import {
  COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED, COLOR_BALANCE_STOCKS,
  COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_LIGHT, COLOR_LIGHT, COLOR_DARK,
  COLOR_LIGHT_GREY,
  FONT_GRAPH_TITLE, FONT_GRAPH_KEY_SMALL, FONT_AXIS_LABEL,
  GRAPH_BALANCE_NUM_TICKS
} from '../../misc/config';
import { aShowAllToggled } from '../../actions/GraphActions';

const hundredth = item => item / 100;
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
      key - offset, this.props.startYearMonth[0], this.props.startYearMonth[1]);
    if (yearMonth[0] === today.year && yearMonth[1] === today.month) { // today is 1-indexed
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
    this.tension = maxJump > 10 * minYValue ? 1 : 0.5;
  }
  processData() {
    /**
     * this doesn't really modify the data, it just puts it in a form ready for drawing
     */

    // have an offset key when including old data
    const oldOffset = this.props.showAll ? this.props.balanceOld.size : 0;

    // futureKey is used to separate past from future data
    const futureKey = oldOffset + getKeyFromYearMonth(
      this.props.currentYearMonth[0], this.props.currentYearMonth[1],
      this.props.startYearMonth[0], this.props.startYearMonth[1]
    ) + 1;

    const dataBalance = (
      this.props.showAll
      ? this.props.balanceOld.concat(this.props.balance)
      : this.props.balance).map(hundredth);

    this.dataBalance = dataBalance.map((value, key) => {
      const time = this.getTime(key, oldOffset);
      return list([time, value]);
    });

    const dataFunds = (
      this.props.showAll
      ? this.props.fundsOld.concat(this.props.funds)
      : this.props.funds).map(hundredth);

    this.dataFunds = dataFunds.map((value, key) => {
      return list([this.dataBalance.getIn([key, 0]), value]);
    });

    // for changing the colour
    this.colorTransition = [futureKey - 1];
    this.setRanges();
  }
  drawAxes() {
    // draw axes
    this.ctx.strokeStyle = COLOR_LIGHT_GREY;
    this.ctx.lineWidth = 1;

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';

    // calculate tick range
    const minorTicks = 5;
    const numTicks = GRAPH_BALANCE_NUM_TICKS * minorTicks;
    const tickSize = getTickSize(this.minY, this.maxY, numTicks);
    const ticksY = Array.apply(null, new Array(numTicks)).map((_, key) => {
      const pos = Math.floor(this.pixY(key * tickSize)) + 0.5;
      const major = key % minorTicks === 0;
      const value = key * tickSize * 100;

      return { pos, major, value };
    });

    const drawTick = tick => {
      this.ctx.beginPath();
      this.ctx.moveTo(this.pixX(this.minX), tick.pos);
      this.ctx.lineTo(this.pixX(this.maxX), tick.pos);
      this.ctx.stroke();
      this.ctx.closePath();
    };

    // draw minor Y ticks
    this.ctx.strokeStyle = COLOR_LIGHT;
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
      this.ctx.strokeStyle = tick.major ? COLOR_GRAPH_TITLE : COLOR_DARK;
      this.ctx.moveTo(tick.pix, y0);
      this.ctx.lineTo(tick.pix, y0 - thisTickSize);
      this.ctx.stroke();
      this.ctx.closePath();

      // vertical line
      this.ctx.beginPath();
      this.ctx.strokeStyle = tick.major > 1 ? COLOR_LIGHT_GREY : COLOR_LIGHT;
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
    this.ctx.strokeStyle = COLOR_LIGHT_GREY;
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
  drawKey() {
    // add title and key
    this.ctx.beginPath();
    this.ctx.fillStyle = COLOR_TRANSLUCENT_LIGHT;
    this.ctx.fillRect(45, 8, 200, 60);
    this.ctx.closePath();

    this.ctx.font = FONT_GRAPH_TITLE;
    this.ctx.fillStyle = COLOR_GRAPH_TITLE;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    this.ctx.fillText('Balance', 65, 10);

    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = COLOR_BALANCE_ACTUAL;
    this.ctx.moveTo(50, 40);
    this.ctx.lineTo(74, 40);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.font = FONT_GRAPH_KEY_SMALL;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.fillText('Actual', 78, 40);

    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = COLOR_BALANCE_PREDICTED;
    this.ctx.moveTo(130, 40);
    this.ctx.lineTo(154, 40);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fillText('Predicted', 158, 40);

    this.ctx.fillText('Stocks', 78, 57);
    this.ctx.fillStyle = COLOR_BALANCE_STOCKS;
    this.ctx.fillRect(50, 54, 24, 6);
  }
  drawFundsLine() {
    // plot funds data
    this.ctx.lineWidth = 2;
    this.drawCubicLine(
      this.dataFunds, [COLOR_BALANCE_STOCKS], { fill: true, stroke: false, tension: 1 });
  }
  drawNowLine() {
    // draw a line indicating where the present ends and the future starts
    const nowLineX = Math.floor(this.pixX(today.timestamp())) + 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(nowLineX, this.pixY(this.minY));
    this.ctx.lineTo(nowLineX, this.pixY(this.maxY));
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = COLOR_DARK;
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.fillStyle = COLOR_GRAPH_TITLE;
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
    this.drawCubicLine(this.dataBalance, [COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED]);

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

    return (
      <span className={showAllClasses} onClick={() => this.dispatchAction(aShowAllToggled())}>
        <span>Show all</span>
        <a className='checkbox' />
      </span>
    );
  }
}

GraphBalance.propTypes = {
  currentYearMonth: PropTypes.array,
  startYearMonth: PropTypes.array,
  yearMonths: PropTypes.array,
  showAll: PropTypes.bool,
  balance: PropTypes.instanceOf(list),
  balanceOld: PropTypes.instanceOf(list),
  funds: PropTypes.instanceOf(list),
  fundsOld: PropTypes.instanceOf(list)
};

