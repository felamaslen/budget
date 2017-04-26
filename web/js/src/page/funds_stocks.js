/**
 * Stocks list thingy
 */

import $ from "../../lib/jquery.min";

import {
  STOCKS_GET_PRICES, STOCKS_REFRESH_INTERVAL, STOCK_INDICES,
  STOCKS_HL_TIME, STOCKS_GRAPH_DETAIL,
  STOCKS_GRAPH_HEIGHT, STOCKS_SIDEBAR_WIDTH,
  COLOR_PROFIT, COLOR_LOSS, COLOR_DARK,
  MSG_TIME_ERROR
} from "const";

import { LineGraph } from "graph/graph";
import { GoogleFinanceAPI } from "api/api";
import { timeSeriesTicks } from "misc/date";

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

class StocksGraph extends LineGraph {
  constructor($cont, api, state) {
    super({
      $cont,
      width: STOCKS_SIDEBAR_WIDTH,
      height: STOCKS_GRAPH_HEIGHT,
      range: [0, 1, -0.2, 0.2],
      title: "stocks",
      lineWidth: 1
    }, api, state);

    this.timeData = [];
    this.data = [];
    this.deleteKey = 0;
  }
  getTimeScale() {
    const ticks = timeSeriesTicks(
      this.timeData[0][0], this.timeData[this.timeData.length - 1][0]
    );

    if (!ticks) {
      return [];
    }

    return ticks.map(tick => {
      return {
        major: tick.major,
        pix: Math.floor(this.pixX(tick.t)) + 0.5,
        text: tick.label || null
      };
    });
  }
  update(value) {
    // updates graph with latest value
    this.timeData.push([new Date().getTime() / 1000, value]);
    while (this.timeData.length > STOCKS_GRAPH_DETAIL) {
      this.timeData.splice(1 + (this.deleteKey++ % (STOCKS_GRAPH_DETAIL - 2)), 1);
    }
    this.data = this.timeData.map(item => item[1]);
    const newMin = Math.min(-0.00001, Math.min.apply(null, this.data));
    const newMax = Math.max(0.00001, Math.max.apply(null, this.data));
    this.setRange(
      [this.timeData[0][0], this.timeData[this.timeData.length - 1][0], newMin, newMax]
    );

    this.draw();
  }
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const timeTicks = this.getTimeScale();
    const tickSize = 10;
    const tickAngle = -Math.PI / 6;
    // console.debug(timeTicks.map(tick => tick.pix).join(", "));
    timeTicks.forEach(tick => {
      const thisTickSize = tickSize * 0.5 * (tick.major + 1);

      this.ctx.beginPath();
      this.ctx.strokeStyle = COLOR_DARK;
      this.ctx.moveTo(tick.pix, this.height);
      this.ctx.lineTo(tick.pix, this.height - thisTickSize);
      this.ctx.stroke();
      this.ctx.closePath();

      if (tick.text) {
        this.ctx.save();
        this.ctx.translate(tick.pix, this.height - thisTickSize);
        this.ctx.rotate(tickAngle);
        this.ctx.fillText(tick.text, 0, 0);
        this.ctx.restore();
      }
    });

    this.ctx.beginPath();
    const y0 = Math.floor(this.pixY(0)) + 0.5;
    this.ctx.moveTo(0, y0);
    this.ctx.lineTo(this.width, y0);
    this.ctx.strokeStyle = COLOR_DARK;
    this.ctx.stroke();
    this.ctx.closePath();

    if (this.data.length > 1) {
      const profit = this.data[this.data.length - 1] > 0;
      const loss = this.data[this.data.length - 1] < 0;

      this.drawLine(this.timeData, profit ? COLOR_PROFIT : (loss ? COLOR_LOSS : COLOR_DARK));
    }
  }
}

export class StocksList {
  constructor(options, api, state) {
    this.api = api;
    this.state = state;

    this.worldMap = options.worldMap;

    this.stocksRefreshInterval = STOCKS_REFRESH_INTERVAL;
    this.stocksListLoading = false;
    this.stockPricesLoading = false;
    this.stocks = {};

    this.indices = [];
    this.indexSymbols = [];
    this.$list = options.$list;
    this.loadStocksList();
  }
  buildStocksList() {
    if (this.$stocksListOuter) {
      this.$stocksList.empty();
      return;
    }
    this.$stocksListOuter = $("<div></div>")
    .addClass("stocks-list");
    this.$stocksList = $("<ul></ul>")
    .addClass("stocks-list-ul");
    this.$sidebar = $("<div></div>")
    .addClass("stock-sidebar");

    this.stocksGraph = new StocksGraph(this.$sidebar, this.api, this.state);

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
  }
  getStockSymbols(symbols) {
    // get index quotes
    for (const symbol in STOCK_INDICES) {
      symbols.push(symbol);
    }
    return symbols;
  }
  getStockGeoWeighted() {
    const exchangeWeightsRaw = this.stocks.reduce((exchanges, stock) => {
      const exchange = stock.symbol.substring(0, stock.symbol.indexOf(":"));
      const index = exchanges.findIndex(item => item[0] === exchange);
      if (index === -1) {
        exchanges.push([exchange, stock.weight]);
      }
      else {
        exchanges[index][1] += stock.weight;
      }
      return exchanges;
    }, []);

    const maxWeight = Math.max.apply(null, exchangeWeightsRaw.map(exchange => exchange[1]));

    const exchangeWeights = exchangeWeightsRaw.map(exchange => {
      return [exchange[0], exchange[1] / maxWeight];
    });

    return exchangeWeights;
  }
  loadStocksList() {
    if (this.stocksListLoading) {
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
    this.stocksTotalWeight = res.data.total;
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

    const stockGeo = this.getStockGeoWeighted();
    this.worldMap.addWeights(stockGeo);

    this.stocksWeightedChange = null;
    this.stockSymbols = this.getStockSymbols(this.stocks.map(stock => stock.symbol));

    if (STOCKS_GET_PRICES) {
      this.buildStocksList();
      this.loadStockPrices();
    }
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

    this.stocksGraph.update(change);

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

    // refresh the prices in 5 seconds
    if (this.stocksLoadingTimer) {
      window.clearTimeout(this.stocksLoadingTimer);
    }

    this.stocksLoadingTimer = window.setTimeout(() => {
      this.loadStockPrices();
    }, this.stocksRefreshInterval);
  }
}

