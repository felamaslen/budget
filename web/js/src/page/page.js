/**
 * General page class
 */

import $ from "lib/jquery.min";

export default class {
  constructor(options, api, state) {
    this.api = api;
    this.state = state;
    this.page = options.page;
    this.$page = $("<div></div>")
    .attr("id", "page-" + this.page)
    .addClass("page")
    .addClass("page-loading");

    $("#doc-inner").append(this.$page);

    this.data = null;
    this.loading = false;
  }

  hookDataAddArgs(args) {
    return args;
  }

  hookDataLoadedBeforeRender() {
  }
  hookDataLoadedAfterRender() {
  }

  hookSwitchToCallback() {
  }
  hookSwitchToAfterLoad() {
  }

  loadData(callback, render, changed, extra) {
    if (this.loading) {
      return;
    }

    if (this.data && !changed) {
      if (callback) {
        callback();
      }
    }
    else {
      this.loading = true;
      this.data = [];

      const args = this.hookDataAddArgs(["data", this.page]);

      const query = this.query || null;

      this.api.request(
        args.join("/"), "GET", query,
        res => this.onDataLoaded(callback, render, res),
        null,
        () => this.onRequestComplete(),
        !extra
      );
    }
  }

  onDataLoaded(callback, render, res) {
    this.$page.removeClass("page-loading");

    this.hookDataLoadedBeforeRender(callback, res);

    if (render) {
      this.render();
    }

    this.hookDataLoadedAfterRender(callback, res);

    if (callback) {
      callback();
    }
  }
  onRequestComplete() {
    this.loading = false;
  }

  switchTo(pageExists) {
    this.loadData(() => this.hookSwitchToAfterLoad(), !pageExists);

    this.hookSwitchToCallback(pageExists);
  }

  render() {
  }
}

