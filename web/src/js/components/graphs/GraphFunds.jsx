/*
 * Graph general cash flow (balance over time)
 */

import { List as list, Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LineGraph } from './LineGraph';
import { formatCurrency, getTickSize } from '../../misc/format';
import {
  GRAPH_FUNDS_DEFAULT_PERIOD,
  GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_MODE_ABSOLUTE, GRAPH_FUNDS_MODE_PRICE,
  GRAPH_FUNDS_NUM_TICKS,
  GRAPH_ZOOM_MAX, GRAPH_ZOOM_SPEED
} from '../../misc/const';
import {
  GRAPH_FUNDS_TENSION, GRAPH_FUNDS_MODES,
  COLOR_DARK, COLOR_PROFIT_LIGHT, COLOR_LOSS_LIGHT, COLOR_LIGHT_GREY,
  COLOR_GRAPH_TITLE,
  FONT_AXIS_LABEL
} from '../../misc/config';
import { aFundsGraphClicked } from '../../actions/GraphActions';

export class GraphFunds extends LineGraph {
  constructor(props) {
    super(props);
    this.canvasProperties = {
      onClick: () => {
        this.dispatchAction(aFundsGraphClicked());
      }
    };
    this.padding = [36, 0, 0, 0];
    this.tension = GRAPH_FUNDS_TENSION;
  }
  update() {
    this.processData();
    this.draw();
  }
  setRangeValues() {
    const minX = this.props.zoom.first();
    const maxX = this.props.zoom.last();

    const valuesY = this.props.lines.map(line => line.last().map(item => item.last()));
    let minY = valuesY.reduce((last, line) => {
      return Math.min(last, line.min());
    }, Infinity);
    let maxY = valuesY.reduce((last, line) => {
      return Math.max(last, line.max());
    }, -Infinity);
    if (minY === maxY) {
      minY -= 0.5;
      maxY += 0.5;
    }
    if (this.props.mode === GRAPH_FUNDS_MODE_ROI && minY === 0) {
      minY = -maxY * 0.2;
    }

    // get the tick size for the new range
    this.tickSizeY = getTickSize(minY, maxY, GRAPH_FUNDS_NUM_TICKS);
    if (!isNaN(this.tickSizeY)) {
      this.setRange([
        minX, maxX,
        this.tickSizeY * Math.floor(minY / this.tickSizeY),
        this.tickSizeY * Math.ceil(maxY / this.tickSizeY)
      ]);
    }
    else {
      this.setRange([minX, maxX, minY, maxY]);
    }
  }
  processData() {
    this.setRangeValues();
    this.period = this.props.period || GRAPH_FUNDS_DEFAULT_PERIOD; // TODO
    this.draw();
  }
  formatValue(value) {
    if (this.props.mode === GRAPH_FUNDS_MODE_ROI) {
      return value.toFixed(2) + '%';
    }
    if (this.props.mode === GRAPH_FUNDS_MODE_ABSOLUTE) {
      return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
    }
    return Math.round(100 * value) / 100;
  }
  zoomX(direction) {
    if (this.hlPoint[0] === -1 || this.hlPoint[1] === -1 ||
        (direction < 0 && this.dataVisiblegetIn([0, 1]).size < 4)) {
      return;
    }

    const center = this.props.lines.getIn([this.hlPoint[0], 1, this.hlPoint[1], 0]);
    const newRange = Math.max(
      (this.originalRange[1] - this.originalRange[0]) * GRAPH_ZOOM_MAX,
      (this.maxX - this.minX) * (1 + GRAPH_ZOOM_SPEED * direction)
    );
    let newMinXTarget = center - newRange / 2;
    let newMaxXTarget = center + newRange / 2;
    if (newMinXTarget < this.originalRange[0]) {
      newMaxXTarget += this.originalRange[0] - newMinXTarget;
      newMinXTarget = this.originalRange[0];
    }
    else if (newMaxXTarget > this.originalRange[1]) {
      newMinXTarget -= newMaxXTarget - this.originalRange[1];
      newMaxXTarget = this.originalRange[1];
    }

    const newMinX = Math.max(this.originalRange[0], Math.round(newMinXTarget));
    const newMaxX = Math.min(this.originalRange[1], Math.round(newMaxXTarget));

    this.setRange([newMinX, newMaxX, this.minY, this.maxY]);

    this.calculateYRange();
    this.draw();
  }
  drawAxes() {
    const axisTextColor = COLOR_DARK;
    const timeTicks = this.getTimeScale(this.props.history.get('startTime'));

    this.ctx.lineWidth = 1;

    // draw profit / loss backgrounds
    if (this.props.mode === GRAPH_FUNDS_MODE_ROI) {
      const zero = this.pixY(Math.min(Math.max(0, this.minY), this.maxY));
      if (this.maxY > 0) {
        this.ctx.fillStyle = COLOR_PROFIT_LIGHT;
        const y0 = this.pixY(this.maxY);
        this.ctx.fillRect(this.pixX(this.minX), y0, this.pixX(this.maxX), zero - y0);
      }
      if (this.minY < 0) {
        this.ctx.fillStyle = COLOR_LOSS_LIGHT;
        this.ctx.fillRect(this.pixX(this.minX), zero, this.pixX(this.maxX), this.pixY(this.minY) - zero);
      }
    }

    // calculate tick range
    const numTicks = isNaN(this.tickSizeY) ? 0 :
      Math.floor((this.maxY - this.minY) / this.tickSizeY);
    const ticksY = Array.apply(null, new Array(numTicks)).map((_, key) => {
      const value = this.minY + (key + 1) * this.tickSizeY;
      const pos = Math.floor(this.pixY(value)) + 0.5;
      return { value, pos };
    });

    // draw horizontal lines
    this.ctx.strokeStyle = COLOR_LIGHT_GREY;
    ticksY.forEach(tick => {
      // draw horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(this.pixX(this.minX), tick.pos);
      this.ctx.lineTo(this.pixX(this.maxX), tick.pos);
      this.ctx.stroke();
      this.ctx.closePath();
    });

    // draw time (X axis) ticks
    const y0 = this.pixY(this.minY);

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = axisTextColor;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';

    const tickAngle = -Math.PI / 6;
    const tickSize = 10;

    timeTicks.forEach(tick => {
      const thisTickSize = tickSize * 0.5 * (tick.major + 1);

      this.ctx.beginPath();
      this.ctx.strokeStyle = tick.major ? COLOR_GRAPH_TITLE : COLOR_DARK;
      this.ctx.moveTo(tick.pix, y0);
      this.ctx.lineTo(tick.pix, y0 - thisTickSize);
      this.ctx.stroke();
      this.ctx.closePath();

      if (tick.major > 1) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = COLOR_LIGHT_GREY;
        this.ctx.moveTo(tick.pix, y0 - thisTickSize);
        this.ctx.lineTo(tick.pix, this.padY1);
        this.ctx.stroke();
        this.ctx.closePath();
      }

      if (tick.text) {
        this.ctx.save();
        this.ctx.translate(tick.pix, y0 - thisTickSize);
        this.ctx.rotate(tickAngle);
        this.ctx.fillText(tick.text, 0, 0);
        this.ctx.restore();
      }
    });

    // draw Y axis
    this.ctx.fillStyle = axisTextColor;
    this.ctx.textBaseline = 'bottom';
    this.ctx.textAlign = 'right';
    this.ctx.font = FONT_AXIS_LABEL;

    ticksY.forEach(tick => {
      const tickName = this.formatValue(tick.value, true, true);
      this.ctx.fillText(tickName, this.pixX(this.maxX), tick.pos);
    });
  }
  drawData() {
    const mainIndex = this.props.lines.size - 1;

    // plot past data
    this.props.lines.forEach((line, index) => {
      const mainLine = index === mainIndex && this.props.showOverall &&
        this.props.mode !== GRAPH_FUNDS_MODE_PRICE;

      this.ctx.lineWidth = mainLine ? 1.5 : 1;
      if (this.props.mode === GRAPH_FUNDS_MODE_ROI) {
        this.drawCubicLine(line.last(), [line.first()]);
      }
      else {
        this.drawLine(line.last(), [line.first()]);
      }
    });
  }
  draw() {
    if (!this.supported) {
      return;
    }
    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawAxes();
    this.drawData();
    // this.handleMouseover();
    // this.drawModeIndicator();
  }
  afterCanvas() {
    // funds list for selection
    return (
      <div>
        <span className='mode'>
          Mode:&nbsp;{GRAPH_FUNDS_MODES[this.props.mode]}
        </span>
      </div>
    );
  }
}

GraphFunds.propTypes = {
  history: PropTypes.instanceOf(map),
  lines: PropTypes.instanceOf(list),
  funds: PropTypes.instanceOf(list),
  period: PropTypes.instanceOf('string'),
  mode: PropTypes.number,
  showOverall: PropTypes.bool,
  zoom: PropTypes.instanceOf(list),
  hlPoint: PropTypes.instanceOf(list)
};

