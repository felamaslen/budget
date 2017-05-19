/**
 * Display fund data with historical prices etc.
 */

import $ from "../../lib/jquery.min";

import { GRAPH_FUND_HISTORY_WIDTH, GRAPH_FUND_HISTORY_DEFAULT_PERIOD } from "const";

import { todayDate } from "misc/date";
import { formatCurrency, formatAge, TransactionsList } from "misc/format";
import { arraySum, classNames } from "misc/misc";

import { PageList } from "page/list";

import { WorldMap } from "graph/world_map";
import { GraphFundItem, GraphFundHistory, getHistoryFunds } from "graph/fund";
import { StocksList } from "page/funds_stocks";

export class PageFunds extends PageList {
  constructor(options, api, state) {
    super(options, api, state);

    // tell api to get history data
    this.query = { history: true, period: GRAPH_FUND_HISTORY_DEFAULT_PERIOD };

    this.minDown = 0;
    this.maxUp = 0;

    this.downColor = [255, 44, 44];
    this.upColor = [0, 230, 18];

    this.drawGraphs();

    // world map graph
    this.worldMap = new WorldMap();
    this.$graphs.append(this.worldMap.$elem);
  }

  calculateGain(units, priceVal, cost) {
    const price = priceVal[0];

    const dayGain = priceVal[1] * 100; // today's percent gain
    let dayGainAbs = 0; // today's absolute gain
    let gain = 0; // overall percent gain
    let gainAbs = 0; // overall absolute gain
    let value = cost; // value of holding

    if (!isNaN(units)) {
      dayGainAbs = units * price * dayGain / 100;
      if (!isNaN(price)) {
        value = units * price;
        if (cost > 0) {
          gain = 100 * (value - cost) / cost;
          gainAbs = value - cost;
        }
      }
    }

    const pctFormat = {
      noSymbol: true,
      suffix: "%",
      brackets: true,
      noDivide: true
    };
    const currencyFormat = {
      noPence: true,
      abbreviate: true,
      brackets: true,
      precision: 1
    };

    const dayGainClass = classNames({
      "day-gain": true,
      profit: dayGain > 0,
      loss: dayGain < 0
    });
    const dayGainClassAbs = classNames({
      "day-gain-abs": true,
      profit: dayGainAbs > 0,
      loss: dayGainAbs < 0
    });
    const gainClass = classNames({
      gain: true,
      profit: gain > 0,
      loss: gain < 0
    });
    const gainClassAbs = classNames({
      "gain-abs": true,
      profit: gainAbs > 0,
      loss: gainAbs < 0
    });

    const formatValue = formatCurrency(value, currencyFormat);
    const formatGainAbs = formatCurrency(gainAbs, currencyFormat);
    const formatDayGainAbs = formatCurrency(dayGainAbs, currencyFormat);
    const formatGain = formatCurrency(gain, pctFormat);
    const formatDayGain = formatCurrency(dayGain, pctFormat);

    const txt = `
    <span class="value">${formatValue}</span>
    <span class="${gainClassAbs}">${formatGainAbs}</span>
    <span class="${dayGainClassAbs}">${formatDayGainAbs}</span>
    <span class="${gainClass}">${formatGain}</span>
    <span class="${dayGainClass}">${formatDayGain}</span>
    `;

    return { gain, txt };
  }
  addGainText(gain, $span) {
    const color = gain.gain >= 0 ? this.upColor : this.downColor;
    const range = gain.gain >= 0 ? this.maxUp : this.minDown;
    const thisColor = Math.abs(range) > 0
      ? color.map(channel => Math.round(255 + (gain.gain / range) * (channel - 255)))
      : [255, 255, 255];

    return $span
      .toggleClass("profit", gain.gain > 0)
      .toggleClass("loss", gain.gain < 0)
      .css("background-color", `rgb(${thisColor.join(",")})`)
      .html(gain.txt);
  }

  setGainRanges(pct) {
    this.minDown = Math.min.apply(null, pct.filter(item => item < 0));
    this.maxUp = Math.max.apply(null, pct.filter(item => item > 0));
  }
  calculateOverallGain() {
    const historyFunds = getHistoryFunds(this.history.funds);
    const units = historyFunds.map(fund => {
      return fund.transactions.getTotalUnits();
    });
    const lastValue = arraySum(this.history.history[this.history.history.length - 1][1]
    .map((price, fundKey) => {
      return units[fundKey] * price;
    }));

    const profit = lastValue - this.costTotal;
    const profitPct = 100 * profit / this.costTotal;

    const profitLabel = formatCurrency(profit, { brackets: true }) +
    "&nbsp;" + formatCurrency(profitPct, {
      brackets: true, noSymbol: true, suffix: "%", noDivide: true
    });

    const valueTime = this.history.startTime +
      this.history.history[this.history.history.length - 1][0];
    const cacheAge = formatAge((todayDate().getTime() - valueTime * 1000) / 1000);

    this.$gainInfo.html(
      "Current value (" + cacheAge + "): " +
        formatCurrency(lastValue)
    );
    this.$gainText.html(profitLabel)
    .toggleClass("profit", profit > 0)
    .toggleClass("loss", profit < 0);

    return historyFunds;
  }
  hookCalculate() {
    super.hookCalculate();
    const $list = this.$lbody.children("li:not(.li-add)");
    const gain = [];
    $list.each((i, li) => {
      const id = $(li).data("id");

      const transactions = this.$li[id].transactions.data("val");
      const units = transactions.getLastUnits();
      const cost = transactions.getLastCost();
      const price = this.$li[id].transactions.data("price");
      const sold = transactions.sold();
      $(li).toggleClass("sold", sold);
      gain.push(this.calculateGain(units, price, cost));
    });

    const pct = gain.map(item => item.pct);
    this.setGainRanges(pct);

    $list.each((i, li) => {
      const id = $(li).data("id");
      const $span = this.addGainText(
        gain[i],
        this.$li[id].gain.children(".text")
      );

      this.$li[id].gain.children(".text").replaceWith($span);
    });

    this.calculateOverallGain();
  }
  hookCustomColumns(newItem, newData) {
    const id = newItem.id;
    let lastChange = 0;

    // add a graph column
    const $graph = $("<div></div>").addClass("fund-graph-cont");
    this.$li[id].graph = $("<span></span>").addClass("fund-graph");

    const fundIndex = this.history.funds.items.indexOf(newData.i);
    if (fundIndex > -1) {
      const historyWithFund = this.history.history.filter(
        item => item[1].length > fundIndex && item[1][fundIndex] > 0
      );
      const start = historyWithFund[0][1];
      const data = historyWithFund.map(item => {
        return [
          item[0],
          100 * (item[1][fundIndex] - start[fundIndex]) / start[fundIndex]
        ];
      });

      const lastValue = historyWithFund[historyWithFund.length - 1][1][fundIndex];
      const changedValues = historyWithFund.map(item => item[1][fundIndex])
      .filter(value => value !== lastValue).reverse();
      if (changedValues.length > 0) {
        lastChange = (lastValue - changedValues[0]) / changedValues[0];
      }

      const fundGraph = new GraphFundItem({
        $cont: $graph,
        width: 100,
        height: 48,
        title: newData.i.toLowerCase().replace(/\W+/g, "-"),
        data
      }, this.api);
      fundGraph.draw();
      this.$li[id].graph.append($graph);
      this.$lis[id].append(this.$li[id].graph);
    }

    // add a "gain/loss" column
    const units = newData.t.getLastUnits();
    const price = [newData.P, lastChange];
    const cost = newData.t.getLastCost();
    const sold = newData.t.sold();
    this.$lis[id].toggleClass("sold", sold);

    this.$li[id].transactions.data("price", price);
    this.$li[id].gain = $("<span></span>");
    const $gainSpan = this.addGainText(
      this.calculateGain(units, price, cost),
      $("<span></span>").addClass("text")
    );
    this.$li[id].gain.addClass("gain").append($gainSpan);
    this.$lis[id].append(this.$li[id].gain);

    return newItem;
  }
  render() {
    super.render();

    const $gain = $("<span></span>").addClass("gain");
    this.$gainInfo = $("<span></span>").addClass("gain-info");
    this.$gainText = $("<span></span>").addClass("text");

    $gain.append(this.$gainInfo);
    $gain.append(this.$gainText);
    this.$lhead.append($gain);
  }

  hookSwitchToCallback(pageExists) {
    super.hookSwitchToCallback();

    if (pageExists) {
      this.stocksList && this.stocksList.loadStocksList();
    }
  }
  hookDataLoadedBeforeRender(callback, res) {
    super.hookDataLoadedBeforeRender(callback, res);

    const gainPct = res.data.data.map(item => {
      const transactions = new TransactionsList(JSON.parse(item.t));
      const units = transactions.getLastUnits();
      const cost = transactions.getLastCost();

      return cost ? 100 * (units * item.P - cost) / cost : 0;
    });
    this.setGainRanges(gainPct);

    this.history = res.data.history;
  }
  hookDataLoadedAfterRender(callback, res) {
    super.hookDataLoadedAfterRender(callback, res);

    if (this.history.history.length > 0) {
      // calculate latest value
      const historyFunds = this.calculateOverallGain();

      // intiate the main fund history graph
      this.graphFundHistory = new GraphFundHistory({
        width:  GRAPH_FUND_HISTORY_WIDTH,
        height: this.pieHeight,
        $cont:  this.$graphs,
        page:   this.page,
        title:  "fund-history",
        data:   this.history.history,
        funds:  historyFunds,
        pad:    [36, 0, 0, 0],
        startTime: this.history.startTime,
        range: [0, 0, 0, 0]
      }, this.api, this.state);

      this.stocksList = new StocksList({ $list: this.$cont, worldMap: this.worldMap }, this.api, this.state);
    }
  }
}

