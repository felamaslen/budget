/**
 * Fund graphs
 */

import $ from "../../lib/jquery.min";

import {
  MSG_TIME_ERROR,
  COLOR_DARK, COLOR_LIGHT_GREY, COLOR_PROFIT, COLOR_LOSS,
  COLOR_GRAPH_FUND_LINE, COLOR_GRAPH_TITLE, COLOR_KEY,
  GRAPH_FUND_ITEM_LINE_WIDTH, GRAPH_FUND_ITEM_TENSION,
  GRAPH_FUND_HISTORY_TENSION, GRAPH_FUND_HISTORY_POINT_RADIUS,
  GRAPH_FUND_HISTORY_NUM_TICKS, GRAPH_FUND_HISTORY_LINE_WIDTH,
  GRAPH_FUND_HISTORY_WIDTH_NARROW, GRAPH_FUND_HISTORY_WIDTH,
  STOCKS_REFRESH_INTERVAL, STOCKS_HL_TIME, DO_STOCKS_LIST, STOCK_INDICES,
  FONT_AXIS_LABEL
} from "const";

import { formatAge, formatCurrency } from "misc/format";
import MediaQueryHandler from "misc/media_query";
import { todayDate, timeSeriesTicks } from "misc/date";

import { getTickSize, LineGraph } from "graph/graph";
import { GoogleFinanceAPI } from "api/api";

const windowSize = new MediaQueryHandler();
const finance = new GoogleFinanceAPI();

const numDp = (stockChange, width) => {
  width = width || 2;
  return stockChange === 0 ? width : Math.max(
      0, width - Math.max(
        0, Math.floor(Math.log(Math.abs(stockChange)) / Math.LN10)
      )
    );
};

const processStockChange = (res, old) => {
  const price = parseFloat(res.l_fix, 10);
  const change = parseFloat(res.c_fix, 10) / price * 100;

  old.delta = old.price !== price ? (old.price < price ? 1 : -1) : 0;
  old.price = price;
  old.change = change;
  old.changeText = (change >= 0 ? "+" : "") + change.toFixed(numDp(change));

  return old;
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

    this.genColors();

    this.defaultWidth = this.width;
    this.defaultHeight = this.height;

    this.popout = false;
    this.$canvas.on("click", () => this.togglePopout());
  }
  genColors() {
    const colors = [];
    const transition = [];
    const levels = [
      [0, COLOR_LOSS],
      [Infinity, COLOR_PROFIT]
    ];

    if (this.data.length > 1) {
      let level = levels.findIndex(item => this.data[1][1] < item[0]);
      colors.push(levels[level][1]);

      this.data.slice(2).forEach((point, key) => {
        const thisLevel = levels.findIndex(item => point[1] < item[0]);

        if (thisLevel !== level) {
          level = thisLevel;
          colors.push(levels[level][1]);
          transition.push(key);
        }
      });

      this.colors = colors;
      this.transition = transition;
    }
    else {
      this.colors = [COLOR_DARK];
    }
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
    this.drawCubicLine(this.data, this.colors);
  }
}

export class GraphFundHistory extends LineGraph {
  constructor(options, api, state) {
    super(options, api, state);

    this.$list = options.$list;

    this.tension = GRAPH_FUND_HISTORY_TENSION;
    this.raw = options.data;
    this.funds = options.funds;
    this.fundLines = this.funds.map(() => false);
    this.startTime = options.startTime;
    this.hlPoint = [-1, -1];

    this.togglePercent(true, true);

    this.colorMajor = COLOR_GRAPH_FUND_LINE;

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

  buildFundSidebar() {
    const $fundSidebar = $("<ul></ul>").addClass("fund-sidebar").addClass("noselect");

    this.funds.forEach((fund, index) => {
      const $item = $("<li></li>")
      .append($("<span></span>")
              .addClass("checkbox").css("border-color", COLOR_KEY[index % COLOR_KEY.length]))
      .append($("<span></span>").addClass("fund").text(fund))
      .toggleClass("enabled", this.fundLines[index]);
      $item.on("click", evt => {
        const status = !$item.hasClass("enabled");
        $item.toggleClass("enabled", status);
        this.fundLines[index] = status;
        this.togglePercent(this.percent);
        evt.stopPropagation();
      });
      $fundSidebar.append($item);
    });
    this.$gCont.append($fundSidebar);
  }

  processData() {
    if (!this.raw.length) {
      return null;
    }
    const lines = [];
    this.fundLines.forEach((status, index) => {
      if (status) {
        lines.push([COLOR_KEY[index % COLOR_KEY.length], this.raw.map(item => {
          return [item[0], item[1][index]];
        })]);
      }
    });
    lines.push([COLOR_GRAPH_FUND_LINE, this.raw.map(item => {
      return [item[0], item[2]];
    })]);

    return lines;
  }
  resize(size) {
    this.width = size;
    this.$canvas[0].width = size;

    this.draw();
  }

  buildStockViewer() {
    this.stocksRefreshInterval = STOCKS_REFRESH_INTERVAL;

    this.stocksListLoading = false;
    this.stockPricesLoading = false;
    this.stocks = {};

    this.$stocksListOuter = $("<div></div>")
    .addClass("stocks-list");
    this.$stocksList = $("<ul></ul>")
    .addClass("stocks-list-ul");
    this.$sidebar = $("<div></div>")
    .addClass("stock-sidebar");

    this.$indicesList = $("<ul></ul>");
    this.$overallStockChange = $("<span></span>").addClass("change");
    this.$stocksListOverall   = $("<li></li>").addClass("stocks-list-overall")
      .append($("<span></span>").addClass("label").text("Exposure"))
      .append($("<span></span>").addClass("price").append(this.$overallStockChange));
    this.$indicesList.append(this.$stocksListOverall);

    this.$sidebar.append(this.$indicesList);

    this.$stocksListOuter.append(this.$sidebar);
    this.$stocksListOuter.append(this.$stocksList);
    this.$list.append(this.$stocksListOuter);

    this.indices = [];
    this.indexSymbols = [];
    this.loadStocksList();
  }
  getStockSymbols(symbols) {
    // get index quotes
    for (const symbol in STOCK_INDICES) {
      symbols.push(symbol);
    }
    return symbols;
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
        symbol: stock[0],
        name: stock[1],
        weight: stock[2],
        price: 0,
        change: 0,
        changeText: "",
        $elem: null
      };
    });

    this.stocksTotalWeight = res.data.total;
    this.stocksWeightedChange = null;

    this.stockSymbols = this.getStockSymbols(this.stocks.map(stock => stock.symbol));
    this.$stocksList.empty();
    this.loadStockPrices();
  }
  onStocksListError() {
    this.state.error.newMessage("Error loading stocks list!", 2, MSG_TIME_ERROR);
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

  onStockPricesLoaded(res) {
    let badStocks = 0;
    let weightedChange = 0;

    for (const stock of res) {
      const symbol  = stock.e + ":" + stock.t;

      if (STOCK_INDICES[symbol]) {
        let index = this.indexSymbols.indexOf(symbol);
        if (index < 0) {
          // create the index symbol
          index = this.indexSymbols.length;

          this.indexSymbols.push(symbol);
          this.indices.push({
            symbol,
            name: STOCK_INDICES[symbol],
            delta: 0,
            price: 0,
            change: 0,
            changeText: "",
            $elem: null
          });
        }

        this.indices[index] = processStockChange(stock, this.indices[index]);
      }
      else {
        const index = this.stockSymbols.indexOf(symbol);
        if (index < 0) {
          badStocks++;
        }
        else {
          this.stocks[index] = processStockChange(stock, this.stocks[index]);
          weightedChange += this.stocks[index].weight * this.stocks[index].change;
        }
      }
    }

    weightedChange /= this.stocksTotalWeight;

    if (badStocks > 0) {
      this.state.error.newMessage(
        "Got " + badStocks.toString() + " extra stocks from finance api",
        2, MSG_TIME_ERROR
      );

      return;
    }

    this.updateStocksOverall(weightedChange);
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
      change.toFixed(numDp(change, 4));

    this.$stocksListOverall
    .toggleClass("up", change > 0)
    .toggleClass("down", change < 0);

    if (this.overallHlTimer) {
      window.clearTimeout(this.overallHlTimer);
    }

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

    this.overallHlTimer = window.setTimeout(() => {
      this.$overallStockChange.removeClass("hl-up").removeClass("hl-down");
    }, STOCKS_HL_TIME);
  }
  updateStockItem(stock, index) {
    if (stock.$elem) {
      // update the item
      stock.$absolute.text(stock.price.toFixed(2));
      stock.$change.text(stock.changeText);

      if (stock.hlTimer) {
        window.clearTimeout(stock.hlTimer);
      }

      stock.$price
      .toggleClass("hl-up", stock.delta > 0)
      .toggleClass("hl-down", stock.delta < 0);

      if (stock.delta !== 0) {
        stock.hlTimer = window.setTimeout(() => {
          stock.$price.removeClass("hl-up").removeClass("hl-down");
        }, STOCKS_HL_TIME);
      }

      stock.delta = 0;
    }
    // add the item
    else if (index) {
      stock.$elem = $("<li></li>");
      stock.$label = $("<span></span>").addClass("label").html(stock.name);
      stock.$price = $("<span></span>").addClass("price");
      stock.$absolute = $("<span></span>").addClass("absolute").text(stock.price.toFixed(2));
      stock.$change = $("<span></span>").addClass("change").text(stock.changeText);

      stock.$price.append(stock.$absolute).append(stock.$change);
      stock.$elem.append(stock.$label).append(stock.$price);

      this.$indicesList.append(stock.$elem);
    }
    else {
      stock.$elem = $("<li></li>").addClass("stock-list-item");
      stock.$elem.attr("title", stock.symbol + " (" + stock.name + ")");

      stock.$label = $("<span></span>").addClass("label").html(stock.name);
      stock.$price = $("<span></span>").addClass("price");
      stock.$absolute = $("<span></span>").addClass("absolute").text(stock.price.toFixed(2));
      stock.$change = $("<span></span>").addClass("change").text(stock.changeText);

      stock.$price.append(stock.$absolute).append(stock.$change);
      stock.$elem.append(stock.$label).append(stock.$price);

      this.$stocksList.append(stock.$elem);
    }

    stock.$elem.toggleClass("up", stock.change > 0);
    stock.$elem.toggleClass("down", stock.change < 0);
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

    stocks.forEach(stock => this.updateStockItem(stock));
    this.indices.forEach(stock => this.updateStockItem(stock, true));
  }
  onStockPricesFail() {
    this.state.error.newMessage("Error loading stock prices!", 2, MSG_TIME_ERROR);
  }
  onStockPricesRequestComplete() {
    this.stockPricesLoading = false;
  }

  togglePercent(status, noDraw) {
    this.percent = status;
    this.dataProc = this.processData();
    if (!this.dataProc) {
      return;
    }
    this.calculatePercentages();
    this.calculateYRange();
    if (!noDraw) {
      this.draw();
    }
  }
  getTimeScale() {
    // divides the time axis (horizontal) into appropriate chunks
    return timeSeriesTicks(
      this.startTime + this.minX, this.startTime + this.maxX
    ).map(tick => {
      return {
        major: tick.major,
        pix: Math.floor(this.pixX(tick.t - this.startTime)) + 0.5,
        text: tick.major ? tick.label : null
      };
    });
  }
  dataVisible() {
    return this.data.map(line => {
      return line.map((item, key) => {
        return key === 1 ? item.filter(point => point[0] >= this.minX && point[0] <= this.maxX) : item;
      });
    });
  }
  zoomX(direction) {
    if (this.hlPoint[0] === -1 || this.hlPoint[0] === -1 ||
        (direction < 0 && this.dataVisible()[0][1].length < 4)) {
      return;
    }

    const point = this.data[this.hlPoint[0]][1][this.hlPoint[1]][0];
    super.zoomX(direction, point);
    this.calculateYRange();
    this.draw();
  }
  calculateYRange() {
    // calculate new Y range based on truncating the data (zooming)
    let minY = Infinity;
    let maxY = -Infinity;
    this.dataVisible().forEach(line => {
      minY = line[1].reduce((last, current) => current[1] < last ? current[1] : last, minY);
      maxY = line[1].reduce((last, current) => current[1] > last ? current[1] : last, maxY);
    });

    if (this.percent && minY === 0) {
      minY = -maxY * 0.2;
    }

    // return the tick size for the new range
    this.tickSizeY = getTickSize(minY, maxY, GRAPH_FUND_HISTORY_NUM_TICKS);

    // set the new ranges
    this.setRange([
      this.minX, this.maxX,
      this.tickSizeY * Math.floor(minY / this.tickSizeY),
      this.tickSizeY * Math.ceil(maxY / this.tickSizeY)
    ]);
  }
  calculatePercentages() {
    // turns data from absolute values to percentage returns
    this.data = this.percent ? this.dataProc.map(line => {
      const initial = line[1][0][1];
      return [line[0], line[1].map(item => {
        return [item[0], 100 * (item[1] - initial) / initial];
      })];
    }) : this.dataProc;

    if (this.hlPoint[0] > this.data.length - 1) {
      this.hlPoint[0] = this.data.length - 1;
    }
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

    const axisTextColor = COLOR_DARK;
    const timeTicks = this.getTimeScale();
    // calculate tick range
    const ticksY = [];
    // draw value (Y axis) ticks and horizontal lines
    const newNumTicks = Math.floor((this.maxY - this.minY) / this.tickSizeY);

    // draw axes
    const startValue = this.raw[0][2];

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

      this.ctx.strokeStyle = (this.percent && value > 0) || (!this.percent && value > startValue)
        ? COLOR_PROFIT : COLOR_LOSS;
      this.ctx.stroke();
    }

    // draw time (X axis) ticks
    const y0 = this.pixY(this.minY);

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = axisTextColor;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom";

    const tickAngle = -Math.PI / 6;
    const tickSize = 10;

    timeTicks.forEach(tick => {
      const thisTickSize = tickSize * (tick.major ? 1 : 0.5);

      this.ctx.beginPath();
      this.ctx.strokeStyle = tick.major ? COLOR_GRAPH_TITLE : COLOR_DARK;
      this.ctx.moveTo(tick.pix, y0);
      this.ctx.lineTo(tick.pix, y0 - thisTickSize);
      this.ctx.stroke();
      this.ctx.closePath();

      if (tick.major) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = COLOR_LIGHT_GREY;
        this.ctx.moveTo(tick.pix, y0 - thisTickSize);
        this.ctx.lineTo(tick.pix, this.padY1);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.save();
        this.ctx.translate(tick.pix, y0 - thisTickSize);
        this.ctx.rotate(tickAngle);
        this.ctx.fillText(tick.text, 0, 0);
        this.ctx.restore();
      }
    });

    const mainIndex = this.data.length - 1;

    // plot past data
    if (this.data) {
      const mainOnly = this.data.length === 1;
      const mainColor = mainOnly ? this.data[0][0] : COLOR_LIGHT_GREY;

      this.data.forEach((line, index) => {
        const mainLine = index === mainIndex;

        this.lineWidth = mainLine ? GRAPH_FUND_HISTORY_LINE_WIDTH : 1;
        this.drawCubicLine(
          line[1],
          [mainLine ? mainColor : line[0]],
          mainLine ? [30, 90] : 0
        );
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
      this.hlPoint[0] > -1 &&
      this.data[this.hlPoint[0]][1][this.hlPoint[1]][0] >= this.minX
    ) {
      const point = this.data[this.hlPoint[0]][1][this.hlPoint[1]];

      const hlX = this.pixX(point[0]);
      const hlY = this.pixY(point[1]);

      const time = point[0] + this.startTime;
      const age = todayDate.getTime() - time * 1000;
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

