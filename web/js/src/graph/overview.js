/**
 * Overview page graphs
 */

import { getTickSize, LineGraph } from 'graph/graph';

import {
  COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED,
  COLOR_GRAPH_TITLE, COLOR_DARK, COLOR_LIGHT_GREY, COLOR_LIGHT,
  COLOR_PROFIT, COLOR_LOSS, COLOR_CATEGORY,
  FONT_GRAPH_TITLE, FONT_GRAPH_KEY_SMALL, FONT_AXIS_LABEL,
  FONT_GRAPH_KEY,
  GRAPH_BALANCE_NUM_TICKS, GRAPH_KEY_OFFSET_X, GRAPH_KEY_OFFSET_Y,
  GRAPH_KEY_SIZE
} from 'const';

import { hundredth, indexPoints, months } from 'misc/misc';
import { rgba, rgb } from 'misc/color';
import { formatCurrency, numberFormat } from 'misc/format';

export class GraphBalance extends LineGraph {
  constructor(options) {
    super(options);

    this.currentYear = options.currentYear;
    this.currentMonth = options.currentMonth;

    this.startYear = options.startYear;
    this.startMonth = options.startMonth;

    this.yearMonths = options.yearMonths;

    this.colors = [COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED];
    this.stroke = true;

    this.getData(options.dataPast, options.dataFuture);
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
  draw() {
    if (!this.supported) {
      return;
    }

    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // draw axes
    this.ctx.strokeStyle = COLOR_LIGHT_GREY;
    this.ctx.lineWidth = 1;

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "center";

    // draw month (X axis) ticks, and vertical lines
    for (let i = 3; i < this.maxX - 1; i += 4) {
      const tickName = months[this.yearMonths[i][1] - 1] + "-"
      + (this.yearMonths[i][0] % 100).toString();

      const tickPosX = Math.floor(this.pixX(i)) + 0.5;
      const tickPosY = Math.floor(this.pixY(0)) + 0.5;

      // draw month tick (X axis)
      this.ctx.fillText(tickName, tickPosX, tickPosY + 2);

      // draw vertical line
      this.ctx.beginPath();
      this.ctx.moveTo(tickPosX, 0);
      this.ctx.lineTo(tickPosX, tickPosY);
      this.ctx.stroke();
    }

    // calculate tick range
    const minorTicks = 5;

    const numTicks = GRAPH_BALANCE_NUM_TICKS * minorTicks;

    const tickSize = getTickSize(this.minY, this.maxY, numTicks);

    const ticksY = [];

    // draw value (Y axis) ticks and horizontal lines
    for (let i = 0; i < numTicks; i++) {
      const tickPos = Math.floor(
        this.pixY(i * tickSize)
      ) + 0.5;

      const major = i % minorTicks === 0;

      // add value (Y axis) tick to array to draw on top of graph
      if (major) {
        ticksY.push([i * tickSize * 100, tickPos]);
      }

      // draw horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(this.padX1, tickPos);
      this.ctx.lineTo(this.width - this.padX2, tickPos);

      this.ctx.strokeStyle = major ? COLOR_LIGHT_GREY : COLOR_LIGHT;
      this.ctx.stroke();
      this.ctx.closePath();
    }

    const lineWidth = this.lineWidth;

    // draw spending anomalies
    this.ctx.lineWidth = this.lineWidth;

    this.dataAnomalies.forEach((anomaly, key) => {
      if (Math.abs(anomaly) > 0) {
        const above = anomaly > 0;
        const color = above ? COLOR_PROFIT : COLOR_LOSS;

        const px = Math.round(this.pixX(key));

        const py1 = this.pixY(this.dataPredicted[key][1] + anomaly);
        const py2 = this.pixY(this.dataPredicted[key][1]);

        if (Math.abs(py1 - py2) >= 1) {
          this.ctx.beginPath();

          this.ctx.moveTo(px, py1);
          this.ctx.lineTo(px, py2);

          this.ctx.strokeStyle = color;
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
    });

    // plot predicted data
    this.lineWidth = 1;
    this.drawCubicLine(
      this.dataPredicted.slice(0, this.futureKey + 1), this.colors.slice(1, 2)
    );

    // plot past + future predicted data
    this.lineWidth = lineWidth;
    this.drawCubicLine(this.dataMain, this.colors);

    // draw Y axis
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "left";

    for (const tick of ticksY) {
      const tickName = formatCurrency(tick[0], { raw: true, noZeroes: true });

      this.ctx.fillText(tickName, this.padX1, tick[1]);
    }

    this.drawKey();
  }
  getData(actual, predicted) {
    const dataActual    = actual.map(hundredth);
    const dataPredicted = predicted.map(hundredth);

    this.futureKey = 12 * (this.currentYear - this.startYear) +
      this.currentMonth - this.startMonth + 1;

    const maxValue = Math.max(
      Math.max.apply(null, dataActual),
      Math.max.apply(null, dataPredicted)
    );

    this.setRange([
      this.minX, this.maxX, this.minY, maxValue
    ]);

    // combine the actual data with the future predicted data
    const dataMain = dataActual.map((item, key) => {
      return key < this.futureKey ? item : dataPredicted[key];
    });

    this.dataMain = dataMain.map(indexPoints);

    // for changing the colour
    this.transition = [this.futureKey - 1];

    this.dataPredicted = dataPredicted.map(indexPoints);

    this.dataAnomalies = dataMain.map((item, key) => {
      return item - dataPredicted[key];
    });
  }
  update(costBalance, costPredicted) {
    this.getData(costBalance, costPredicted);

    this.draw();
  }
}

export class GraphSpend extends LineGraph {
  constructor(options) {
    super(options);

    this.tension = 1;

    this.yearMonths = options.yearMonths;

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
        line, this.colors[this.categories[this.categories.length - 1 - i]]
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

