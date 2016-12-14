/**
 * Error messages
 */

import $ from 'lib/jquery.min';

import { MIN_MSG_LEVEL } from 'const';

class ErrorMessage {
  constructor(text, level, timeout) {
    this.text = text;
    this.level = level;

    this.timeout = timeout;

    this.$elem = $("<div></div>")
    .addClass("message")
    .addClass("message-" + level)
    .append($("<span></span>").text(text));

    this.setCloseTimer();

    this.$elem.on("mouseover", () => {
      this.stopCloseTimer();
    }).on("mouseout", () => {
      this.setCloseTimer();
    }).on("click", () => {
      this.hide();
    });
  }

  setCloseTimer() {
    this.stopCloseTimer();

    this.timer = this.timeout ? window.setTimeout(() => {
      this.hide();
    }, this.timeout) : null;
  }

  stopCloseTimer() {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
  }

  hide() {
    this.$elem.addClass("hidden");
    // wait for CSS transition to remove message
    window.setTimeout(() => {
      this.$elem.remove();
    }, 1000);
  }
}

export default class {
  constructor() {
    this.$outer = $("<div></div>").addClass("messages-outer");

    $(document.body).append(this.$outer);

    this.levels = ["debug", "warning", "error", "fatal"];
  }

  newMessage(text, level, timeout) {
    if (typeof level === "undefined") {
      level = 1;
    }

    if (level < MIN_MSG_LEVEL) {
      return;
    }

    const message = new ErrorMessage(text, this.levels[level], timeout);

    this.$outer.append(message.$elem);
  }
}

