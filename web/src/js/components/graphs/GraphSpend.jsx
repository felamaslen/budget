/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import PropTypes from 'prop-types';
import { LineGraph } from './LineGraph';
import { formatCurrency, getTickSize } from '../../misc/format';
import { rgba } from '../../misc/color';
import { getKeyFromYearMonth } from '../../misc/data';
import { MONTHS_SHORT, OVERVIEW_COLUMNS } from '../../misc/const';
import {
  COLOR_CATEGORY,
  COLOR_GRAPH_TITLE, COLOR_TRANSLUCENT_LIGHT, COLOR_TRANSLUCENT_DARK,
  COLOR_DARK, COLOR_LIGHT_GREY, COLOR_PROFIT,
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
      category => [rgba(COLOR_CATEGORY[category.name])]
    );

    // data is a list of columns
    this.data = this.props.data.first().map((point, monthKey) => {
      let sum = 0;
      return this.props.categories.map((category, categoryKey) => {
        const thisItem = Math.max(0, this.props.data.getIn([categoryKey, monthKey]));
        sum += thisItem;
        return sum;
      }).reverse();
    });

    let maxY = this.data.reduce((last, column) => {
      return Math.max(last, column.first());
    }, -Infinity);
    maxY = this.props.income.reduce(
      (last, value) => Math.max(last, Math.min(1.5 * last, value)), maxY
    );

    const minY = 0;

    this.setRange([0, this.props.yearMonths.length + 1, minY, maxY]);
  }
  drawAxes() {
    // draw X axis ticks
    this.ctx.strokeStyle = rgba(COLOR_LIGHT_GREY);
    this.ctx.lineWidth = 1;

    const ticksX = Array.apply(null, new Array(this.maxX - 1)).map((_, key) => {
      const tickPos = Math.floor(this.pixX(key + 1)) + 0.5;
      // draw vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(tickPos, this.pixY(this.maxY));
      this.ctx.lineTo(tickPos, this.pixY(this.minY) + 8 - 3 * (key % 2));
      this.ctx.stroke();

      return [key, tickPos];
    });

    // calculate tick range
    const tickSize = getTickSize(this.minY, this.maxY, 10);

    // draw Y axis ticks
    const numTicks = Math.ceil((this.maxY - this.minY) / tickSize);
    const firstTick = Math.ceil(this.minY / tickSize) * tickSize;
    const ticksY = Array.apply(null, new Array(numTicks)).map((_, key) => {
      const value = firstTick + key * tickSize;
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
    this.ctx.textBaseline = 'bottom';
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);

    axes.ticksY.forEach(tick => {
      const tickName = formatCurrency(tick.value, {
        raw: true, noPence: true, abbreviate: true, precision: 1
      });
      this.ctx.fillText(tickName, this.pixX(0), tick.pos);
    });

    // draw month ticks
    this.ctx.fillStyle = rgba(COLOR_DARK);
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'right';

    const tickAngle = -Math.PI * 0.29;
    const y0 = this.pixY(this.minY) + 10;
    axes.ticksX.forEach(tick => {
      const tickName = MONTHS_SHORT[this.props.yearMonths[tick[0]][1] - 1] + '-' +
        (this.props.yearMonths[tick[0]][0] % 100).toString();

      this.ctx.save();
      this.ctx.translate(this.pixX(tick[0] + 1), y0);
      this.ctx.rotate(tickAngle);
      this.ctx.fillText(tickName, 0, 0);
      this.ctx.restore();
    });
  }
  drawKey() {
    // draw rectangle over area which is predicted based on the past
    const future0 = this.pixX(this.currentYearMonthKey + 1);
    const future1 = this.pixY(this.maxY);
    const futureW = this.pixX(this.maxX) - future0;
    const futureH = this.pixY(this.minY) - future1;
    this.ctx.beginPath();
    this.ctx.fillStyle = rgba(COLOR_TRANSLUCENT_LIGHT);
    this.ctx.fillRect(future0, future1, futureW, futureH);

    // background on key
    this.ctx.fillStyle = rgba(COLOR_TRANSLUCENT_DARK);
    this.ctx.fillRect(0, 0, 400, 64);
    this.ctx.closePath();

    // add title and key
    this.ctx.font = FONT_GRAPH_TITLE;
    this.ctx.fillStyle = rgba(COLOR_GRAPH_TITLE);
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    this.ctx.fillText('Cash flow', 15, 10);

    this.ctx.textBaseline = 'middle';
    this.ctx.font = FONT_GRAPH_KEY;

    this.props.categories.forEach(category => {
      const humanName = OVERVIEW_COLUMNS.find(item => item[0] === category.name)[1];
      this.ctx.fillStyle = rgba(COLOR_DARK);
      this.ctx.fillText(humanName, GRAPH_KEY_OFFSET_X + category.key, 40);

      this.ctx.fillStyle = rgba(COLOR_CATEGORY[category.name]);
      this.ctx.fillRect(
        GRAPH_KEY_OFFSET_X + category.key - 15, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE
      );
    });
  }
  drawData() {
    // plot data
    const y0 = this.pixY(0);

    this.data.forEach((column, monthKey) => {
      const posX = Math.round(this.pixX(monthKey + 1));

      // draw income bar
      const posY = this.pixY(this.props.income.get(monthKey));
      this.ctx.fillStyle = rgba(COLOR_PROFIT);
      this.ctx.fillRect(posX - 4, posY, 9, y0 - posY);

      // draw spending column
      const colors = this.colors.reverse();
      column.forEach((item, categoryKey) => {
        const thisPosY = Math.round(this.pixY(item)) + 0.5;
        this.ctx.fillStyle = colors.get(categoryKey);
        this.ctx.fillRect(posX - 8, thisPosY, 17, y0 - thisPosY);
      });
    });
  }
  draw() {
    if (!this.supported) {
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    const axes = this.drawAxes();
    this.drawData();
    this.drawAxesTicks(axes);
    this.drawKey();
  }
}

GraphSpend.propTypes = {
  data: PropTypes.instanceOf(list),
  income: PropTypes.instanceOf(list),
  categories: PropTypes.instanceOf(list),
  currentYearMonth: PropTypes.array,
  yearMonths: PropTypes.array
};

