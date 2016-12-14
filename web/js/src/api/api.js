/**
 * API methods
 */

import $ from "lib/jquery.min";

import { MSG_TIME_WARN, MSG_TIME_ERROR } from "const";

import User from "api/user";

export class Api {
  constructor(state) {
    this.user = new User(this, state);
    this.apiUrl = "api?t=";

    this.queuedMain = 0;
    this.queuedMinor = 0;

    // make loader
    this.$spinner = $("<div></div>").addClass("progress-outer");

    const $spinnerInner = $("<div></div>").addClass("progress-inner");

    const $spinnerElem = $("<div></div>")
    .addClass("progress")
    .append($("<div></div>").text("Loading..."));

    $spinnerInner.append($spinnerElem);

    this.$spinner.append($spinnerInner);

    $(document).ready(() => {
      $(document.body)
      .append(this.$spinner);
    });
  }

  incrementRequestQueue(interrupt) {
    if (interrupt) {
      if (!this.queuedMain & ++this.queuedMain > 0) {
        this.$spinner.show();
      }
    }
    else if (!this.queuedMinor & ++this.queuedMinor > 0) {
      $(document.body).addClass("wait");
    }
  }

  decrementRequestQueue(interrupt) {
    if (interrupt) {
      if (this.queuedMain & !--this.queuedMain) {
        this.$spinner.hide();
      }
    }
    else if (this.queuedMinor & !--this.queuedMinor) {
      $(document.body).removeClass("wait");
    }
  }

  request(path, type, params, success, error, complete, interrupt) {
    this.incrementRequestQueue(interrupt);

    const apiKey = this.user.apiKey || null;
    $.ajax({
      url: this.apiUrl + path,
      type,
      dataType: "json",
      data: params,
      context: this,
      beforeSend: (xhr) => {
        if (apiKey) {
          xhr.setRequestHeader("Authorization", apiKey);
        }
      },
      success: (data) => {
        if (data && data.error === false) {
          if (success) {
            success(data);
          }
        }
        else {
          errorMessages.newMessage(data.errorText, 1, MSG_TIME_WARN);
          if (error) {
            error(data.errorText);
          }
        }
      },
      error: () => {
        errorMessages.newMessage("General API error!", 2, MSG_TIME_ERROR);
        if (error) {
          error();
        }
      },
      complete: () => {
        this.decrementRequestQueue(interrupt);

        if (complete) {
          complete();
        }
      }
    });
  }
}

export class GoogleFinanceAPI {
  constructor() {
  }

  get(symbolsList, success, error, complete) {
    const symbols = symbolsList.join(",");

    $.ajax({
      url: "https://www.google.com/finance/info?client=ig&q=" + symbols + "&callback=?",
      type: "GET",
      data: { q: symbols },
      dataType: "json",
      success,
      error,
      complete
    });
  }
}

