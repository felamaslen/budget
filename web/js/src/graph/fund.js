/**
 * Fund graphs
 */

import $ from "../../lib/jquery.min";

import {
  COLOR_DARK, COLOR_LIGHT_GREY,
  COLOR_PROFIT, COLOR_LOSS, COLOR_PROFIT_LIGHT, COLOR_LOSS_LIGHT,
  COLOR_GRAPH_FUND_LINE, COLOR_GRAPH_TITLE,
  GRAPH_FUND_ITEM_LINE_WIDTH, GRAPH_FUND_ITEM_TENSION,
  GRAPH_FUND_HISTORY_TENSION, GRAPH_FUND_HISTORY_POINT_RADIUS,
  GRAPH_FUND_HISTORY_NUM_TICKS, GRAPH_FUND_HISTORY_LINE_WIDTH,
  GRAPH_FUND_HISTORY_WIDTH_NARROW, GRAPH_FUND_HISTORY_WIDTH,
  GRAPH_FUND_HISTORY_MODE_PERCENT, GRAPH_FUND_HISTORY_MODE_ABSOLUTE,
  GRAPH_FUND_HISTORY_MODE_PRICE,
  GRAPH_FUND_HISTORY_PERIODS, GRAPH_FUND_HISTORY_DEFAULT_PERIOD,
  MSG_TIME_ERROR,
  FONT_AXIS_LABEL, FONT_GRAPH_TITLE
} from "const";

import { arraySum } from "misc/misc";
import { colorKey } from "misc/color";
import { formatAge, formatCurrency, TransactionsList } from "misc/format";
import MediaQueryHandler from "misc/media_query";
import { todayDate } from "misc/date";

import { getTickSize, LineGraph } from "graph/graph";

const windowSize = new MediaQueryHandler();

export const getHistoryFunds = funds => {
  return funds.items.map((item, key) => {
    return { item, transactions: new TransactionsList(funds.transactions[key]) };
  });
};

export class GraphFundItem extends LineGraph {
  constructor(options, api) {
    const minX = Math.min.apply(null, options.data.map(item => item[0]));
    const maxX = Math.max.apply(null, options.data.map(item => item[0]));
    const minY = Math.min.apply(null, options.data.map(item => item[1]));
    const maxY = Math.max.apply(null, options.data.map(item => item[1]));

    options.range = [minX, maxX, minY, maxY];

    super(options, api);

    this.dataMinY = minY;
    this.dataMaxY = maxY;

    this.lineWidth = GRAPH_FUND_ITEM_LINE_WIDTH;
    this.tension = GRAPH_FUND_ITEM_TENSION;

    this.data = options.data;

    this.defaultWidth = this.width;
    this.defaultHeight = this.height;

    this.popout = false;
    this.$canvas.on("click", () => this.togglePopout());
  }
  togglePopout() {
    // make the graph larger
    this.popout = !this.popout;

    this.$canvas.toggleClass("popout", this.popout);

    this.width = this.popout ? this.$canvas.width() : this.defaultWidth;
    this.height = this.popout ? this.$canvas.height() : this.defaultHeight;

    this.$canvas[0].width = this.width;
    this.$canvas[0].height = this.height;

    const minY = this.popout ? Math.floor(this.dataMinY) : this.dataMinY;
    const maxY = this.popout ? Math.ceil(this.dataMaxY) : this.dataMaxY;

    this.setRange([this.minX, this.maxX, minY, maxY]);

    this.draw();
  }

  draw() {
    if (!this.supported) {
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    // draw axes
    this.ctx.lineWidth = 1;
    if (this.popout) {
      this.ctx.fillStyle = COLOR_DARK;
      this.ctx.textBaseline = "middle";
      this.ctx.textAlign = "left";
      this.ctx.font = FONT_AXIS_LABEL;

      const range = this.maxY - this.minY;
      const inc = this.popout
        ? Math.round(
          Math.max(20, this.height / range) / this.height * range / 2
        ) * 2
        : 1;

      for (let i = Math.floor(this.minY / inc) * inc; i <= this.maxY; i += inc) {
        const tickPos = Math.floor(this.pixY(i)) + 0.5;
        const tickName = i.toFixed(1) + "%";
        this.ctx.fillText(tickName, this.padX1, tickPos);
      }
    }

    // plot data
    this.drawCubicLine(this.data, value => value < 0 ? COLOR_LOSS : COLOR_PROFIT);
  }
}

const getFundUnits = fund => fund.transactions.list.map(item => {
  return [item.date.timestamp(), item.units, item.cost];
});

export class GraphFundHistory extends LineGraph {
  constructor(options, api, state) {
    super(options, api, state);

    this.raw = options.data;
    this.startTime = options.startTime;

    this.tension = GRAPH_FUND_HISTORY_TENSION;
    this.funds = options.funds;
    this.fundLines = this.funds.map((fund, fundKey) => {
      return this.raw[this.raw.length - 1][1][fundKey] > 0;
    });
    this.fundLines.unshift(true); // overall line
    this.hlPoint = [-1, -1];

    this.setRangeValues();

    this.period = GRAPH_FUND_HISTORY_DEFAULT_PERIOD;
    this.updatingPeriod = false;

    this.toggleMode(GRAPH_FUND_HISTORY_MODE_PERCENT, true);

    this.$label = $("<div></div>").addClass("label");
    this.$gCont.append(this.$fundSidebar);
    this.buildFundSidebar();
    this.$gCont.append(this.$label);

    this.$gCont[0].addEventListener("mousewheel", evt => {
      this.zoomX(-evt.wheelDelta / Math.abs(evt.wheelDelta));
      evt.preventDefault();
    });

    this.$gCont.on("mousemove", evt => {
      const offset = this.$gCont.offset();
      this.mouseOver(evt.pageX - offset.left, evt.pageY - offset.top);
    })
    .on("mouseout", () => {
      this.hlPoint = [-1, -1];
      this.draw();
    })
    .on("click", () => {
      this.toggleMode(this.mode + 1);
    });

    windowSize.narrow(() => {
      this.resize(GRAPH_FUND_HISTORY_WIDTH_NARROW);
    })
    .wide(() => {
      this.resize(GRAPH_FUND_HISTORY_WIDTH);
    })
    .trigger();
  }
  setRangeValues() {
    const minX = 0;
    const maxX = new Date().getTime() / 1000 - this.startTime;

    const minY = this.raw.reduce((last, item) => {
      return Math.min(last, Math.min.apply(null, item[1]));
    }, Infinity);

    const maxY = this.raw.reduce((last, item) => {
      return Math.max(last, Math.max.apply(null, item[1]));
    }, -Infinity);

    this.originalRange = [minX, maxX, minY, maxY]; // for use in zooming
    this.setRange([minX, maxX, minY, maxY]);
  }
  updatePeriod() {
    if (this.updatingPeriod) {
      return;
    }
    this.updatingPeriod = true;
    this.api.request(
      "data/fund_history", "GET", {
        period: this.period
      },
      res => this.onPeriodUpdate(res),
      () => this.onPeriodError(),
      () => this.onPeriodRequestComplete()
    );
  }
  onPeriodUpdate(res) {
    this.raw = res.data.history;
    const fundsChanged = res.data.funds.items.reduce((a, b, key) => {
      return a + (this.funds.length > key + 1 && b === this.funds[key + 1].item ? 0 : 1);
    }, 0) > 0;
    if (fundsChanged) {
      this.funds = getHistoryFunds(res.data.funds);
      this.fundLines = this.funds.map(() => false);
      this.fundLines.unshift(true); // overall line
      this.addFundsToSidebar();
    }
    this.startTime = res.data.startTime;
    this.setRangeValues();
    this.toggleMode(this.mode);
  }
  onPeriodError() {
    this.state.error.newMessage("Error fetching data! (Server error)", 2, MSG_TIME_ERROR);
  }
  onPeriodRequestComplete() {
    this.$periodSelector.attr("disabled", false);
    this.updatingPeriod = false;
  }
  buildFundSidebar() {
    this.$fundSidebar = $("<ul></ul>").addClass("fund-sidebar").addClass("noselect");

    this.$periodSelector = $("<select></select>");
    const periods = [];
    GRAPH_FUND_HISTORY_PERIODS.forEach(period => {
      period[1].forEach(count => {
        periods.push([
          `${period[0]}${count}`,
          `${count} ${period[0]}` + (count > 1 ? "s" : "")
        ]);
      });
    });
    periods.forEach(item => {
      const $option = $(`<option value="${item[0]}">${item[1]}</option>`);
      if (item[0] === this.period) {
        $option.attr("selected", true);
      }
      this.$periodSelector.append($option);
    });
    this.$periodSelector.on("change", evt => {
      this.period = evt.target.value;
      $(evt.target).attr("disabled", true);
      this.updatePeriod();
    });
    this.$fundSidebar.append($("<li></li>").append(this.$periodSelector));

    this.addFundsToSidebar();
    this.$gCont.append(this.$fundSidebar);
  }
  addFundsToSidebar() {
    this.$fundSidebar.children(":gt(0)").remove();
    const items = this.funds;
    items.unshift({ item: "Overall" });
    this.funds.forEach((fund, index) => {
      const color = colorKey(index);
      const $item = $("<li></li>")
      .append($("<span></span>")
              .addClass("checkbox").css("border-color", color))
      .append($("<span></span>").addClass("fund").text(fund.item))
      .toggleClass("enabled", this.fundLines[index]);
      $item.on("click", evt => {
        const numActive = this.fundLines.reduce((a, b) => a + (b ? 1 : 0), 0);
        const status = numActive > 1 ? !$item.hasClass("enabled") : true;
        $item.toggleClass("enabled", status);
        this.fundLines[index] = status;
        this.toggleMode(this.mode);
        evt.stopPropagation();
      });
      this.$fundSidebar.append($item);
    });
  }
  resize(size) {
    this.width = size;
    this.$canvas[0].width = size;

    this.draw();
  }
  getLinesCostValue(index, callback) {
    const units = this.funds.filter(item => item.item !== "Overall").map((fund, fundKey) => {
      return (index === -1 || index === fundKey) && fund.transactions ? getFundUnits(fund) : null;
    });
    return this.raw.map(item => {
      const prices = item[1].map((price, fundKey) => {
        return index === -1 || index === fundKey ? price : null;
      });

      const currentTransactions = prices.map((price, fundKey) => {
        return price ? units[fundKey].filter(thisUnits => thisUnits[0] <= item[0] + this.startTime) : null;
      });

      const currentUnits = currentTransactions.map(transactions => {
        return transactions ? arraySum(transactions.map(transaction => transaction[1])) : 0;
      });

      const currentCost = arraySum(currentTransactions.map(transactions => {
        return transactions ? arraySum(transactions.map(transaction => transaction[2])) : 0;
      }));

      const currentValue = arraySum(prices.map((price, fundKey) => price * currentUnits[fundKey]));

      return callback(item, currentCost, currentValue);
    }).filter(item => item !== null);
  }
  getLinesPercent(index) {
    return this.getLinesCostValue(index, (item, cost, value) => {
      return cost > 0 ? [item[0], 100 * (value - cost) / cost] : null;
    });
  }
  getMainPercent() {
    const line = this.getLinesPercent(-1);
    return [COLOR_GRAPH_FUND_LINE, line];
  }
  getLinesAbsolute(index) {
    return this.getLinesCostValue(index, (item, cost, value) => {
      return value > 0 ? [item[0], value] : null;
    });
  }
  getMainAbsolute() {
    const line = this.getLinesAbsolute(-1);
    return [COLOR_GRAPH_FUND_LINE, line];
  }
  getLinesPrice(index) {
    return this.raw.map(item => {
      if (!item[1][index]) {
        return null;
      }
      return [item[0], item[1][index]];
    }).filter(item => item !== null);
  }
  getLines(filter, mainLine) {
    const lines = [];
    this.fundLines.slice(1).forEach((status, index) => {
      if (status) {
        const color = colorKey(index + 1);
        const line = filter(index);
        lines.push([color, line]);
      }
    });

    if (this.fundLines[0] && !!mainLine) {
      // main line
      lines.push(mainLine());
    }
    return lines;
  }

  processData() {
    if (!this.raw.length) {
      return null;
    }

    let lines;

    switch (this.mode) {
    case GRAPH_FUND_HISTORY_MODE_PRICE:
      lines = this.getLines(
        index => this.getLinesPrice(index, true)
      );
      break;
    case GRAPH_FUND_HISTORY_MODE_ABSOLUTE:
      lines = this.getLines(
        index => this.getLinesAbsolute(index),
        () => this.getMainAbsolute()
      );
      break;
    case GRAPH_FUND_HISTORY_MODE_PERCENT:
    default:
      lines = this.getLines(
        index => this.getLinesPercent(index),
        () => this.getMainPercent()
      );
      break;
    }

    return lines;
  }
  toggleMode(mode, noDraw) {
    this.mode = mode % 3;
    this.data = this.processData();
    if (!this.data) {
      return;
    }
    this.dataVisible = this.filterDataVisible();
    if (this.hlPoint[0] > this.data.length - 1) {
      this.hlPoint[0] = this.data.length - 1;
    }
    this.calculateYRange();
    if (!noDraw) {
      this.draw();
    }
  }
  filterDataVisible() {
    return this.data.map(line => {
      return line.map((item, key) => {
        if (key === 1) {
          return item.filter((point, pointKey) => this.itemInRange(item, pointKey));
        }
        return item;
      });
    });
  }
  itemInRange(item, key) {
    const nextVisible = item[Math.min(item.length - 1, key + 1)][0] >= this.minX;
    const prevVisible = item[Math.max(0, key - 1)][0] <= this.maxX;

    return nextVisible && prevVisible;
  }
  zoomX(direction) {
    if (this.hlPoint[0] === -1 || this.hlPoint[1] === -1 ||
        (direction < 0 && this.dataVisible[0][1].length < 4)) {
      return;
    }

    const point = this.data[this.hlPoint[0]][1][this.hlPoint[1]][0];
    super.zoomX(direction, point);
    this.dataVisible = this.filterDataVisible();
    this.calculateYRange();
    this.draw();
  }
  calculateYRange() {
    // calculate new Y range based on truncating the data (zooming)
    let minY = Infinity;
    let maxY = -Infinity;
    this.dataVisible.forEach(line => {
      minY = line[1].reduce((last, current) => Math.min(current[1], last), minY);
      maxY = line[1].reduce((last, current) => Math.max(current[1], last), maxY);
    });

    if (minY === maxY) {
      minY -= 0.5;
      maxY += 0.5;
    }

    if (this.mode === GRAPH_FUND_HISTORY_MODE_PERCENT && minY === 0) {
      minY = -maxY * 0.2;
    }

    // return the tick size for the new range
    this.tickSizeY = getTickSize(minY, maxY, GRAPH_FUND_HISTORY_NUM_TICKS);
    if (!isNaN(this.tickSizeY)) {
      this.setRange([
        this.minX, this.maxX,
        this.tickSizeY * Math.floor(minY / this.tickSizeY),
        this.tickSizeY * Math.ceil(maxY / this.tickSizeY)
      ]);
    }
  }

  formatValue(value) {
    if (this.mode === GRAPH_FUND_HISTORY_MODE_PERCENT) {
      return value.toFixed(2) + "%";
    }
    if (this.mode === GRAPH_FUND_HISTORY_MODE_ABSOLUTE) {
      return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
    }
    return Math.round(100 * value) / 100;
  }

  handleMouseover() {
    // highlight point on mouseover
    if (
      this.hlPoint[0] > -1 &&
      this.data[this.hlPoint[0]][1][this.hlPoint[1]] &&
      this.data[this.hlPoint[0]][1][this.hlPoint[1]][0] >= this.minX
    ) {
      const point = this.data[this.hlPoint[0]][1][this.hlPoint[1]];

      const hlX = this.pixX(point[0]);
      const hlY = this.pixY(point[1]);

      const time = point[0] + this.startTime;
      const age = todayDate().getTime() - time * 1000;
      const ageText = formatAge(age / 1000);

      const align = hlX < this.width / 2 ? -1 : 1;
      const label = ageText + ": " + this.formatValue(point[1]);

      const left = align > 0
        ? "initial" : hlX + GRAPH_FUND_HISTORY_POINT_RADIUS;
      const right = align > 0
        ? this.width - hlX + GRAPH_FUND_HISTORY_POINT_RADIUS : "initial";
      const top = hlY + GRAPH_FUND_HISTORY_POINT_RADIUS;

      this.$label.css({
        textAlign: align > 0 ? "right" : "left",
        left,
        right,
        top
      })
      .html(label)
      .show();

      // highlight the point with a circle
      this.ctx.beginPath();
      this.ctx.moveTo(hlX, hlY);
      this.ctx.arc(
        hlX, hlY, GRAPH_FUND_HISTORY_POINT_RADIUS, 0, Math.PI * 2, false
      );

      this.ctx.fillStyle = this.hlPoint[2];
      this.ctx.fill();
      this.ctx.closePath();
    }
    else {
      this.$label.hide();
    }
  }
  drawData() {
    const mainIndex = this.data.length - 1;

    // plot past data
    if (this.dataVisible) {
      this.dataVisible.forEach((line, index) => {
        const mainLine = index === mainIndex && this.fundLines[0] &&
          this.mode !== GRAPH_FUND_HISTORY_MODE_PRICE;

        this.lineWidth = mainLine ? GRAPH_FUND_HISTORY_LINE_WIDTH : 1;
        if (this.mode === GRAPH_FUND_HISTORY_MODE_PERCENT) {
          this.drawCubicLine(line[1], [line[0]]);
        }
        else {
          this.drawLine(line[1], line[0]);
        }
      });
    }
  }
  drawModeIndicator() {
    // draw current mode at top right corner
    const modes = ["ROI", "Value", "Price"];
    const modeText = `Mode: ${modes[this.mode]}`;
    this.ctx.textBaseline = "top";
    this.ctx.font = FONT_GRAPH_TITLE;
    this.ctx.fillStyle = COLOR_DARK;
    this.ctx.fillText(modeText, this.width - 5, 5);
  }
  drawAxes() {
    const axisTextColor = COLOR_DARK;
    const timeTicks = this.getTimeScale(this.startTime);

    this.ctx.lineWidth = 1;

    // draw profit / loss backgrounds
    if (this.mode === GRAPH_FUND_HISTORY_MODE_PERCENT) {
      const zero = this.pixY(Math.min(Math.max(0, this.minY), this.maxY));
      if (this.maxY > 0) {
        this.ctx.fillStyle = COLOR_PROFIT_LIGHT;
        this.ctx.fillRect(this.padX1, this.padY1,
                          this.width - this.padX1 - this.padX2, zero - this.padY1);
      }
      if (this.minY < 0) {
        this.ctx.fillStyle = COLOR_LOSS_LIGHT;
        this.ctx.fillRect(this.padX1, zero,
                          this.width - this.padX1 - this.padX2, this.height - this.padY2 - zero);
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
      this.ctx.moveTo(this.padX1, tick.pos);
      this.ctx.lineTo(this.width - this.padX2, tick.pos);
      this.ctx.stroke();
      this.ctx.closePath();
    });

    // draw time (X axis) ticks
    const y0 = this.pixY(this.minY);

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = axisTextColor;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom";

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
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "right";
    this.ctx.font = FONT_AXIS_LABEL;

    ticksY.forEach(tick => {
      const tickName = this.formatValue(tick.value, true, true);
      this.ctx.fillText(tickName, this.width - this.padX2, tick.pos);
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
    this.handleMouseover();
    this.drawModeIndicator();
  }
  mouseOver(x, y) {
    if (!this.data) {
      return;
    }

    const xv = this.valX(x);
    const yv = this.valY(y);

    // find point nearest to mouse
    let lastProximity = Infinity;
    const hlPoint = this.data.reduce((prevPoint, thisLine, lineIndex) => {
      return thisLine[1].reduce((prevLinePoint, thisLinePoint, pointIndex) => {
        if (thisLinePoint[0] < this.minX || thisLinePoint[1] > this.maxX) {
          return prevLinePoint;
        }

        const thisProximity = Math.sqrt(Math.pow(xv - thisLinePoint[0], 2) +
                                        Math.pow(yv - thisLinePoint[1], 2));

        if (thisProximity < lastProximity) {
          lastProximity = thisProximity;
          return [lineIndex, pointIndex, thisLine[0]];
        }

        return prevLinePoint;
      }, prevPoint);
    }, [-1, -1]);

    if (hlPoint[0] !== this.hlPoint[0] || hlPoint[1] !== this.hlPoint[1]) {
      this.hlPoint = hlPoint;
      this.draw();
    }
  }
}

