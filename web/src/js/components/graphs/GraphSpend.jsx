/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import PropTypes from 'prop-types';
import { LineGraph } from './LineGraph';
import { formatCurrency, getTickSize } from '../../misc/format';
import { rgb2hex } from '../../misc/color';
import { getKeyFromYearMonth } from '../../misc/data';
import { MONTHS_SHORT, OVERVIEW_COLUMNS } from '../../misc/const';
import {
  COLOR_CATEGORY,
  COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_LIGHT, COLOR_DARK,
  COLOR_LIGHT_GREY,
  FONT_GRAPH_TITLE, FONT_GRAPH_KEY, FONT_AXIS_LABEL,
  GRAPH_KEY_OFFSET_X, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE
} from '../../misc/config';

export class GraphSpend extends LineGraph {
  update() {
    this.processData();
    this.padding = [48, 0, 45, 0];
    this.draw();
  }
  processData() {
    this.currentYearMonthKey = getKeyFromYearMonth(
      this.props.currentYearMonth[0], this.props.currentYearMonth[1],
      this.props.yearMonths[0][0], this.props.yearMonths[0][1]
    );

    this.colors = this.props.categories.map(
      category => [rgb2hex(COLOR_CATEGORY[category.name])]);

    // data is a list of columns
    let maxY = -Infinity;
    this.data = this.props.data.first().map((point, monthKey) => {
      const column = this.props.categories.map((category, categoryKey) => {
        return Math.max(0, this.props.data.getIn([categoryKey, monthKey]));
      });
      maxY = Math.max(maxY, column.reduce((a, b) => a + b, 0));
      return column;
    });

    this.setRange([0, this.props.yearMonths.length - 1, 0, maxY]);
  }
  drawAxes() {
    // draw X axis ticks
    this.ctx.strokeStyle = COLOR_LIGHT_GREY;
    this.ctx.lineWidth = 1;

    const ticksX = Array.apply(null, new Array(this.maxX)).map((_, key) => {
      const tickPos = Math.floor(this.pixX(key + 1)) + 0.5;
      // draw vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(tickPos, this.pixY(this.maxY));
      this.ctx.lineTo(tickPos, this.pixY(0) + 8 - 3 * (key % 2));
      this.ctx.stroke();

      return [key + 1, tickPos];
    });

    // calculate tick range
    const numTicks = 5;
    const tickSize = getTickSize(this.minY, this.maxY, numTicks);

    // draw Y axis ticks (log)
    const ticksY = Array.apply(null, new Array(numTicks)).map((_, key) => {
      const value = this.minY + (key + 1) * tickSize;
      const pos = Math.floor(this.pixY(value)) + 0.5;

      return { value, pos };
    }).filter(tick => tick.value <= this.maxY);

    // draw horizontal lines
    ticksY.forEach(tick => {
      this.ctx.beginPath();
      this.ctx.moveTo(this.pixX(this.minX), tick.pos);
      this.ctx.lineTo(this.pixX(this.maxX), tick.pos);
      this.ctx.stroke();
    });

    return { ticksX, ticksY, tickSize };
  }
  drawAxesTicks(axes) {
    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = COLOR_GRAPH_TITLE;

    axes.ticksY.forEach(tick => {
      const tickName = formatCurrency(tick.value, {
        raw: true, noPence: true, abbreviate: true
      });
      this.ctx.fillText(tickName, this.pixX(0), tick.pos);
    });

    // draw month ticks
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'right';

    const tickAngle = -Math.PI * 0.29;
    const y0 = this.pixY(this.minY) + 10;
    axes.ticksX.forEach(tick => {
      const tickName = MONTHS_SHORT[this.props.yearMonths[tick[0]][1] - 1] + '-' +
        (this.props.yearMonths[tick[0]][0] % 100).toString();

      this.ctx.save();
      this.ctx.translate(this.pixX(tick[0]), y0);
      this.ctx.rotate(tickAngle);
      this.ctx.fillText(tickName, 0, 0);
      this.ctx.restore();
    });
  }
  drawKey() {
    // draw rectangle over area which is predicted based on the past
    const future0 = this.pixX(this.currentYearMonthKey);
    const future1 = this.pixY(this.maxY);
    const futureW = this.pixX(this.maxX) - future0;
    const futureH = this.pixY(this.minY) - future1;
    this.ctx.beginPath();
    this.ctx.fillStyle = COLOR_TRANSLUCENT_LIGHT;
    this.ctx.fillRect(future0, future1, futureW, futureH);
    this.ctx.closePath();

    // add title and key
    this.ctx.font = FONT_GRAPH_TITLE;
    this.ctx.fillStyle = COLOR_GRAPH_TITLE;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    this.ctx.fillText('Spending', 15, 10);

    this.ctx.textBaseline = 'middle';
    this.ctx.font = FONT_GRAPH_KEY;

    this.props.categories.forEach(category => {
      const humanName = OVERVIEW_COLUMNS.find(item => item[0] === category.name)[1];
      this.ctx.fillStyle = COLOR_DARK;
      this.ctx.fillText(humanName, GRAPH_KEY_OFFSET_X + category.key, 40);

      this.ctx.fillStyle = rgb2hex(COLOR_CATEGORY[category.name]);
      this.ctx.fillRect(
        GRAPH_KEY_OFFSET_X + category.key - 15, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE
      );
    });
  }
  draw() {
    if (!this.supported) {
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    const axes = this.drawAxes();
    // plot data
    this.data.forEach((column, monthKey) => {
      const posX = Math.round(this.pixX(monthKey));
      let sum = 0;
      let bottomY = this.pixY(0);
      column.forEach((item, categoryKey) => {
        sum += item;
        const posY = Math.round(this.pixY(sum)) + 0.5;
        this.ctx.fillStyle = this.colors[categoryKey];
        this.ctx.fillRect(posX - 5, posY, 10, bottomY - posY);
        bottomY = posY;
      });
    });

    this.drawAxesTicks(axes);
    this.drawKey();
  }
}

GraphSpend.propTypes = {
  data: PropTypes.instanceOf(list),
  categories: PropTypes.array,
  currentYearMonth: PropTypes.array,
  yearMonths: PropTypes.array
};

