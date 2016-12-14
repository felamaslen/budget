/**
 * Fund graphs
 */

import $ from "lib/jquery.min";

import {
  MSG_TIME_ERROR,
  COLOR_GRAPH_FUND_ITEM, COLOR_GRAPH_FUND_POINT,
  COLOR_DARK, COLOR_LIGHT, COLOR_LIGHT_GREY,
  COLOR_PROFIT_LIGHT, COLOR_LOSS_LIGHT,
  COLOR_GRAPH_FUND_LINE,
  GRAPH_FUND_ITEM_LINE_WIDTH, GRAPH_FUND_ITEM_TENSION,
  GRAPH_FUND_HISTORY_TENSION, GRAPH_FUND_HISTORY_POINT_RADIUS,
  GRAPH_FUND_HISTORY_NUM_TICKS, GRAPH_FUND_HISTORY_LINE_WIDTH,
  GRAPH_FUND_HISTORY_WIDTH_NARROW, GRAPH_FUND_HISTORY_WIDTH,
  STOCKS_REFRESH_INTERVAL, DO_STOCKS_LIST,
  FONT_AXIS_LABEL
} from "const";

import { formatAge } from "misc/format";
import MediaQueryHandler from "misc/media_query";
import { todayDate } from "misc/date";

import { getTickSize, LineGraph } from "graph/graph";
import { GoogleFinanceAPI } from "api/api";

const windowSize = new MediaQueryHandler();
const finance = new GoogleFinanceAPI();

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

    this.colors = [COLOR_GRAPH_FUND_ITEM];
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

    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // draw axes
    this.ctx.lineWidth = 1;

    if (this.popout || (this.maxY - this.minY) < this.height / 2) {
      this.ctx.fillStyle = COLOR_DARK;
      this.ctx.textBaseline = "middle";
      this.ctx.textAlign = "left";
      this.ctx.font = FONT_AXIS_LABEL;

      const tickPad = this.popout ? 40 : 0;

      const range = this.maxY - this.minY;
      const inc = this.popout
        ? Math.round(
          Math.max(20, this.height / range) / this.height * range / 2
        ) * 2
        : 1;

      for (let i = Math.floor(this.minY / inc) * inc; i <= this.maxY; i += inc) {
        const tickPos = Math.floor(this.pixY(i)) + 0.5;

        if (this.popout) {
          const tickName = i.toFixed(1) + "%";
          this.ctx.fillText(tickName, this.padX1, tickPos);
        }

        this.ctx.beginPath();
        this.ctx.moveTo(this.padX1 + tickPad, tickPos);
        this.ctx.lineTo(this.width - this.padX2, tickPos);
        this.ctx.closePath();
        this.ctx.strokeStyle = i < 0 ? COLOR_LOSS_LIGHT : COLOR_PROFIT_LIGHT;
        this.ctx.stroke();
      }
    }

    // plot data
    this.drawCubicLine(this.data, this.colors);
  }
}

export class GraphFundHistory extends LineGraph {
  constructor(options, api, state) {
    super(options, api, state);

    this.$list = options.$list;

    this.tension    = GRAPH_FUND_HISTORY_TENSION;
    this.raw        = options.data;
    this.startTime  = options.startTime;
    this.dataOffset = 0;
    this.hlPoint    = -1;

    this.togglePercent(true, true);

    this.colorMajor = COLOR_GRAPH_FUND_LINE;

    this.$label = $("<div></div>").addClass("label");
    this.$gCont.append(this.$label);

    this.$gCont[0].addEventListener("mousewheel", evt => {
      if (evt.wheelDelta > 0) {
        this.increaseDetail();
      }
      else {
        this.decreaseDetail();
      }

      evt.preventDefault();
    });

    this.$gCont.on("mousemove", evt => {
      this.mouseOver(evt.pageX - this.$gCont.offset().left);
    })
    .on("mouseout", () => {
      this.hlPoint = -1;
      this.draw();
    })
    .on("click", () => {
      this.togglePercent(!this.percent);
    });

    // build stock rendering thingy
    if (DO_STOCKS_LIST) {
      this.buildStockViewer();
    }

    windowSize.narrow(() => {
      this.resize(GRAPH_FUND_HISTORY_WIDTH_NARROW);
    })
    .wide(() => {
      this.resize(GRAPH_FUND_HISTORY_WIDTH);
    })
    .trigger();
  }

  processData() {
    if (!this.raw.length) {
      return null;
    }

    const mainLine = this.raw.map(item => {
      return [item[0], item[2]];
    });

    return [mainLine];
  }

  resize(size) {
    this.width = size;
    this.$canvas[0].width = size;

    this.draw();
  }

  buildStockViewer() {
    this.stocksRefreshInterval = STOCKS_REFRESH_INTERVAL;
    this.hlTime = STOCKS_REFRESH_INTERVAL - 1000;

    this.stocksListLoading = false;

    this.stockPricesLoading = false;

    this.stocks = {};

    this.$stocksListOuter = $("<div></div>")
    .addClass("stocks-list");

    this.$stocksList = $("<ul></ul>")
    .addClass("stocks-list-ul");

    this.$sidebar = $("<div></div>")
    .addClass("stock-sidebar");

    this.$overallStockChange  = $("<span></span>")
    .addClass("change");
    this.$stocksListOverall   = $("<span></span>")
    .addClass("stocks-list-overall")
    .append($("<span></span>").addClass("price").append(this.$overallStockChange));

    this.$sidebar.append(this.$stocksListOverall);

    this.$stocksListOuter.append(this.$sidebar);
    this.$stocksListOuter.append(this.$stocksList);
    this.$list.append(this.$stocksListOuter);

    this.loadStocksList();
  }
  loadStocksList() {
    if (!DO_STOCKS_LIST || this.stocksListLoading) {
      return;
    }
    this.stocksListLoading = true;

    this.api.request(
      "data/stocks", "GET", null,
      res => this.onStocksListLoaded(res),
      () => this.onStocksListError(),
      () => this.onStocksListRequestComplete()
    );
  }
  onStocksListLoaded(res) {
    this.stocks = res.data.stocks.map(stock => {
      return {
        symbol:     stock[0],
        name:       stock[1],
        weight:     stock[2],
        price:      0,
        change:     0,
        changeText: "",
        $elem:      null,
        active:     false
      };
    });

    this.stocksTotalWeight = res.data.total;
    this.stocksWeightedChange = null;

    this.stockSymbols = this.stocks.map(stock => stock.symbol);

    this.$stocksList.empty();

    this.loadStockPrices();
  }
  onStocksListError() {
    errorMessages.newMessage("Error loading stocks list!", 2, MSG_TIME_ERROR);
  }
  onStocksListRequestComplete() {
    this.stocksListLoading = false;
  }
  loadStockPrices() {
    if (this.stockPricesLoading || this.state.pageActive !== "funds") {
      return;
    }

    this.stockPricesLoading = true;

    finance.get(
      this.stockSymbols,
      res => this.onStockPricesLoaded(res),
      () => this.onStockPricesFail(),
      () => this.onStockPricesRequestComplete()
    );
  }

  numDp(stockChange, width) {
    width = width || 2;
    return stockChange === 0 ? width : Math.max(
        0, width - Math.max(
          0, Math.floor(Math.log(Math.abs(stockChange)) / Math.LN10)
        )
      );
  }

  onStockPricesLoaded(res) {
    let badStocks = 0;

    let weightedChange = 0;

    for (const stock of res) {
      const symbol  = stock.e + ":" + stock.t;
      const index   = this.stockSymbols.indexOf(symbol);

      if (index < 0) {
        badStocks++;
      }
      else {
        const price = parseFloat(stock.l_fix, 10);

        // change as a percentage
        const change = parseFloat(stock.c_fix, 10) / price * 100;

        // highlight
        let hl = false;

        if (this.stocks[index].price !== price) {
          hl = this.stocks[index].price > price ? "hl-down" : "hl-up";
        }

        this.stocks[index].hl     = hl;     // highlight
        this.stocks[index].price  = price;
        this.stocks[index].change = change;

        const numDp = this.numDp(change);

        this.stocks[index].changeText = (change >= 0 ? "+" : "") +
          change.toFixed(numDp);

        weightedChange += this.stocks[index].weight * change;
      }
    }

    weightedChange /= this.stocksTotalWeight;

    this.updateStocksOverall(weightedChange);

    if (badStocks > 0) {
      errorMessages.newMessage(
        "Got " + badStocks.toString() + " extra stocks from finance api",
        2, MSG_TIME_ERROR
      );

      return;
    }

    this.updateStockList();

    // refresh the prices in 5 seconds
    if (this.stocksLoadingTimer) {
      window.clearTimeout(this.stocksLoadingTimer);
    }

    this.stocksLoadingTimer = window.setTimeout(() => {
      this.loadStockPrices();
    }, this.stocksRefreshInterval);
  }
  updateStocksOverall(change) {
    const overallChangeText = (change >= 0 ? "+" : "") +
      change.toFixed(this.numDp(change, 4));

    this.$stocksListOverall
    .toggleClass("up", change > 0)
    .toggleClass("down", change < 0);

    this.$overallStockChange
    .text(overallChangeText)
    .toggleClass(
      "hl-up",
      this.stocksWeightedChange !== null && change - this.stocksWeightedChange > 0
    )
    .toggleClass(
      "hl-down",
      this.stocksWeightedChange !== null && change - this.stocksWeightedChange < 0
    );

    this.stocksWeightedChange = change;
  }
  updateStockList() {
    const numCols = 2;
    const numRows = Math.ceil(this.stocks.length / numCols);

    const list = this.stocks.slice(0, numRows * numCols);

    let stocks = [];
    for (let i = 0; i < numRows; i++) {
      stocks = stocks.concat(list.filter((stock, index) => {
        return index % numRows === i;
      }));
    }

    stocks.forEach(stock => {
      if (stock.$elem) {
        // update the item
        stock.$price.text(stock.price.toFixed(2));

        stock.$change.text(stock.changeText);

        if (stock.hl) {
          stock.$priceOuter.addClass(stock.hl);
          stock.hl = false;

          window.setTimeout(() => {
            stock.$priceOuter.removeClass("hl-up").removeClass("hl-down");
          }, this.hlTime);
        }
      }
      else {
        // add the item
        stock.$elem = $("<li></li>").addClass("stock-list-item");

        stock.$elem.attr("title", stock.symbol + " (" + stock.name + ")");

        stock.$label = $("<span></span>").addClass("label");
        stock.$priceOuter = $("<span></span>").addClass("price");

        stock.$label.text(stock.symbol);

        stock.$price = $("<span></span>")
        .addClass("absolute").text(stock.price.toFixed(2));

        stock.$change = $("<span></span>")
        .addClass("change")
        .text(stock.changeText);

        stock.$priceOuter.append(stock.$price);
        stock.$priceOuter.append(stock.$change);

        stock.$elem.append(stock.$label);
        stock.$elem.append(stock.$priceOuter);

        this.$stocksList.append(stock.$elem);
      }

      stock.$elem.toggleClass("up", stock.change > 0);
      stock.$elem.toggleClass("down", stock.change < 0);
    });

    window.setTimeout(() => {
      this.$overallStockChange.removeClass("hl-up").removeClass("hl-down");
    }, this.hlTime);
  }
  onStockPricesFail() {
    errorMessages.newMessage("Error loading stock prices!", 2, MSG_TIME_ERROR);
  }
  onStockPricesRequestComplete() {
    this.stockPricesLoading = false;
  }

  increaseDetail() {
    this.dataOffset = Math.min(this.data[0].length - 3, this.dataOffset + 1);
    this.detailChanged();
  }
  decreaseDetail() {
    this.dataOffset = Math.max(0, this.dataOffset - 1);
    this.detailChanged();
  }
  detailChanged(noDraw) {
    this.calculatePercentages();

    this.calculateZoomedRange();

    if (!noDraw) {
      this.draw();
    }
  }

  togglePercent(status, noDraw) {
    this.percent = status;

    this.dataProc = this.processData();

    if (!this.dataProc) {
      return;
    }

    this.detailChanged(noDraw);
  }
  getTimeScale() {
    // divides the time axis (horizontal) into appropriate chunks
    const range = this.maxX - this.minX;

    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    const times = {
      h: 3600,
      d: 86400,
      w: 86400 * 7,
      M: 86400 * 28,
      y: 86400 * 365
    };

    const divisors = [
      [times.h,     "h", times.h / 2],
      [times.h * 6, "h", times.h],
      [times.d,     "d", times.h * 6],
      [times.w,     "w", times.d],
      [times.M,     "M", times.w],
      [times.y,     "y", times.y / 12, n => monthLength[n] * 86400]
    ];

    // minimum width between major ticks
    const maxMajorTicks = this.width / 64;

    const majorIndex = divisors.findIndex((item, index) => {
      return range / item[0] < maxMajorTicks ||
        index === divisors.length - 1;
    });

    const div = divisors[majorIndex];

    const ticks = [];

    const numMajorTicks = Math.ceil(range / div[0]);
    const numMinorTicks = Math.floor(div[0] / div[2]);

    for (let t = 0; t < numMajorTicks; t++) {
      // X is the start of the current tick block
      const X = Math.round(t * div[0]);

      if (t > 0) {
        const numTickUnits = Math.floor(X / times[div[1]]);

        ticks.push({
          text:   (-numTickUnits).toString() + div[1],
          pix:    Math.round(this.pixX(this.maxX - X)) + 0.5,
          major:  true
        });
      }

      // minor ticks
      let Xm = X;
      for (let n = 0; n < numMinorTicks; n++) {
        // div[3] is a function which generates the minor tick length
        const minorTickLength = div[3] ? div[3](n) : div[2];

        Xm += minorTickLength;

        if (Xm > range) {
          break;
        }

        ticks.push({
          pix:    Math.round(this.pixX(this.maxX - Xm)) + 0.5,
          major:  false
        });
      }
    }

    return ticks;
  }
  calculateZoomedRange() {
    // calculate new Y range based on truncating the data (zooming)
    this.dataZoomed = this.data.map(line => line.slice(this.dataOffset));

    let minY = this.dataZoomed.reduce((last, line) => {
      const lineMin = line.reduce((a, b) => {
        return b[1] < a ? b[1] : a;
      }, Infinity);

      return lineMin < last ? lineMin : last;
    }, Infinity);

    const maxY = this.dataZoomed.reduce((last, line) => {
      const lineMax = line.reduce((a, b) => {
        return b[1] > a ? b[1] : a;
      }, 0);

      return lineMax > last ? lineMax : last;
    }, 0);

    if (this.percent && minY === 0) {
      minY = -maxY * 0.2;
    }

    // return the tick size for the new range
    this.tickSizeY = getTickSize(
      minY, maxY, GRAPH_FUND_HISTORY_NUM_TICKS
    );

    // set the new ranges
    this.setRange([
      this.data[0][this.dataOffset][0],
      new Date().getTime() / 1000 - this.startTime,
      this.tickSizeY * Math.floor(minY / this.tickSizeY),
      this.tickSizeY * Math.ceil(maxY / this.tickSizeY)
    ]);
  }
  calculatePercentages() {
    // turns data from absolute values to percentage returns
    this.data = this.percent ? this.dataProc.map(line => {
      const initial = line[this.dataOffset][1];

      return line.map(item => {
        return [item[0], 100 * (item[1] - initial) / initial];
      });
    }) : this.dataProc;
  }

  formatValue(value) {
    return this.percent
      ? value.toFixed(2) + "%"
      : formatCurrency(value, { raw: true });
  }
  draw() {
    if (!this.supported) {
      return;
    }

    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    const axisColor = COLOR_DARK;
    const axisTextColor = COLOR_LIGHT;

    const timeTicks = this.getTimeScale();

    // calculate tick range
    const ticksY = [];

    // draw value (Y axis) ticks and horizontal lines
    const newNumTicks = Math.floor((this.maxY - this.minY) / this.tickSizeY);

    // draw axes
    this.ctx.strokeStyle = axisColor;
    this.ctx.lineWidth = 1;

    for (let i = 0; i < newNumTicks; i++) {
      const value = this.minY + (i + 1) * this.tickSizeY;

      const tickPos = Math.floor(this.pixY(value)) + 0.5;

      // add value (Y axis) tick to array to draw on top of graph
      ticksY.push([value, tickPos]);

      // draw horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(this.padX1, tickPos);
      this.ctx.lineTo(this.width - this.padX2, tickPos);
      this.ctx.stroke();
    }

    // draw time (X axis) ticks
    const y0 = this.pixY(this.minY);

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = COLOR_LIGHT;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom";

    const tickAngle = -Math.PI / 6;
    const tickSize = 10;

    timeTicks.forEach(tick => {
      const thisTickSize = tickSize * (tick.major ? 1 : 0.5);

      this.ctx.beginPath();
      this.ctx.strokeStyle = tick.major ? COLOR_LIGHT : COLOR_LIGHT_GREY;
      this.ctx.moveTo(tick.pix, y0);
      this.ctx.lineTo(tick.pix, y0 - thisTickSize);
      this.ctx.stroke();
      this.ctx.closePath();

      if (tick.major) {
        this.ctx.save();
        this.ctx.translate(tick.pix, y0 - thisTickSize);
        this.ctx.rotate(tickAngle);
        this.ctx.fillText(tick.text, 0, 0);
        this.ctx.restore();
      }
    });

    // plot past data
    if (this.data) {
      this.lineWidth = GRAPH_FUND_HISTORY_LINE_WIDTH;

      this.dataZoomed.forEach(line => {
        this.drawCubicLine(line, this.colorMajor);
      });
    }

    // draw Y axis
    this.ctx.fillStyle = axisTextColor;
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "right";
    this.ctx.font = FONT_AXIS_LABEL;

    for (const tick of ticksY) {
      const tickName = this.formatValue(tick[0], true, true);

      this.ctx.fillText(tickName, this.width - this.padX2, tick[1]);
    }

    // highlight point on mouseover
    if (
      this.hlPoint > -1 &&
      this.data[this.data.length - 1][this.hlPoint][0] >= this.minX
    ) {
      const hlX = this.pixX(this.data[this.data.length - 1][this.hlPoint][0]);
      const hlY = this.pixY(this.data[this.data.length - 1][this.hlPoint][1]);

      const time = this.data[this.data.length - 1][this.hlPoint][0] +
        this.startTime;

      const age = todayDate.getTime() - time * 1000;

      const ageText = formatAge(age / 1000);

      const align = hlX < this.width / 2 ? -1 : 1;

      const label = ageText + ": " + this.formatValue(
        this.data[this.data.length - 1][this.hlPoint][1]
      );

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

      this.ctx.fillStyle = COLOR_GRAPH_FUND_POINT;
      this.ctx.fill();
      this.ctx.closePath();
    }
    else {
      this.$label.hide();
    }
  }
  mouseOver(x) {
    if (!this.data) {
      return;
    }

    const xv = this.valX(x);

    let lastProximity = -1;

    const hlPoint = this.data[this.data.length - 1]
    .reduce((prev, point, index) => {
      const thisProximity = Math.abs(xv - point[0]);

      const returnVal = prev === null || thisProximity < lastProximity
        ? index : prev;

      lastProximity = thisProximity;

      return returnVal;
    }, null);

    if (hlPoint !== this.hlPoint) {
      this.hlPoint = hlPoint;

      this.draw();
    }
  }
}

