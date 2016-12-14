/**
 * A PageList is a type of page which displays an editable list of data,
 * optionally with pie chart(s)
 */

import $ from "../../lib/jquery.min";

import { MSG_TIME_WARN, MSG_TIME_ERROR } from "const";

import { afterEditValidateCompare, validateInput } from "misc/edit";
import { today } from "misc/date";
import { formatCurrency, getData, formatData } from "misc/format";

import { PieGraph } from "graph/graph";

import Page from "page/page";

export class PageList extends Page {
  constructor(options, api, state) {
    super(options, api, state);

    this.col = options.col;  // list of columns
    this.colShort = options.colShort;

    this.colEdit = options.colEdit || options.col.map((item, i) => i);

    this.dataType = options.dataType;
    this.addDefaultVal = options.addDefaultVal;
    this.dailyColumn = options.daily;

    this.drawPie = options.drawPie;
    this.stretchFactor = options.pieStretch || 1.5;
    this.pieWidth = options.pieWidth || 500;
    this.pieHeight = options.pieHeight || 300;
    this.pieTolerance = pieTolerance;
    this.pieLabelLength = options.pieLabelLength || 30;

    this.limit = options.limit;
    this.offset = 0;

    if (this.drawPie) {
      this.$graphsOuter = $("<div></div>").addClass("graph-container-outer");

      this.$graphs = $("<div></div>").addClass("graph-container-inner");

      this.$graphToggle = $("<button></button")
      .addClass("graph-toggle-btn");

      this.$graphsOuter.append(this.$graphToggle);

      this.$graphToggle.on("click", () => {
        graphHidden = !graphHidden;

        $(document.body).toggleClass("graph-hidden", graphHidden);
      });

      this.$graphsOuter.append(this.$graphs);

      this.$page.prepend(this.$graphsOuter);
    }
    else {
      this.$page.addClass("graph-hidden");
    }

    // this.dailyAverage = 0;  // TODO
    // this.weeklyAverage = 0; // TODO

    this.costTotal = 0;
  }

  hookDataAddArgs(args) {
    if (this.offset > 0) {
      args.push(this.offset);
    }

    return args;
  }
  hookDataLoadedAfterRender(callback, res) {
    this.costTotal = res.data.total;

    this.update(res.data.data);

    if (!res.data.older_exists) {
      this.offset = -1;
    }
  }
  hookSwitchToCallback() {
    this.updatePieChart();
  }
  update(newData) {
    this.addNewRows(newData);

    if (this.dailyColumn) {
      this.calculateDaily();
    }
  }
  numEditCols() {
    return this.colEdit.length;
  }
  hookCustomColumns(newItem) {
    return newItem;
  }
  addNewRows(newData) {
    newData.forEach((item, i) => {
      const id = parseInt(newData[i].I, 10);

      let newItem = { id };

      this.$lis[id] = $("<li></li>");

      this.$li[id] = {};

      this.colEdit.forEach(j => {
        const col = this.col[j];

        const newDataValue = newData[i][this.colShort[j]];

        newItem[col] = getData(newDataValue, this.dataType[j]);

        this.$li[id][col] = $("<span></span>").addClass(col).append(
          $("<span></span>").addClass("text").html(
            formatData(newItem[col], this.dataType[j])
          )
        ).data("val", newItem[col]);

        const suggestion = this.dataType[j] === "text"
          ? { page: this.page, col } : null;

        this.$li[id][col].editable(
          this.api, this.state, this.listEditCallback(j),
          this.dataType[j], suggestion
        );

        this.$lis[id].append(this.$li[id][col]);
      });

      newItem = this.hookCustomColumns(newItem, newData[i]);

      if (newItem.date.isAfter(today)) {
        this.$lis[id].addClass("future");
      }
      /*
      else if (today.isAfter(newItem.date)) {
        this.$lis[id].addClass("past");
      }
      // */

      this.data.push(newItem);

      if (this.dailyColumn) {
        this.$li[id].daily = $("<span></span>").addClass("daily");
        this.$lis[id].append(this.$li[id].daily);
      }

      this.$lis[id]
      .data("id", id)
      .data("date", newItem.date)
      .data("dataKey", this.data.length - 1);

      this.$lbody.append(this.$lis[id]);
    });

    this.$total.html(formatCurrency(this.costTotal));

    // TODO: average cost
  }
  render() {
    this.$cont = $("<div></div>")
    .addClass("list-insert")
    .addClass("list-" + this.page)
    .addClass("list");

    this.$total = $("<span></span>");

    this.$lhead = $("<div></div>")
    .addClass("list-head")
    .addClass("noselect");

    for (const j of this.colEdit) {
      this.$lhead.append($("<span></span>").addClass(this.col[j]).text(this.col[j]));
    }

    if (this.dailyColumn) {
      this.$lhead.append(
        $("<span></span>").addClass("daily").text("Daily Tally")
      );
    }

    this.$lhead.append(
      $("<span></span>").text("Total: ")
    ).append(this.$total);

    this.$cont.append(this.$lhead);

    this.$lbody = $("<ul></ul>").addClass("list-ul");

    this.$liAdd = $("<li></li>").addClass("li-add");

    this.$li = {};
    this.$lis = {};

    this.$addInput = {};

    for (const j of this.colEdit) {
      const col = this.col[j];

      if (!col.name || col.edit) {
        const suggestion = this.dataType[j] === "text"
          ? { page: this.page, col } : null;

        this.$addInput[col] = $("<span></span>")
          .addClass(col)
          .editable(
            this.api, this.state,
            () => {},
            this.dataType[j],
            suggestion,
            { val: this.addDefaultVal[col] }
          );

        this.$liAdd.append(this.$addInput[col]);
      }
    }

    this.$addButton = $("<button></button>")
    .text("Add")
    .on("click", () => this.addNew())
    ;

    this.$addButtonCont = $("<span></span>")
    .append(this.$addButton);

    this.$liAdd.append(this.$addButtonCont);

    this.$lbody.append(this.$liAdd);

    this.$cont.append(this.$lbody);

    if (this.limit) {
      this.$lbody[0].addEventListener(
        "mousewheel",
        () => this.handleScroll(),
        { passive: true }
      );

      this.$lbody[0].addEventListener(
        "scroll",
        () => this.handleScroll()
      );
    }

    this.$page.append(this.$cont);
  }
  addNew() {
    this.$addButton.attr("disabled", true);

    const data = {};
    const dataVal = {};

    for (const j of this.colEdit) {
      const col = this.col[j];

      const val = validateInput(
        this.$addInput[col].editable.$input.val(), col
      );

      let error = false;

      if (col === "item" && val.length === 0) {
        this.state.error.newMessage("Must enter text for main item field", 1, MSG_TIME_WARN);
        error = true;
      }

      if (val === null) {
        this.state.error.newMessage("Must enter valid data", 1, MSG_TIME_WARN);
        error = true;
      }

      if (error) {
        this.$addButton.attr("disabled", false);
        return;
      }

      data[col] = val.toString();

      dataVal[col] = val;
    }

    this.api.request(
      "add/" + this.page, "POST", data,
      res => this.onNewAdded(dataVal, res),
      null,
      () => this.onNewRequestComplete()
    );
  }
  onNewAdded(data, response) {
    const newItem = { I: response.id };

    let i = 0;
    for (const j of this.colEdit) {
      const col = this.col[j];

      this.$addInput[col].editable.$input.val(
        this.addDefaultVal[col]
      );

      newItem[this.colShort[i++]] = data[col];
    }

    const newData = [newItem];

    this.costTotal = parseInt(response.total, 10);

    this.update(newData);

    this.$addInput.date.editable.$input.val(today.format()).focus();

    this.updatePieChart();
  }
  onNewRequestComplete() {
    this.sortByDate();

    this.$addButton.attr("disabled", false);
  }
  submitEdit(id, key, val, callback) {
    const postData = { id };

    postData[key] = val.toString();

    const dataKey = this.state.editing.$elem.parent().data("dataKey");

    this.api.request(
      "update/" + this.page, "POST", postData,
      res => this.onSubmitEdited(id, dataKey, key, val, res),
      () => this.onSubmitError(),
      () => this.onSubmitRequestComplete(dataKey, key, callback)
    );
  }
  hookCalculate() {
    this.calculateDaily();
  }
  onSubmitEdited(id, dataKey, key, val, data) {
    this.data[dataKey][key] = val;

    this.$li[id][key].data("val", val);

    if (key === "date") {
      this.$lis[id]
        .toggleClass("future", val.isAfter(today))
        .data("date", data.val);
    }

    this.costTotal = parseInt(data.total, 10);

    this.$total.html(formatCurrency(this.costTotal));

    this.hookCalculate();

    this.updatePieChart();
  }
  onSubmitError() {
    this.state.error.newMessage("Error updating value! (Server error)", 2, MSG_TIME_ERROR);
  }
  onSubmitRequestComplete(dataKey, key, callback) {
    this.state.editing.deactivate(this.data[dataKey][key]);

    if (key === "date") {
      this.sortByDate();
    }

    if (typeof callback === "function") {
      callback();
    }
  }
  sortByDate() {
    this.$lbody.children("li:not(.li-add)").sort((a, b) => {
      const dateA = $(a).data("date");
      const dateB = $(b).data("date");

      if (dateA.isEqual(dateB)) {
        return $(a).data("id") < $(b).data("id") ? 1 : -1;
      }

      return dateA.isAfter(dateB) ? -1 : 1;
    }).appendTo(this.$lbody);

    this.calculateDaily();
  }
  listEditCallback(j) {
    return callback => {
      this.triggerListEdit(this.col[j], this.dataType[j], callback);
    };
  }
  increaseLimit() {
    if (this.loading || this.offset < 0) {
      return;
    }

    this.offset++;

    this.loadData(null, false, true, true);
  }
  calculateDaily() {
    if (!this.dailyColumn) {
      return;
    }

    let tally = 0;

    this.$lbody.children("li:not(.li-add)").each((i, li) => {
      const id = $(li).data("id");

      tally += this.$li[id].cost.data("val");

      const dateA = $(li).data("date");
      const dateB = $(li).next().data("date");

      const lastInDate = !(dateB && dateA.isEqual(dateB));

      this.$li[id].daily.html(lastInDate ? formatCurrency(tally) : "");

      if (lastInDate) {
        tally = 0;
      }
    });
  }
  updatePieChart() {
    if (!this.drawPie) {
      return;
    }

    this.api.request(
      "pie/" + this.page, "GET", null,
      this.onPieUpdated.bind(this),
      null,
      null
    );
  }
  onPieUpdated(res) {
    let loadedBefore = true;

    if (!this.pie) {
      loadedBefore = false;

      this.pie = [];
    }

    let item;

    if (loadedBefore) {
      let i = 0;
      for (item of res.data) {
        this.pie[i].data  = item.data;
        this.pie[i].total = item.total;
        this.pie[i].title = item.title;

        ++i;
      }
    }
    else {
      for (item of res.data) {
        this.createPieChart(item);
      }
    }

    this.updatePieChartGraph();
  }
  createPieChart(data) {
    this.pie.push(new PieGraph({
      width:  this.pieWidth,
      height: this.pieHeight,
      $cont:  this.$graphs,
      page:   this.page,
      title:  data.title,
      index:  this.pie.length,
      data,
      stretchFactor:  this.stretchFactor,
      pieTolerance:   this.pieTolerance,
      pieLabelLength: this.pieLabelLength
    }));
  }
  updatePieChartGraph() {
    for (const pie of this.pie) {
      pie.draw();
    }
  }

  handleScroll() {
    const scrollTop = $(document.body).scrollTop();

    const windowHeight = $(window).height();

    const offsetTop = this.$lbody.offset().top;

    const listHeight = this.$lbody.height();

    const scrolledToBottom = scrollTop + windowHeight - offsetTop >= listHeight - 100;

    if (scrolledToBottom) {
      this.increaseLimit();
    }
  }

  /*
   * called when the user triggers an edit
   * submits an AJAX call via submitEdit() if the value has changed
   *
   * @param callback:
   */
  triggerListEdit(column, type, callback) {
    const dataKey = this.state.editing.$elem.parent().data("dataKey");

    const status = afterEditValidateCompare(
      this.state.editing.$input.val(), this.data[dataKey][column], type
    );

    if (!status) {
      // invalid data input
      this.state.error.newMessage("invalid data input", 1, MSG_TIME_WARN);

      this.state.editing.cancel();
    }
    else {
      if (status.changed) {
        const id = this.state.editing.$elem.parent().data("id");

        this.submitEdit(id, column, status.val, callback);

        return;
      }

      this.state.editing.deactivate(status.val);
    }

    if (typeof callback === "function") {
      callback();
    }
  }
}

