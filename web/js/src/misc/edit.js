/**
 * Form stuff
 */

import $ from "lib/jquery.min";

import { MSG_TIME_DEBUG } from "const";

import { YMD, today } from "misc/date";
import { formatCurrency } from "misc/format";
import { AutoSearchDropdown } from "misc/search";

export function validateDateInput(val) {
  const isDate = val.match(/^[0-3]?[0-9]\/[0-1]?[0-9](\/[0-9]{2}([0-9]{2})?)?$/);

  if (!isDate) {
    errorMessages.newMessage("\"" + val + "\" isn\"t a date", 0, MSG_TIME_DEBUG);

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
    errorMessages.newMessage("\"" + val.toString() + "\" isn\"t a number", 0, MSG_TIME_DEBUG);

    return null;
  }

  return Math.round(floatVal * 100);
}
export function validateInput(val, type) {
  switch (type) {
  case "date":
    return validateDateInput(val);
  case "cost":
    return validateCurrencyInput(val);
  default:
    return val;
  }
}
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

class InlineEdit {
  constructor(options, api, state) {
    this.api = api;
    this.state = state;
    options = options || {};

    this.$input   = options.$input;
    this.$elem    = options.$elem;
    this.editHook = options.editHook;
    this.type     = options.type;

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
      // errorMessages.newMessage("Tried to finish editing while not active");
      return false;
    }

    if (this.locked) {
      // probably still loading previous edit request
      errorMessages.newMessage("Tried to finish editing while locked", 0, MSG_TIME_DEBUG);
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

    errorMessages.newMessage("Tried to finish editing while no hook set", 0, MSG_TIME_DEBUG);

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
    $input: $("<input type=text />")
      .addClass("editable-input")
      .addClass("editable-" + type),
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

