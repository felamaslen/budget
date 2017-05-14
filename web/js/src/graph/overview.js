/**
 * Overview page graphs
 */

import $ from "../../lib/jquery.min";

import { getTickSize, LineGraph } from "graph/graph";

import {
  COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED,
  COLOR_GRAPH_TITLE, COLOR_DARK, COLOR_LIGHT_GREY, COLOR_LIGHT, COLOR_CATEGORY,
  FONT_GRAPH_TITLE, FONT_GRAPH_KEY_SMALL, FONT_AXIS_LABEL, FONT_GRAPH_KEY,
  GRAPH_BALANCE_NUM_TICKS, GRAPH_KEY_OFFSET_X, GRAPH_KEY_OFFSET_Y,
  GRAPH_KEY_SIZE
} from "const";

import { hundredth, indexPoints, months } from "misc/misc";
import { rgba, rgb } from "misc/color";
import { formatCurrency, numberFormat } from "misc/format";

export class GraphBalance extends LineGraph {
  constructor(options) {
    super(options);

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
  constructor(options) {
    super(options);
    this.tension = 1; // for graph interpolator
    this.yearMonths = options.yearMonths;
    this.currentYearMonthKey = (12 * options.currentYear + options.currentMonth) -
      (12 * this.yearMonths[0][0] + this.yearMonths[0][1]);
    this.categories = ["bills", "food", "general", "holiday", "social"];
    this.textColors = COLOR_CATEGORY;
    this.colors = {};
    for (const category of this.categories) {
      this.colors[category] = [rgba(this.textColors[category], 0.75)];
    }
    this.fill = true;

    this.getData(options.data);
  }
  draw() {
    if (!this.supported) {
      return;
    }

    // calculate tick range
    const tickSize = getTickSize(this.minY, this.maxY, 5);

    this.ctx.clearRect(0, 0, this.width, this.height);
    // draw X axis ticks
    this.ctx.strokeStyle = COLOR_LIGHT_GREY;
    this.ctx.lineWidth = 1;

    const ticksY = [];
    for (let i = 3, j = 0; i < this.maxX - 1; i += 2, j++) {
      const tickPos = Math.floor(this.pixX(i)) + 0.5;

      ticksY.push([i, tickPos]);

      this.ctx.beginPath();
      this.ctx.moveTo(tickPos, this.padY1);
      this.ctx.lineTo(tickPos, this.height - this.padY2 + 10 * (1 - j % 2));
      this.ctx.stroke();
    }

    // draw Y axis ticks
    const ticksX = [];
    for (let i = 0; i < 3; i++) {
      const tickPos = Math.floor(this.pixY(tickSize * i)) + 0.5;

      ticksX.push(tickPos);

      this.ctx.beginPath();
      this.ctx.moveTo(this.padX1, tickPos);
      this.ctx.lineTo(this.width - this.padX2, tickPos);
      this.ctx.stroke();
    }

    // plot data
    this.data.forEach((line, i) => {
      this.drawCubicLine(
        line, [this.colors[this.categories[this.categories.length - 1 - i]]]
      );
    });

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = COLOR_GRAPH_TITLE;

    ticksX.forEach((tickPos, i) => {
      if (i > 0) {
        const tickName = "£" + numberFormat(tickSize * i);

        this.ctx.fillText(tickName, 0, tickPos);
      }
    });

    // draw month ticks
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "center";

    ticksY.forEach((tick, j) => {
      const tickName = months[this.yearMonths[tick[0]][1] - 1] + "-" +
        (this.yearMonths[tick[0]][0] % 100).toString();

      this.ctx.fillText(
        tickName, tick[1], this.height - this.padY2 + 3 + 10.5 * (2 - j % 2)
      );
    });

    // draw rectangle over area which is predicted based on the past
    const future0 = this.pixX(this.currentYearMonthKey);
    const future1 = this.pixY(this.maxY);
    const futureW = this.pixX(this.maxX) - future0;
    const futureH = this.pixY(0) - future1;
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

    const fontColor = COLOR_DARK;

    this.ctx.fillStyle = fontColor;
    this.ctx.fillText("Bills", 20, 40);
    this.ctx.fillText("Food", 72, 40);
    this.ctx.fillText("General", 130, 40);
    this.ctx.fillText("Holiday", 200, 40);
    this.ctx.fillText("Social", 265, 40);

    this.ctx.fillStyle = rgb(this.textColors.bills);
    this.ctx.fillRect(
      GRAPH_KEY_OFFSET_X, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE
    );

    this.ctx.fillStyle = rgb(this.textColors.food);
    this.ctx.fillRect(57, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE);

    this.ctx.fillStyle = rgb(this.textColors.general);
    this.ctx.fillRect(115, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE);

    this.ctx.fillStyle = rgb(this.textColors.holiday);
    this.ctx.fillRect(185, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE);

    this.ctx.fillStyle = rgb(this.textColors.social);
    this.ctx.fillRect(250, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE);
  }
  getData(data) {
    const sum = [];

    let maxY = 0;

    this.data = this.categories.map(category => {
      const thisData = data[category].map((item, key) => {
        if (!sum[key]) {
          sum[key] = 0;
        }
        sum[key] += item > 0 ? hundredth(item) : 0;

        return sum[key];
      });

      maxY = Math.max(maxY, Math.max.apply(null, thisData));

      return thisData.map(indexPoints);
    }).reverse();

    this.setRange([this.minX, this.maxX, this.minY, maxY]);

    // const chartCategories = this.categories.concat().reverse();
  }
  update(data) {
    this.getData(data);

    this.draw();
  }
}

