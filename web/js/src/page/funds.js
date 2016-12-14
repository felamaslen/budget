/**
 * Display fund data with historical prices etc.
 */

import $ from 'lib/jquery.min';

import { GRAPH_FUND_HISTORY_WIDTH } from 'const';

import { todayDate } from 'misc/date';
import { formatCurrency } from 'misc/format';
import { rgb } from 'misc/color';

import { PageList } from 'page/list';

import { GraphFundItem, GraphFundHistory } from 'graph/fund';

export class PageFunds extends PageList {
  constructor(options, api, state) {
    super(options, api, state);

    this.query = { history: 1 }; // tell api to get history data

    this.minDown = 0;
    this.maxUp = 0;

    this.downColor = [255, 44, 44];
    this.upColor = [0, 230, 18];
  }

  calculateGain(unitsTxt, priceVal, cost) {
    const units = parseFloat(unitsTxt, 10);
    const price = parseFloat(priceVal[0], 10);
    const price1 = parseFloat(priceVal[1], 10); // previous price
    let pct = 0;
    let gainAbs = 0;
    let value = cost;

    if (!isNaN(units) && !isNaN(price) && cost > 0) {
      value = units * price;
      pct = 100 * (value - cost) / cost;
      gainAbs = value - cost;
    }

    const pctParam = {
      noSymbol: true, suffix: "%", brackets: true, noDivide: true
    };

    const pctFormat = formatCurrency(pct, pctParam);
    const dayGain = formatCurrency(100 * (price - price1) / price1, pctParam);
    const dayGainClass = price !== price1 ?
      "high " + (price > price1 ? "profit" : "loss") : "";

    const format = {
      raw: false,
      noZeroes: false,
      abbreviate: true,
      brackets: true
    };

    const formatValue = formatCurrency(value, format);
    const formatPrice = price.toFixed(2);
    const formatGain = formatCurrency(gainAbs, format);

    const txt = `<span class="value">
      <span>${formatValue}</span><br>
      <span class="price">${formatPrice}</span>
    </span>
    <span class="abs">${formatGain}</span>
    <span class="pct">
      <span>${pctFormat}</span><br>
      <span class="daygain ${dayGainClass}">${dayGain}</span>
    </span>`
    ;

    return { pct, txt };
  }
  addGainText(gain, $span) {
    const color = gain.pct >= 0 ? this.upColor : this.downColor;
    const range = gain.pct >= 0 ? this.maxUp : this.minDown;
    const thisColor = Math.abs(range) > 0
      ? color.map(channel => Math.round(255 + (gain.pct / range) * (channel - 255)))
      : [255, 255, 255];

    return $span
      .toggleClass("profit", gain.pct > 0)
      .toggleClass("loss", gain.pct < 0)
      .toggleClass("high", Math.abs(gain.pct) > 5)
      .css("background-color", "rgb(" + thisColor.join(",") + ")")
      .html(gain.txt);
  }

  setGainRanges(pct) {
    this.minDown = Math.min.apply(null, pct.filter(item => item < 0));
    this.maxUp = Math.max.apply(null, pct.filter(item => item > 0));
  }
  hookCalculate() {
    super.hookCalculate();
    const $list = this.$lbody.children("li:not(.li-add)");
    const gain = [];
    $list.each((i, li) => {
      const id = $(li).data("id");

      // update gain info
      const units = this.$li[id].units.data("val");
      const price = this.$li[id].units.data("price");

      gain.push(this.calculateGain(units, price, this.data[i].cost));
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
  }
  hookCustomColumns(newItem, newData) {
    const id = newItem.id;

    // add a graph column
    const $graph = $("<div></div>").addClass("fund-graph-cont");

    const fundIndex = this.history.funds.indexOf(newData.i);
    if (fundIndex > -1) {
      const start = this.history.history[0][1];
      const data = this.history.history.map(item => {
        return [
          item[0],
          100 * (item[1][fundIndex] - start[fundIndex]) / start[fundIndex]
        ];
      });

      const fundGraph = new GraphFundItem({
        $cont: $graph,
        width: 100,
        height: 48,
        title: newData.i.toLowerCase().replace(/\W+/g, "-"),
        data
      }, this.api);

      fundGraph.draw();

      this.$li[id].graph = $("<span></span>").addClass("fund-graph").append($graph);
      this.$lis[id].append(this.$li[id].graph);
    }

    // add a "gain/loss" column
    const units = newData.u;
    const price = [newData.P, newData.Q];

    this.$li[id].units.data("price", price);

    const $gainSpan = this.addGainText(
      this.calculateGain(units, price, newData.c),
      $("<span></span>").addClass("text")
    );

    this.$li[id].gain = $("<span></span>").addClass("gain").append($gainSpan);
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
      this.graphFundHistory.loadStocksList();
    }
  }
  hookDataLoadedBeforeRender(callback, res) {
    super.hookDataLoadedBeforeRender(callback, res);

    const gainPct = res.data.data.map(item => {
      return 100 * (parseFloat(item.u) * item.P - item.c) / item.c;
    });
    this.setGainRanges(gainPct);

    this.history = res.data.history;
  }
  hookDataLoadedAfterRender(callback, res) {
    super.hookDataLoadedAfterRender(callback, res);

    // get minimum value
    let minValue = -1;
    let maxValue = -1;

    this.history.history.forEach(item => {
      if (minValue < 0 || item[1] < minValue) {
        minValue = item[1];
      }

      if (item[1] > maxValue) {
        maxValue = item[1];
      }
    });

    if (this.history.history.length > 0) {
      const lastValue = this.history.history[this.history.history.length - 1][2];

      const profit = lastValue - this.costTotal;
      const profitPct = 100 * profit / this.costTotal;

      const profitLabel = formatCurrency(profit, { brackets: true }) +
      "&nbsp;" + formatCurrency(profitPct, {
        brackets: true, noSymbol: true, suffix: "%", noDivide: true
      });

      const valueTime = this.history.startTime +
        this.history.history[this.history.history.length - 1][0];

      const ageHours = Math.round(
        (todayDate.getTime() - valueTime * 1000) / 3600000
      );

      const ago = ageHours + " hour" + (ageHours === 1 ? "" : "s") + " ago";

      this.$gainInfo.html(
        "Current value (" + ago + "): " +
          formatCurrency(lastValue)
      );

      this.$gainText.html(profitLabel)
      .toggleClass("profit", profit > 0)
      .toggleClass("loss", profit < 0);

      this.graphFundHistory = new GraphFundHistory({
        width:  GRAPH_FUND_HISTORY_WIDTH,
        height: this.pieHeight,
        $cont:  this.$graphs,
        $list:  this.$cont,
        page:   this.page,
        title:  "fund-history",
        data:   this.history.history,
        range:  [0, this.history.totalTime, minValue, maxValue],
        pad:    [24, 0, 0, 0],
        startTime: this.history.startTime
      }, this.api, this.state);
    }
  }
}

