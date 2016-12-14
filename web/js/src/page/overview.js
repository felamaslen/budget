/**
 * Overview of spending / cash flow
 */

import $ from "../../lib/jquery.min";

import {
  COLOR_CATEGORY, MSG_TIME_ERROR
} from "const";

import { arrayAverage, median, months, getYearMonthRow } from "misc/misc";
import { getColorFromScore } from "misc/color";
import { formatCurrency } from "misc/format";
import { validateCurrencyInput } from "misc/edit";

import Page from "page/page";
import { GraphBalance, GraphSpend } from "graph/overview";

export class PageOverview extends Page {
  constructor(api, state) {
    super({ page: "overview" }, api, state);

    this.categories = [
      "funds",
      "bills",
      "food", "general", "holiday", "social",
      "in", "out", "net",
      "predicted", "balance"
    ];

    this.colors = COLOR_CATEGORY;
  }

  hookDataLoadedBeforeRender(callback, res) {
    this.data = res.data;

    this.getYearMonths();
  }

  hookSwitchToAfterLoad() {
    // update data from other pages (which might have changed)
    this.processCategory("funds");
    this.processCategory("in");
    this.processCategory("food");
    this.processCategory("general");
    this.processCategory("holiday");
    this.processCategory("social");
    this.processCategory("bills");

    this.update();
  }

  render() {
    this.$tbl = $("<table></table>")
      .addClass("table-insert")
      .addClass("table-overview")
      .addClass("noselect");

    this.$thead = $("<thead></thead>");

    this.$thr = $("<tr></tr>").append("<th>Month</th>");

    this.categories.forEach((category, key) => this.addCategory(key, category));

    this.$thead.append(this.$thr);
    this.$tbl.append(this.$thead);

    this.$tbody = $("<tbody></tbody>");

    this.$td = [];
    this.$tr = [];

    this.yearMonths.forEach((yearMonth, key) => this.addTableRow(key, yearMonth));

    this.$tbl.append(this.$tbody);

    this.$page.append(this.$tbl);

    // draw graphs
    this.addGraphs();
  }

  getYearMonths() {
    this.yearMonths = [];

    let y = this.data.startYearMonth[0];
    let m = this.data.startYearMonth[1];

    while (
      y < this.data.endYearMonth[0] ||
      (y === this.data.endYearMonth[0] && m <= this.data.endYearMonth[1])
    ) {
      this.yearMonths.push([y, m]);

      if (++m > 12) {
        m = 1;
        y++;
      }
    }
  }

  calculateScores() {
    this.scores = {};

    for (const category in this.data.cost) {
      const costs = this.data.cost[category];

      const max = Math.max.apply(null, costs);
      const min = Math.min.apply(null, costs);

      const pve = [];
      const nve = [];

      for (let i = 0; i < costs.length; i++) {
        if (costs[i] >= 0) {
          pve.push(costs[i]);
        }
        else {
          nve.push(costs[i]);
        }
      }

      const median1 = median(pve);
      const median2 = median(nve);

      const thisScores = costs.map(thisCost => {
        let medianV = median1;
        let cost = thisCost;
        let M = max;

        if (thisCost < 0) {
          medianV = -median2;
          cost *= -1;
          M = -min;
        }

        if (cost > medianV) {
          return 0.5 * (1 + (cost - medianV) / (M - medianV));
        }

        return 0.5 * cost / medianV;
      });

      this.scores[category] = thisScores;
    }
  }

  calculateFutures() {
    // calculate futures (from past averages)
    const average = {};

    const futureCategories = ["food", "general", "holiday", "social"];

    for (const category of futureCategories) {
      average[category] = arrayAverage(this.data.cost[category], this.data.futureMonths);

      const spliceArgs = [
        this.data.cost[category].length - this.data.futureMonths,
        this.data.futureMonths
      ];

      for (let i = 0; i < this.data.futureMonths; i++) {
        spliceArgs.push(average[category]);
      }

      Array.prototype.splice.apply(this.data.cost[category], spliceArgs);
    }
  }

  calculateColumns() {
    // calculate total spend (including bills) for each month
    this.data.cost.out = this.yearMonths.map((yearMonth, key) => {
      return  this.data.cost.bills[key]   +
              this.data.cost.food[key]    +
              this.data.cost.general[key] +
              this.data.cost.holiday[key] +
              this.data.cost.social[key]
      ;
    });

    // calculate net change in balance for each month
    this.data.cost.net = this.data.cost.out.map((item, key) => {
      return this.data.cost.in[key] - item;
    });

    // calculate the predicted balance for each month
    this.data.cost.predicted = [];

    let lastValue = 0;

    this.data.cost.predicted = this.data.cost.out.map((item, key) => {
      let value = this.data.cost.net[key];

      if (key > 0) {
        const lastBalance = this.data.cost.balance[key - 1];

        if (lastBalance > 0) {
          value += lastBalance;
          this.data.cost.predicted[key] += lastBalance;
        }
        else {
          value += lastValue;
        }
      }

      lastValue = value;

      return value;
    });

    this.data.cost.predicted[0] = this.data.cost.balance[0];
  }

  afterBalanceEdit(callback) {
    const val = validateCurrencyInput(this.state.editing.$input.val());

    if (val === null) {
      return;
    }

    const $tr = this.state.editing.$elem.parent();

    const yearMonth = $tr.data("yearMonth");
    const key = $tr.index();

    if (val !== this.data.cost.balance[key]) {
      this.api.request(
        "update/overview", "POST", {
          year:   yearMonth[0],
          month:  yearMonth[1],
          balance:  val
        },
        () => this.onBalanceEdited(key, val),
        () => this.onBalanceEditError(),
        () => this.onBalanceEditRequestComplete(key, callback)
      );
    }
    else {
      this.state.editing.deactivate(val);

      if (typeof callback === "function") {
        callback();
      }
    }
  }

  onBalanceEdited(key, val) {
    this.data.cost.balance[key] = val;

    this.update();
  }

  onBalanceEditError() {
    this.state.error.newMessage("Error updating value! (Server error)", 2, MSG_TIME_ERROR);
  }

  onBalanceEditRequestComplete(key, callback) {
    this.state.editing.deactivate(this.data.cost.balance[key]);

    if (typeof callback === "function") {
      callback();
    }

  }

  addCategory(key, category) {
    this.$thr.append($("<th></th>").text(category));
  }

  addTableCell(key, cKey, category) {
    this.$td[key][category] = $("<td></td>")
    .addClass("cost")
    .data("val", 0)
    .append($("<span></span>").addClass("text"));

    if (category === "balance") {
      this.$td[key][category].editable(
        this.api, this.state,
        callback => this.afterBalanceEdit(callback), "cost"
      );
    }

    this.$tr[key].append(this.$td[key][category]);
  }

  addTableRow(key, yearMonth) {
    this.$tr[key] = $("<tr></tr>")
    .toggleClass(
      "past", (yearMonth[0] === this.data.currentYear &&
        yearMonth[1] < this.data.currentMonth) || yearMonth[0] < this.data.currentYear
    ).toggleClass(
      "active", yearMonth[0] === this.data.currentYear &&
        yearMonth[1] === this.data.currentMonth
    ).toggleClass(
      "future", (yearMonth[0] === this.data.currentYear &&
        yearMonth[1] > this.data.currentMonth) || yearMonth[0] > this.data.currentYear
    ).append($("<td></td>")
      .addClass("month")
      .text(months[yearMonth[1] - 1] + "-" + yearMonth[0].toString().substring(2))
    ).data("yearMonth", yearMonth);

    this.$td[key] = {};

    this.categories.forEach((category, cKey) => this.addTableCell(key, cKey, category));

    this.$tbody.append(this.$tr[key]);
  }

  addGraphs() {
    this.graphBalance = new GraphBalance({
      width:  500,
      height: 300,
      $cont:  this.$page,
      title:  "balance",
      dataPast: [],
      dataFuture: [],
      startYear:    this.data.startYearMonth[0],
      startMonth:   this.data.startYearMonth[1],
      currentYear:  this.data.currentYear,
      currentMonth: this.data.currentMonth,
      yearMonths:   this.yearMonths,
      pad: [64, 0, 24, 0],
      range: [0, this.yearMonths.length - 1, 0, 0]
    });

    this.graphSpend = new GraphSpend({
      width:  500,
      height: 300,
      $cont:  this.$page,
      title:  "spend",
      data:   this.data.cost,
      pad: [64, 0, 24, 0],
      range: [0, this.yearMonths.length - 1, 0, 0],
      yearMonths: this.yearMonths
    });
  }

  updateCategories(key, cKey, category) {
    this.$td[key][category]
    .data("val", this.data.cost[category][key])
    .css("background-color", getColorFromScore(
      this.colors[category],
      this.scores[category][key],
      this.data.cost[category][key] < 0)
    ).children(".text").html(formatCurrency(this.data.cost[category][key]));
  }

  updateYearMonths(key) {
    this.categories.forEach((category, cKey) => {
      this.updateCategories(key, cKey, category);
    });
  }

  updateGraphs() {
    this.graphBalance.update(this.data.cost.balance, this.data.cost.predicted);
    this.graphSpend.update(this.data.cost);
  }

  update(data) {
    if (data) {
      this.data = data;
    }

    // calculate future values from the averages
    this.calculateFutures();

    // calculate extra columns (out, spent etc.) from raw data
    this.calculateColumns();

    // colour each column according to values
    this.calculateScores();

    // fill the table with values
    this.yearMonths.forEach((yearMonth, key) => this.updateYearMonths(key));

    // update the graphs
    this.updateGraphs();
  }

  processCategory(category) {
    if (this.state.pages[category]) {
      const doneRows = [];

      for (let i = 0; i < this.state.pages[category].data.length; i++) {
        const year  = this.state.pages[category].data[i].date.year;
        const month = this.state.pages[category].data[i].date.month;

        const row = getYearMonthRow(
          this.data.startYearMonth[0], this.data.startYearMonth[1],
          year, month
        );

        const doneRow = doneRows.indexOf(row) > -1;

        if (!doneRow) {
          this.data.cost[category][row] = 0;

          doneRows.push(row);
        }

        if (row > -1 && row < this.data.cost.in.length) {
          this.data.cost[category][row] += this.state.pages[category].data[i].cost;
        }
      }
    }
  }
}

