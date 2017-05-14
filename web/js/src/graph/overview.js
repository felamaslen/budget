/**
 * Overview page graphs
 */

import $ from "../../lib/jquery.min";

import { getTickSize, LineGraph } from "graph/graph";
import { arraySum, capitalise } from "misc/misc";

import {
  COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED,
  COLOR_GRAPH_TITLE, COLOR_DARK, COLOR_LIGHT_GREY, COLOR_LIGHT, COLOR_CATEGORY,
  FONT_GRAPH_TITLE, FONT_GRAPH_KEY_SMALL, FONT_AXIS_LABEL, FONT_GRAPH_KEY,
  GRAPH_BALANCE_NUM_TICKS, GRAPH_KEY_OFFSET_X, GRAPH_KEY_OFFSET_Y,
  GRAPH_KEY_SIZE
} from "const";

import { hundredth, indexPoints, months } from "misc/misc";
import { rgb } from "misc/color";
import { formatCurrency, numberFormat } from "misc/format";

export class GraphBalance extends LineGraph {
  constructor(options, api, state) {
    super(options, api, state);

    this.currentYear = options.currentYear;
    this.currentMonth = options.currentMonth;
    this.startYear = options.startYear;
    this.startMonth = options.startMonth;
    this.yearMonths = options.yearMonths;

    this.dataPast = options.dataPast;
    this.dataFuture = options.dataFuture;
    this.dataOld = options.dataOld;

    this.colors = [COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED];
    this.stroke = true;

    this.showAll = false;
    const $showAll = $("<span></span>")
    .addClass("show-all").addClass("noselect")
    .toggleClass("enabled", this.showAll)
    .append("<span>Show all</span>")
    .on("click", () => {
      this.toggleShowAll();
      $showAll.toggleClass("enabled", this.showAll);
    });
    const $checkbox = $("<span></span>").addClass("checkbox");
    $showAll.append($checkbox);
    this.$gCont.append($showAll);

    this.processData();
  }
  toggleShowAll() {
    this.showAll = !this.showAll;
    this.processData();
    this.draw();
  }
  drawKey() {
    // add title and key
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.fillRect(45, 8, 200, 60);
    this.ctx.closePath();

    this.ctx.font = FONT_GRAPH_TITLE;
    this.ctx.fillStyle = COLOR_GRAPH_TITLE;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    this.ctx.fillText("Balance", 65, 10);

    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = COLOR_BALANCE_ACTUAL;
    this.ctx.moveTo(50, 40);
    this.ctx.lineTo(74, 40);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.font = FONT_GRAPH_KEY_SMALL;
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.fillText("Actual", 78, 40);

    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = COLOR_BALANCE_PREDICTED;
    this.ctx.moveTo(130, 40);
    this.ctx.lineTo(154, 40);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.fillText("Predicted", 158, 40);
  }
  drawAxes() {
    // draw axes
    this.ctx.strokeStyle = COLOR_LIGHT_GREY;
    this.ctx.lineWidth = 1;

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom";

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
      this.ctx.moveTo(this.padX1, tick.pos);
      this.ctx.lineTo(this.width - this.padX2, tick.pos);
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
    const ticksMajor = ticksY.filter(tick => tick.major);
    ticksMajor.filter(tick => tick.major).forEach(drawTick);
    return ticksMajor;
  }
  draw() {
    if (!this.supported) {
      return;
    }

    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    const ticksY = this.drawAxes();

    // plot past + future predicted data
    this.drawCubicLine(this.dataMain, this.colors);

    // draw Y axis
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "left";

    ticksY.forEach(tick => {
      const tickName = formatCurrency(tick.value, { raw: true, noZeroes: true });
      this.ctx.fillText(tickName, this.padX1, tick.pos);
    });
    this.drawKey();
  }
  setRanges() {
    const dataY = this.dataMain.map(item => item[1]);
    const dataX = this.dataMain.map(item => item[0]);

    const minY = Math.min(0, Math.min.apply(null, dataY));
    const maxY = Math.max.apply(null, dataY);
    const minX = Math.min.apply(null, dataX);
    const maxX = Math.max.apply(null, dataX);

    this.setRange([minX, maxX, minY, maxY]);
  }
  getTime(key) {
    // converts a key index to a UNIX time stamp
    key -= this.oldOffset;
    const year = this.startYear + Math.floor((key + this.startMonth) / 12);
    const month = (this.startMonth + key + 12) % 12;
    return new Date(year, month - 1, 1).getTime() / 1000;
  }
  processData() {
    const dataActual = (this.showAll ? this.dataOld.concat(this.dataPast) : this.dataPast)
    .map(hundredth);
    const dataPredicted = this.dataFuture.map(hundredth);

    this.oldOffset = this.showAll ? this.dataOld.length : 0;
    this.futureKey = this.oldOffset + 12 * (this.currentYear - this.startYear) +
      this.currentMonth - this.startMonth + 1;

    // combine the actual data with the future predicted data
    this.dataMain = dataActual.map((item, key) => {
      const time = this.getTime(key);
      const value = key < this.futureKey ? item : dataPredicted[key - this.oldOffset];
      return [time, value];
    });

    // for changing the colour
    this.transition = [this.futureKey - 1];

    this.dataPredicted = dataPredicted.map(indexPoints);
    this.setRanges();
  }
  update(costBalance, costPredicted, balanceOld) {
    this.dataPast = costBalance;
    this.dataFuture = costPredicted;
    this.dataOld = balanceOld;

    this.processData();
    this.draw();
  }
}

export class GraphSpend extends LineGraph {
  constructor(options, api, state) {
    super(options, api, state);
    this.tension = 1; // for graph interpolator
    this.yearMonths = options.yearMonths;
    this.currentYearMonthKey = (12 * options.currentYear + options.currentMonth) -
      (12 * this.yearMonths[0][0] + this.yearMonths[0][1]);
    this.categories = [
      { name: "bills", key: 15 },
      { name: "food", key: 67 },
      { name: "general", key: 125 },
      { name: "holiday", key: 195 },
      { name: "social", key: 260 }
    ];
    this.textColors = COLOR_CATEGORY;
    this.colors = this.categories.map(category => [rgb(this.textColors[category.name])]);
    this.fill = true;
    this.getData(options.data);
  }
  drawAxes() {
    // draw X axis ticks
    this.ctx.strokeStyle = COLOR_LIGHT_GREY;
    this.ctx.lineWidth = 1;

    const ticksX = Array.apply(null, new Array(this.maxX)).map((_, key) => {
      const tickPos = Math.floor(this.pixX(key + 1)) + 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(tickPos, this.padY1);
      this.ctx.lineTo(tickPos, this.height - this.padY2 + 8 - 3 * (key % 2));
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
      this.ctx.moveTo(this.padX1, tick.pos);
      this.ctx.lineTo(this.width - this.padX2, tick.pos);
      this.ctx.stroke();
    });

    return { ticksX, ticksY, tickSize };
  }
  drawAxesTicks(axes) {
    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = COLOR_GRAPH_TITLE;

    axes.ticksY.forEach(tick => {
      const tickName = "£" + numberFormat(tick.value);
      this.ctx.fillText(tickName, this.pixX(0), tick.pos);
    });

    // draw month ticks
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "right";

    const tickAngle = -Math.PI * 0.29;
    const y0 = this.pixY(this.minY) + 10;
    axes.ticksX.forEach(tick => {
      const tickName = months[this.yearMonths[tick[0]][1] - 1] + "-" +
        (this.yearMonths[tick[0]][0] % 100).toString();

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
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.fillRect(future0, future1, futureW, futureH);
    this.ctx.closePath();

    // add title and key
    this.ctx.font = FONT_GRAPH_TITLE;
    this.ctx.fillStyle = COLOR_GRAPH_TITLE;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    this.ctx.fillText("Spending", 15, 10);

    this.ctx.textBaseline = "middle";
    this.ctx.font = FONT_GRAPH_KEY;

    this.categories.forEach(category => {
      this.ctx.fillStyle = COLOR_DARK;
      this.ctx.fillText(capitalise(category.name), GRAPH_KEY_OFFSET_X + category.key, 40);

      this.ctx.fillStyle = rgb(this.textColors[category.name]);
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
    this.data.forEach((list, key) => {
      const posX = Math.round(this.pixX(key));
      let sum = 0;
      let bottomY = this.pixY(this.minY);
      list.forEach((item, categoryKey) => {
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
  getData(data) {
    let maxY = 0;
    this.data = data.balance.map((balanceActual, key) => {
      const items = this.categories.map(category => Math.max(0, data[category.name][key] / 100));
      maxY = Math.max(maxY, arraySum(items));
      return items;
    });

    this.setRange([this.minX, this.maxX, this.minY, maxY]);
  }
  update(data) {
    this.getData(data);
    this.draw();
  }
}

