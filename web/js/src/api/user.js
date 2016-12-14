/**
 * Handles user login
 */

import $ from "../../lib/jquery.min";

import { E_NO_STORAGE, NAV_HANDLE_EVENT } from "const";

class NumberInput {
  constructor(callback) {
    this.callback = callback;

    this.$elem = $("<div></div>").addClass("number-input");

    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(digit => {
      const $digit = $("<button></button>")
      .addClass("btn-digit")
      .addClass("btn-digit-" + digit.toString())
      .text(digit.toString());

      this.$elem.append($digit);

      $digit.on("click", () => callback(digit));
    });
  }
}

export default class {
  constructor(api, state) {
    this.api = api;
    this.state = state;

    this.$input = null;
    this.$form = null;

    this.inputActive = -1;
    this.loginPin;

    this.loggingIn = false;

    this.uid = 0;
    this.name = "";
    this.apiKey = null;
  }

  addNumInput() {
    this.numInput = new NumberInput(val => this.inputKey(val));

    this.$form.append(this.numInput.$elem.addClass("noselect"));
  }

  keyDown(evt) {
    if (!this.uid) {
      if (this.inputActive === -1) {
        return;
      }

      let val = parseInt(evt.key, 10);
      if (isNaN(val)) {
        return;
      }
      val = Math.min(9, Math.max(0, val));

      this.inputKey(val);
    }
  }

  inputKey(val) {
    this.loginPin += Math.pow(10, 3 - this.inputActive) * val;

    this.$input.slice(this.inputActive, this.inputActive + 1)
    .addClass("done").removeClass("active");

    if (this.inputActive < 3) {
      this.inputActive++;

      this.$input.slice(this.inputActive, this.inputActive + 1)
      .addClass("active");
    }
    else {
      this.login();
    }
  }

  init($input, $form) {
    this.$input = $input;
    this.$form = $form;

    this.addNumInput();

    $(window).on("keydown", evt => { this.keyDown(evt); });

    let focusLogin = true;

    // check if we have a localStorage user defined
    const loginPin = localStorage ? localStorage.getItem("userPin") : null;

    if (loginPin) {
      focusLogin = false;
      this.loginPin = loginPin;
      this.login();
    }

    this.$input.on("click", evt => this.handleInputClick(evt));

    if (focusLogin) {
      this.focus();
    }
  }

  focus() {
    this.$form.fadeIn();

    this.inputActive = 0;
    this.loginPin = 0;

    this.$input.removeClass("active").removeClass("done");
    this.$input.slice(this.inputActive, 1).addClass("active");
  }

  login() {
    if (this.loggingIn) {
      return;
    }
    this.loggingIn = true;

    this.api.request(
      "login", "POST", { pin: this.loginPin },
      data => this.onLoginSuccess(data),
      () => this.onLoginFail(),
      () => this.onLoginRequestComplete(),
      false
    );
  }

  onLoginSuccess(data) {
    this.uid = data.uid;
    this.name = data.name;
    this.apiKey = data.api_key;

    // store api key so we don't need to log in every time
    if (typeof Storage !== "undefined") {
      localStorage.setItem("userPin", this.loginPin);
    }
    else {
      console.warn(E_NO_STORAGE);
    }

    $("#nav-link-" + this.state.currentPage).trigger(NAV_HANDLE_EVENT);

    this.$form.fadeOut();
  }

  onLoginFail() {
    this.logout();
  }

  onLoginRequestComplete() {
    this.loggingIn = false;
  }

  logout() {
    this.uid = 0;
    this.name = "";
    this.apiKey = null;

    localStorage && localStorage.removeItem("userPin");

    for (const id in this.state.pages) {
      this.state.pages[id].$page.remove();
      $("#nav-link-" + id).removeClass("active");
    }
    this.state.pages = {};

    this.state.navActive = null;
    this.state.currentPage = this.state.pageActive;

    $("#bg").fadeIn();
    $("#nav").addClass("hide-nav");

    this.focus();
  }

  handleInputClick(evt) {
    const index = $(evt.target).index() - 1;

    if (index <= this.inputActive) {
      this.loginPin -= this.loginPin % Math.pow(10, 4 - index);

      this.$input.removeClass("active").removeClass("done");

      this.inputActive = index;

      this.$input.slice(0, this.inputActive)
      .addClass("done");

      this.$input.slice(this.inputActive, this.inputActive + 1)
      .addClass("active");
    }
  }
}

