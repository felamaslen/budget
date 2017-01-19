/**
 * Stocks list thingy
 */

import $ from "../../lib/jquery.min";

import {
  DO_STOCKS_LIST, STOCKS_REFRESH_INTERVAL, STOCK_INDICES,
  STOCKS_HL_TIME, STOCKS_GRAPH_DETAIL,
  STOCKS_GRAPH_HEIGHT, STOCKS_SIDEBAR_WIDTH,
  COLOR_PROFIT, COLOR_LOSS, COLOR_DARK
} from "const";

import { LineGraph } from "graph/graph";
import { GoogleFinanceAPI } from "api/api";

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

    this.data = [];
  }
  update(value) {
    // updates graph with latest value
    this.data.push(value);
    while (this.data.length > STOCKS_GRAPH_DETAIL) {
      this.data.shift();
    }
    const newMin = Math.min(-0.1, Math.min.apply(null, this.data) - 0.1);
    const newMax = Math.max(0.1, Math.max.apply(null, this.data) + 0.1);
    this.setRange([0, this.data.length - 1, newMin, newMax]);

    this.draw();
  }
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.data.length > 1) {
      const profit = this.data[this.data.length - 1] > 0;
      const loss = this.data[this.data.length - 1] < 0;

      const line = this.data.map((value, key) => [key, value]);
      this.drawLine(line, profit ? COLOR_PROFIT : (loss ? COLOR_LOSS : COLOR_DARK));
    }
  }
}

export class StocksList {
  constructor(options, api, state) {
    this.api = api;
    this.state = state;

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

    options.$list.append(this.$stocksListOuter);

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
  }
}
