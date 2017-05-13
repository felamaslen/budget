/**
 * Form stuff
 */

import $ from "../../lib/jquery.min";

import { MSG_TIME_DEBUG } from "const";

import { YMD, today } from "misc/date";
import { formatCurrency, TransactionsList } from "misc/format";
import { AutoSearchDropdown } from "misc/search";

function validateDateInput(val) {
  const isDate = val.match(/^[0-3]?[0-9]\/[0-1]?[0-9](\/[0-9]{2}([0-9]{2})?)?$/);

  if (!isDate) {
    console.warn(val, "isn't a date");
    return null;
  }

  let year;
  const split = val.split("/");
  if (split.length < 3) {
    year = today.year;
  }
  else {
    year = parseInt(split[2], 10);

    if (year < 100) {
      year += 2000;
    }
  }

  const month = parseInt(split[1], 10);
  const date = parseInt(split[0], 10);
  return new YMD(year, month, date);
}
export function validateCurrencyInput(val) {
  const floatVal = parseFloat(val);

  if (isNaN(floatVal) || val.match(/[A-Za-z]/)) {
    console.warn(val, "isn't a number");
    return null;
  }

  return Math.round(floatVal * 100);
}
function validateTransactionsInput(val) {
  let raw;
  if (!val.length) {
    raw = [];
  }
  else {
    try {
      raw = JSON.parse(val);
    }
    catch (e) {
      console.warn(val, "isn't valid JSON");
      return null;
    }
    finally {
      if (!Array.isArray(raw)) {
        console.warn(val, "isn't a list");
        return null;
      }
      raw = raw.map(item => {
        if (!item || !item.d || !item.d.match(/^[0-9]{4},[0-9]{1,2},[0-9]{1,2}$/) ||
            !item.u || !item.c || !validateCurrencyInput(item.c.toString())) {
          console.warn(val, "isn't a valid transactions list");
          return null;
        }

        return {
          d: item.d.split(",").map(component => parseInt(component, 10)),
          u: item.u,
          c: item.c
        };
      });
    }
  }

  return new TransactionsList(raw);
}

/**
 * convert user input data to application data
 * @param {string} val: raw input
 * @param {string} type: data type string
 * @returns {object}: validated application data
 */
export function validateInput(val, type) {
  switch (type) {
  case "date":
    return validateDateInput(val);
  case "cost":
    return validateCurrencyInput(val);
  case "transactions":
    return validateTransactionsInput(val);
  default:
    return val;
  }
}

/**
 * validate user input
 * @param {string} val: raw input
 * @param {mixed} compare: application data
 * @param {string} type: data type string
 * @return {object}: new value and changed status
 */
export function afterEditValidateCompare(val, compare, type) {
  val = validateInput(val, type);

  if (val === null) {
    return null;
  }

  let changed = false;

  switch (type) {
  case "date":
    changed = !(val.isEqual(compare));
    break;
  case "cost":
  case "text":
  case "text_nosug":
  default:
    changed = val !== compare;
  }

  return { val, changed };
}

class TransactionsModalDialog {
  constructor() {
    this.$elem = $("<div></div>").addClass("modal");
    this.$elem.hide();

    const $inner = $("<div></div>").addClass("inner");
    const $listTable = $("<table></table>");

    const $listHead = $("<thead></thead>")
    .append($("<tr></tr>")
      .append("<th>Date</th>")
      .append("<th>Units</th>")
      .append("<th colspan=2>Cost</th>"));

    this.$list = $("<tbody></tbody>");
    this.list = [];
    this.transactions = new TransactionsList([]);

    const $addDate = $("<input></input>").val(today.format());
    const $addUnits = $("<input></input>");
    const $addCost = $("<input></input>");
    const $addBtn = $("<button></button>").text("+");
    $addBtn.on("click", () => {
      this.list.push({
        $date: $("<input></input>").val($addDate.val()),
        $units: $("<input></input>").val($addUnits.val()),
        $cost: $("<input></input>").val($addCost.val())
      });
      $addDate.val(today.format());
      $addUnits.val("");
      $addCost.val("");
      this.renderForm();
    });
    const $addBar = $("<tbody></tbody>")
    .append($("<tr></tr>")
      .append($("<td></td>").append($addDate))
      .append($("<td></td>").append($addUnits))
      .append($("<td></td>").append($addCost))
      .append($("<td></td>").append($addBtn))
    );

    $listTable.append($listHead);
    $listTable.append(this.$list);
    $listTable.append($addBar);

    this.renderForm();

    $inner.append($listTable);
    this.$elem.append($inner);

    this.hookCancel = [];
    const $cancel = $("<button></button>").text("Cancel");
    $cancel.on("click", () => {
      this.update(this.transactions);
      this.hookCancel.forEach(hook => hook());
      this.$elem.hide();
    });

    this.hookConfirm = [];
    const $confirm = $("<button></button>").text("Confirm");
    $confirm.on("click", () => {
      const transactions = this.getData();
      if (transactions) {
        this.transactions = transactions;
      }
      this.update(this.transactions);
      this.hookConfirm.forEach(hook => hook(this.transactions, !!transactions));
      this.$elem.hide();
    });

    $inner.append($cancel).append($confirm);
  }
  renderForm() {
    this.$list.empty();
    this.list.forEach((item, key) => {
      const $row = $("<tr></tr>")
      .append($("<td></td>").append(item.$date))
      .append($("<td></td>").append(item.$units))
      .append($("<td></td>").append(item.$cost));

      const $deleteBtn = $("<button></button>").text("-").on("click", () => {
        this.list.splice(key, 1);
        $row.remove();
      });
      $row.append($("<td></td>").append($deleteBtn));

      this.$list.append($row);
    });
  }
  update(transactions) {
    this.list = transactions.list.map(transaction => {
      return {
        $date: $("<input></input>").val(transaction.date.format()),
        $units: $("<input></input>").val(transaction.units),
        $cost: $("<input></input>").val((transaction.cost / 100).toString())
      };
    });
    this.renderForm();
    this.transactions = transactions;
  }
  getData() {
    // gets application data from form elements
    let valid = true;
    const list = this.list.map(item => {
      const date = validateInput(item.$date.val(), "date");
      const units = validateInput(item.$units.val(), "units");
      const cost = validateInput(item.$cost.val(), "cost");

      if (!date || !units || !cost) {
        valid = false;
        return null;
      }

      return { d: date, u: units, c: cost };
    });

    if (!valid) {
      return null;
    }

    return new TransactionsList(list, true);
  }
}

class InlineEdit {
  constructor(options, api, state) {
    this.api = api;
    this.state = state;
    options = options || {};

    this.$elem = options.$elem;
    this.editHook = options.editHook;
    this.type = options.type;

    this.$input = $("<input type=text />")
      .addClass("editable-input")
      .addClass("editable-" + this.type);

    this.isTransactions = this.type === "transactions";
    if (this.isTransactions) {
      this.$input.hide();
      const transactions = this.$elem.data("val");
      this.transactionsDialog = new TransactionsModalDialog();
      this.$elem.append(this.transactionsDialog.$elem);

      if (transactions && transactions.list) {
        this.transactionsDialog.update(transactions);
      }

      const $buttonTransactions = $("<button></button>")
      .text(transactions ? transactions.num : "Add...")
      .on("click", () => {
        this.transactionsDialog.$elem.show();
      });
      this.$elem.append($buttonTransactions);

      this.transactionsDialog.hookCancel.push(() => {
        this.active = false;
      });
      this.transactionsDialog.hookConfirm.push((data, changed) => {
        this.$elem.data("val", data);
        this.$input.val(data.toString());
        $buttonTransactions.text(
          data.num > 0 ? data.num.toString() : "Add...");
        this.active = changed;
      });

      this.transactionsDialog.$elem.on("mouseup", evt => evt.stopPropagation());
    }

    this.hideInput();

    const suggestion = options.suggestion;

    this.locked = false;
    this.active = false;
    this.clicked = false;

    if (this.$elem) {
      this.$elem.on("mousedown", evt => this.finishLastAndActivate(evt));

      // these two events prevent a click action on the input itself from triggering an edit
      this.$input.on("mouseup", evt => this.unlock(evt));
      this.$input.on("mousedown", evt => {
        this.clicked = true;
        this.lock(evt);
      });

      this.$elem.append(this.$input).addClass("editable");

      if (suggestion) {
        this.searchHandler = new AutoSearchDropdown(
          this.api, this.$input, suggestion.page, suggestion.col
        );
      }
    }
  }
  showInput() {
    this.$input && this.$input.show();
  }
  hideInput() {
    this.searchHandler && this.searchHandler.cancel();
  }
  activate() {
    this.state.editing = this;

    if (this.isTransactions) {
      return;
    }

    let val = this.$elem.data("val");
    switch (this.type) {
    case "date":
      val = val.format();
      break;
    case "cost":
      val = (val / 100).toFixed(2);
      break;
    }

    this.$input.val(val);
    this.showInput();
    this.$elem.addClass("editing");
    this.$input.focus();
    this.active = true;
  }

  /**
   * called when navigating with the keys, pressing enter, or on window.mouseup
   *
   * @param {function} callback: what to do after the edit has completed (e.g. after AJAX call completes)
   *
   * @return {boolean} editing submit handler was run
   */
  finish(callback) {
    if (!this.active) {
      // this.state.error.newMessage("Tried to finish editing while not active");
      return false;
    }

    if (this.locked) {
      // probably still loading previous edit request
      this.state.error.newMessage("Tried to finish editing while locked", 0, MSG_TIME_DEBUG);
      return false;
    }

    if (this.searchHandler && this.searchHandler.timer) {
      window.clearTimeout(this.searchHandler.timer);
    }

    if (this.editHook) {
      this.lock();

      this.editHook(callback);

      return true;
    }

    this.state.error.newMessage("Tried to finish editing while no hook set", 0, MSG_TIME_DEBUG);

    return false;
  }
  cancel() {
    this.unlock();
    this.hideInput();

    this.$elem && this.$elem.removeClass("editing");

    if (!this.active) {
      return false;
    }

    this.active = false;

    return true;
  }
  finishLastAndActivate(evt) {
    // this is called when the user does something like click away from the edit box
    if (this.state.editing.active) {
      // there is still an item being edited, let's finish that one first
      this.state.editing.finish(() => this.activate());
    }
    else {
      // no item was being edited beforehand, so just activate this one
      this.activate();
    }
    evt.stopPropagation();
  }
  deactivate(newValRaw) {
    let newVal = newValRaw;

    switch (this.type) {
    case "date":
      newVal = newVal.format();
      break;
    case "cost":
      newVal = formatCurrency(newVal);
      break;
    }

    this.$elem.parent().data(this.type, newValRaw);
    this.hideInput();
    this.$elem.removeClass("editing").children(".text").html(newVal);
    this.unlock();
    this.active = false;
  }
  lock(evt) {
    this.locked = true;

    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
    }
  }
  unlock(evt) {
    this.locked = false;

    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
    }
  }
}

export class EditItem extends InlineEdit {
  constructor(options, api, state) {
    super(options, api, state);

    if (this.isTransactions) {
      this.transactionsDialog.hookConfirm.push(() => {
        this.finish();
      });
    }
  }

  hideInput() {
    super.hideInput();

    this.$input && this.$input.hide();
  }
}

export class AddItem extends InlineEdit {
  constructor(options, api, state) {
    super(options, api, state);

    this.$input.on("focus", () => {
      this.state.editingAdd = true;

      if (state.editing && state.editing.cancel) {
        state.editing.cancel();
      }
    })
    .on("blur", () => {
      this.state.editingAdd = false;

      if (this.searchHandler && this.searchHandler.timer) {
        window.clearTimeout(this.searchHandler.timer);
      }
    })
    .val(options.add.val);
  }

  showInput() {
  }

  cancel() {
  }
}

export function editable(api, state, editHook, type, suggestion, add) {
  if (type.indexOf("text") === 0) {
    type = "text";
  }

  const options = {
    $elem: $(this),
    editHook,
    type,
    suggestion,
    add
  };

  this.editable = add
    ? new AddItem(options, api, state)
    : new EditItem(options, api, state);

  return this;
}

