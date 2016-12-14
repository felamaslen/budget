/**
 * Search the database using the API
 */

import $ from "../../lib/jquery.min";

import { SEARCH_SUGGESTION_THROTTLE_TIME } from "const";

export class AutoSearch {
  constructor(api, $input, page, col) {
    this.api = api;

    this.$input = $input;

    this.page = page;
    this.col = col;

    this.range = 0;
    this.typedVal = "";
    this.suggestion = null;

    this.numSuggestions = 1;

    this.loading = false;

    this.$spinner = $("<div></div>")
    .addClass("progress")
    .addClass("progress-tiny")
    .append($("<div></div>").text("Loading..."))
    .hide();

    this.timer = null;
    this.throttleTime = SEARCH_SUGGESTION_THROTTLE_TIME;

    this.cache = {};

    this.$input
    .on("input", () => this.input())
    .on("keydown", evt => {
      switch (evt.key) {
      case "Tab":
        this.onTab(evt);
        break;
      case "Escape":
        this.onEscape(evt);
        break;
      default:
        this.onKey(evt);
      }
    })
    .on("blur", () => {
      this.cache = {};
    });

    this.$input.parent().append(this.$spinner);
  }

  onKey() {
  }
  onTab() {
    this.$input.val(this.suggestion);
  }
  onEscape(evt) {
    if (this.cancel()) {
      evt.stopPropagation();
    }
  }

  cancel() {
    this.$input.val(this.typedVal);

    if (!this.suggestion) {
      return false;
    }

    this.suggestion = null;

    return true;
  }
  input() {
    this.range = this.$input[0].selectionStart;

    const val = this.$input.val().substring(0, this.range);

    this.suggestion = val;

    this.typedVal = val;

    this.loadSuggestion();
  }

  loadSuggestion() {
    if (this.typedVal.length === 0) {
      if (this.timer) {
        window.clearTimeout(this.timer);
      }

      this.cancel();
    }

    if (this.cache[this.typedVal]) {
      this.suggestionsLoaded(this.cache[this.typedVal], this.typedVal);
    }
    else {
      if (this.loading) {
        return;
      }

      if (this.timer) {
        window.clearTimeout(this.timer);
      }

      this.timer = window.setTimeout(() => {
        const val = this.typedVal;

        if (val.length === 0) {
          return;
        }

        this.loading = true;

        this.$spinner.show();

        const args = [
          "data", "search", this.page, this.col, val, this.numSuggestions
        ];

        this.api.request(
          args.join("/"), "GET", null,
          res => this.suggestionsLoaded(res.data, val),
          () => this.suggestionsError(),
          () => this.suggestionsComplete(),
          false
        );
      }, this.throttleTime);
    }
  }
  gotSuggestions(terms) {
    const term = terms[0];

    this.suggestion = term;

    this.$input.val(term);

    this.$input[0].setSelectionRange(this.range, this.range);
  }
  suggestionsLoaded(terms, oldVal) {
    if (!terms || terms.length === 0) {
      this.cancel();
    }
    else {
      this.cache[oldVal] = terms;

      this.gotSuggestions(terms);
    }
  }
  suggestionsError() {
    console.error("Error loading suggestions!");
  }
  suggestionsComplete() {
    this.$spinner.hide();

    this.loading = false;
  }
}

export class AutoSearchDropdown extends AutoSearch {
  constructor(api, $input, page, col) {
    super(api, $input, page, col);

    this.numSuggestions = 5;
    this.suggestions = [];
    this.activeSuggestion = -1;
    this.listShown = false;
    this.$list = null;
  }

  onKey(evt) {
    if (this.listShown) {
      let delta = 1;

      let didSomething = true;

      switch (evt.key) {
      case "ArrowUp":
        delta *= -1;
      case "ArrowDown":
        this.selectNextSuggestion(delta);

        break;

      case "Enter":
        this.replaceWithCurrentSuggestion();

        break;

      default:
        didSomething = false;
      }

      if (didSomething) {
        evt.stopPropagation();
      }
    }
  }
  onTab(evt) {
    if (this.listShown) {
      this.selectNextSuggestion(1);

      evt.preventDefault();
      evt.stopPropagation();
    }
  }
  onEscape() {
    this.cancel();
  }

  cancel() {
    this.suggestions = [];

    if (!this.listShown) {
      return false;
    }

    this.hideList();

    return true;
  }
  input() {
    this.typedVal = this.$input.val();

    this.loadSuggestion();
  }

  gotSuggestions(terms) {
    if (!this.$list) {
      this.buildList();
    }

    this.suggestions = terms;

    this.$list.empty();

    for (const term of this.suggestions) {
      const $li = $("<li></li>")
      .addClass("suggestion").text(term)
      .mouseenter(() => {
        this.selectSuggestion($li.index());
      });

      this.$list.append($li);
    }

    this.showList();
  }
  buildList() {
    this.$list = $("<ul></ul>")
    .addClass("suggestions")
    .mousedown(evt => {
      this.replaceWithCurrentSuggestion();

      evt.stopPropagation();
    });

    this.$input.after(this.$list);
  }
  showList() {
    if (!this.listShown) {
      this.$list.addClass("active");
      this.listShown = true;
    }

    this.activeSuggestion = -1;
  }
  hideList() {
    if (this.listShown) {
      this.$list.removeClass("active");
      this.listShown = false;
    }
  }
  selectSuggestion(newIndex) {
    if (this.activeSuggestion > -1) {
      this.$list.children().eq(this.activeSuggestion).removeClass("active");
    }

    if (newIndex > -1) {
      this.$list.children().eq(newIndex).addClass("active");
    }
    else {
      this.$input.focus();
    }

    this.activeSuggestion = newIndex;
  }
  selectNextSuggestion(direction) {
    const newIndex = (
      this.activeSuggestion + 1 + direction + this.suggestions.length + 1
    ) % (this.suggestions.length + 1) - 1;

    this.selectSuggestion(newIndex);
  }
  replaceWithCurrentSuggestion() {
    if (this.activeSuggestion > -1) {
      this.$input.val(this.suggestions[this.activeSuggestion]);

      this.cancel();
    }
  }
}

