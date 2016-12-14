/**
 * Handles CSS media queries, where relevant
 */

export default class {
  constructor() {
    this.mqlNarrow = window.matchMedia("(max-width: 1500px)");

    this.callbackNarrow = [];
    this.callbackWide = [];

    this.mqlNarrow.addListener(mediaQueryList => {
      this.handleChange(mediaQueryList);
    });
  }

  narrow(callback) {
    this.callbackNarrow.push(callback);

    return this;
  }

  wide(callback) {
    this.callbackWide.push(callback);

    return this;
  }

  handleChange(queryList) {
    if (queryList.matches) {
      // window is narrow
      this.callbackNarrow.forEach(callback => callback());
    }
    else {
      // window is wide
      this.callbackWide.forEach(callback => callback());
    }
  }

  trigger() {
    this.handleChange(this.mqlNarrow);
  }
}

