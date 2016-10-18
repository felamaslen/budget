(function Budget($) {
  const PIE_LABEL_RADIUS_START = 1.1;
  const PIE_LABEL_RADIUS_SCALE = 1.2;
  const PIE_LABEL_INSIDE_RADIUS = 0.6;
  const PIE_LABEL_SWITCH_POINT = 0.65;
  const PIE_LABEL_SCALE_FACTOR_PRE = 0.4;
  const PIE_LABEL_SCALE_FACTOR_POST = 1.2;
  const PIE_SMALL_LABEL_OFFSET = 10;

  const SEARCH_SUGGESTION_THROTTLE_TIME = 250;

  const GRAPH_FUND_HISTORY_WIDTH = 600;
  const GRAPH_FUND_HISTORY_TENSION = 0.7;
  const GRAPH_FUND_HISTORY_NUM_TICKS = 10;
  const GRAPH_FUND_HISTORY_LINE_WIDTH = 1.5;
  const GRAPH_FUND_HISTORY_POINT_RADIUS = 3;

  const GRAPH_BALANCE_NUM_TICKS = 5;

  const GRAPH_KEY_SIZE = 12;
  const GRAPH_KEY_OFFSET_X = 5;
  const GRAPH_KEY_OFFSET_Y = 34;

  const COLOR_GRAPH_TITLE = "#000";
  const COLOR_DARK = "#333";
  const COLOR_LIGHT = "#eee";
  const COLOR_LIGHT_GREY = "#999";

  const COLOR_BALANCE_ACTUAL = "#039";
  const COLOR_BALANCE_PREDICTED = "#f00";

  const COLOR_GRAPH_FUND_LINE = "#fffd93";
  const COLOR_GRAPH_FUND_POINT = "#ff9400";

  const COLOR_PIE_L1 = "#f15854";
  const COLOR_PIE_L2 = "#decf3f";
  const COLOR_PIE_L3 = "#b276b2";
  const COLOR_PIE_M1 = "#b2912f";
  const COLOR_PIE_M2 = "#f17cb0";
  const COLOR_PIE_M3 = "#60bd68";
  const COLOR_PIE_S1 = "#faa43a";
  const COLOR_PIE_S2 = "#5da5da";

  const FONT_AXIS_LABEL = "12px Arial, Helvetica, sans-serif";
  const FONT_GRAPH_TITLE = "16px bold Arial, Helvetica, sans-serif";
  const FONT_GRAPH_TITLE_LARGE = "18px bold Arial, Helvetica, sans-serif";
  const FONT_GRAPH_KEY = "13px Arial, Helvetica, sans-serif";
  const FONT_GRAPH_KEY_SMALL = "11px Arial, Helvetica, sans-serif";

  const STOCKS_REFRESH_INTERVAL = 10000;
  const STOCKS_LIST_WIDTH = 400;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  let editingAdd = false;

  let pages = {};
  let pageActive = null;
  let navActive = null;

  let currentPage;

  let graphHidden = false;

  const categoryColors = {
    funds:  [84, 110, 122],
    bills:  [183, 28, 28],
    food:   [67, 160, 71],
    general:  [1, 87, 155],
    holiday:  [0, 137, 123],
    social: [191, 158, 36],
    in:     [36, 191, 55],
    out:    [191, 36, 36],
    net:    [
      [36, 191, 55],
      [191, 36, 36]
    ],
    predicted:  [36, 191, 55],
    balance:    [36, 191, 55]
  };

  const indexPoints = (value, key) => [key, value];

  class MediaQueryHandler {
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

  const windowSize = new MediaQueryHandler();

  function trim(string) {
    while (string.indexOf(" ") === 0) {
      string = string.substring(1);
    }

    while (string.lastIndexOf(" ") === string.length - 1) {
      string = string.substring(0, string.length - 1);
    }

    return string;
  }
  function median(array) {
    const sorted = array.concat().sort();

    const numKeys = sorted.length;

    if (numKeys & 1) {
      // odd
      return sorted[Math.floor(numKeys / 2)];
    }

    // even
    return 0.5 * (
      sorted[numKeys / 2 - 1] + sorted[numKeys / 2]
    );
  }
  function arrayAverage(array, offset) {
    return array.slice(0, -1 * offset).reduce((red, item) => {
      return red + item;
    }) / (array.length - offset);
  }
  function hundredth(item) {
    return item / 100;
  }
  function leadingZeroes(n, base) {
    if (!base) {
      base = 10;
    }

    return (n < base ? "0" : "") + n.toString(base);
  }

  class YMD {
    constructor(year, month, date) {
      this.year = year;
      this.month = month;
      this.date = date;
    }

    toString() {
      return [this.year, this.month, this.date].join(",");
    }

    isAfter(date2) {
      // returns true if date1 is after date2
      return this.year > date2.year || (
        this.year === date2.year && (this.month > date2.month || (
          this.month === date2.month && this.date > date2.date
        ))
      );
    }

    isEqual(date2) {
      return this.year === date2.year &&
        this.month === date2.month &&
        this.date === date2.date;
    }

    format() {
      return leadingZeroes(this.date) + "/" + leadingZeroes(this.month) + "/" +
        this.year;
    }
  }

  const todayDate = new Date();
  const today = new YMD(
    todayDate.getFullYear(),
    todayDate.getMonth() + 1,
    todayDate.getDate()
  );

  function rgb(color) {
    return "#" + color.map((item) => {
      return leadingZeroes(item, 16);
    }).join("");
  }
  function rgba(color, alpha) {
    return "rgba(" + color.join(",") + "," + alpha + ")";
  }
  function getColorFromScore(color, score, negative) {
    if (!color) {
      console.warn("No colour given to getColor!");
      color = [36, 191, 55];
    }

    if (color.length === 2) {
      color = color[negative ? 1 : 0];
    }
    else if (negative) {
      score = 0;
    }

    return rgb(color.map(value => {
      return Math.round(255 - (255 - value) * score);
    }));
  }
  function getTickSize(min, max, numTicks) {
    const minimum = (max - min) / numTicks;

    const magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.log(10)));

    const res = minimum / magnitude;

    let tick;

    if (res > 5) {
      tick = 10 * magnitude;
    }
    else if (res > 2) {
      tick = 5 * magnitude;
    }
    else if (res > 1) {
      tick = 2 * magnitude;
    }
    else {
      tick = magnitude;
    }

    return tick;
  }

  function validateDateInput(val) {
    const isDate = val.match(/^[0-3]?[0-9]\/[0-1]?[0-9](\/[0-9]{2}([0-9]{2})?)?$/);

    if (!isDate) {
      console.warn("\"" + val + "\" isn\"t a date");

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
  function validateCurrencyInput(val) {
    const floatVal = parseFloat(val);

    if (isNaN(floatVal) || val.match(/[A-Za-z]/)) {
      console.warn("\"" + val.toString() + "\" isn\"t a number");

      return null;
    }

    return Math.round(floatVal * 100);
  }
  function validateInput(val, type) {
    switch (type) {
    case "date":
      return validateDateInput(val);
    case "cost":
      return validateCurrencyInput(val);
    default:
      return val;
    }
  }
  function afterEditValidateCompare(val, compare, type) {
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
    default:
      changed = val !== compare;
    }

    return { val, changed };
  }

  function formatAge(seconds) {
    const measures = [
      [1,           "second"],
      [60,          "minute"],
      [3600,        "hour"],
      [86400,       "day"],
      [86400 * 30,  "month"],
      [86400 * 365, "year"]
    ];

    const measure = measures.reverse().filter(item => {
      return seconds >= item[0];
    })[0];

    const rounded = Math.round(seconds / measure[0]);

    const units = measure[1] + (rounded === 1 ? "" : "s");

    return rounded + " " + units + " ago";
  }

  function numberFormat(number) {
    // adds commas to a long number
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function formatCurrency(number, raw, noZeroes, abbreviate) {
    let absValuePounds = Math.abs(number) / 100;

    let abbreviation = "";

    let log = 0;

    const abbr = ["k", "m", "bn", "trn"];

    if (abbreviate && number !== 0) {
      log = Math.min(Math.floor(Math.log(absValuePounds) / Math.log(10) / 3), abbr.length);
    }

    if (log > 0) {
      absValuePounds = Math.round(100 * absValuePounds / Math.pow(10, log * 3)) / 100;

      abbreviation = abbr[log - 1];
    }
    else if (typeof noZeroes === "undefined" || !noZeroes || number === 0) {
      absValuePounds = absValuePounds.toFixed(2);
    }

    return (number < 0 ? "&minus;" : "") + (raw ? "£" : "&pound;")
      + numberFormat(absValuePounds) + abbreviation;
  }
  function formatData(val, type, raw) {
    switch (type) {
    case "date":
      return val.format();
    case "cost":
      return formatCurrency(val, raw);
    default:
      return val;
    }
  }

  function getData(val, type) {
    switch (type) {
    case "date":
      if (typeof val[0] !== "undefined") {
        return new YMD(val[0], val[1], val[2]);
      }

    default:
      return val;
    }
  }

  /**
   * api methods
   */
  class Api {
    constructor() {
      this.apiUrl = "rest.php?t=";

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

    request(path, type, params, apiKey, success, error, complete, interrupt) {
      this.incrementRequestQueue(interrupt);

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
            console.warn("API says: " + data.errorText);
            if (error) {
              error(data.errorText);
            }
          }
        },
        error: () => {
          console.warn("General API error!");
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

  const api = new Api();

  class GoogleFinanceAPI {
    constructor() {
    }

    get(stocks, success, error, complete) {
      const symbols = [];

      for (const symbol in stocks) {
        symbols.push(symbol);
      }

      $.ajax({
        url: "https://www.google.com/finance/info?client=ig&q=" + symbols.join(",") + "&callback=?",
        type: "GET",
        data: { q: symbols.join(",") },
        dataType: "json",
        success,
        error,
        complete
      });
    }
  }

  const finance = new GoogleFinanceAPI();

  class User {
    constructor() {
      this.$input = null;
      this.$form = null;

      this.inputActive = -1;
      this.loginPin;

      this.loggingIn = false;

      this.uid = 0;
      this.name = "";
      this.apiKey = null;
    }

    init($input, $form) {
      this.$input = $input;
      this.$form = $form;

      let focusLogin = true;

      // check if we have a localStorage user defined
      if (typeof Storage !== "undefined") {
        const loginPin = localStorage.getItem("userPin");

        if (loginPin) {
          focusLogin = false;

          this.loginPin = loginPin;

          this.login();
        }
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

      api.request(
        "login", "POST", { pin: this.loginPin }, null,
        data => this.onLoginSuccess(data),
        () => this.onLoginFail(),
        () => this.onLoginRequestComplete(),
        true
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
        console.warn("Your browser does not support HTML5 storage, so logins won't be remembered.");
      }

      $("#nav-link-" + currentPage).mousedown();

      this.$form.fadeOut();
    }

    onLoginFail() {
      this.focus();
    }

    onLoginRequestComplete() {
      this.loggingIn = false;
    }

    logout() {
      this.uid = 0;
      this.name = "";
      this.apiKey = null;

      if (typeof Storage !== "undefined") {
        localStorage.removeItem("userPin");
      }

      for (const id in pages) {
        pages[id].$page.empty();

        $("#nav-link-" + id).removeClass("active");
      }

      pages = {};

      navActive = null;

      currentPage = pageActive;

      $("#bg").fadeIn();

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

  const user = new User();

  let editing = null;

  class InlineEdit {
    constructor(options) {
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
            this.$input, suggestion.page, suggestion.col
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
      editing = this;

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
        // console.warn("Tried to finish editing while not active");
        return false;
      }

      if (this.locked) {
        // probably still loading previous edit request
        console.warn("Tried to finish editing while locked");
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

      console.warn("Tried to finish editing while no hook set");

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

      if (editing.active) {
        // there is still an item being edited, let's finish that one first
        editing.finish(() => this.activate());
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

  class EditItem extends InlineEdit {
    constructor(options) {
      super(options);
    }

    hideInput() {
      super.hideInput();

      this.$input && this.$input.hide();
    }
  }

  class AddItem extends InlineEdit {
    constructor(options) {
      super(options);

      this.$input.on("focus", () => {
        editingAdd = true;

        if (editing && editing.cancel) {
          editing.cancel();
        }
      })
      .on("blur", () => {
        editingAdd = false;

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

  editing = new EditItem();

  class Graph {
    constructor(options) {
      this.supported = !!window.CanvasRenderingContext2D;

      if (!this.supported) {
        console.warn("HTML5 Canvas is not supported! Not drawing graphs");

        return;
      }

      this.width  = options.width;
      this.height = options.height;
      this.$cont  = options.$cont;
      this.title  = options.title;
      this.page   = options.page;

      this.$canvas = $("<canvas></canvas>").attr({
        width:  this.width,
        height: this.height
      });

      this.ctx = this.$canvas[0].getContext("2d");
    }
  }

  class LineGraph extends Graph {
    constructor(options) {
      super(options);

      this.padX1 = options.pad && options.pad[3] || 0;
      this.padX2 = options.pad && options.pad[1] || 0;
      this.padY1 = options.pad && options.pad[0] || 0;
      this.padY2 = options.pad && options.pad[2] || 0;

      this.setRange(options.range);

      this.tension = options.tension || 0.5;

      this.fill = options.fill;
      this.stroke = options.stroke || true;

      this.lineWidth = options.lineWidth || 2;

      this.transition = options.transition || [];

      this.$gCont = $("<div></div>")
      .addClass("graph-container")
      .attr("id", "graph-" + this.title);

      this.$gCont.append(this.$canvas);

      this.$cont.append(this.$gCont);
    }

    setRange(range) {
      this.minX = range[0];
      this.maxX = range[1];
      this.minY = range[2];
      this.maxY = range[3];
    }

    pixX(x) {
      return this.padX1 + (x - this.minX) / (this.maxX - this.minX)
        * (this.width - this.padX1 - this.padX2);
    }
    pixY(y) {
      return this.height - this.padY2 -
        (y - this.minY) / (this.maxY - this.minY) *
        (this.height - this.padY1 - this.padY2);
    }
    valX(pix) {
      return (pix - this.padX1) * (this.maxX - this.minX) /
        (this.width - this.padX1 - this.padX2) + this.minX;
    }
    valY(pix) {
      return (this.height - this.padY2 - pix) * (this.maxY - this.minY) /
        (this.height - this.padY1 - this.padY2) + this.minY;
    }

    getSpline(p) {
      // array of [pixX, pixY] values
      const curve = [];

      // Hermite spline
      // cardinal spline
      const c = 1 - this.tension; // tension parameter

      const n = p.length - 1;

      // secants
      const d = [];

      for (let k = 0; k < n; k++) {
        d[k] = (p[k + 1][1] - p[k][1]) / (p[k + 1][0] - p[k][0]);
      }

      // tangents
      const m = p.map((point, k) => {
        if (k === 0) {
          return d[0];
        }

        if (k === n) {
          return d[n - 1];
        }

        return c * (d[k - 1] + d[k]);
      });

      const h00 = t => (1 + 2 * t) * Math.pow(1 - t, 2);
      const h10 = t => t * Math.pow(1 - t, 2);
      const h01 = t => Math.pow(t, 2) * (3 - 2 * t);
      const h11 = t => Math.pow(t, 2) * (t - 1);

      const f = (x, xk, yk, xk1, yk1, mk, mk1) => {
        const t = (x - xk) / (xk1 - xk);

        return  h00(t) * yk +
                h10(t) * (xk1 - xk) * mk +
                h01(t) * yk1 +
                h11(t) * (xk1 - xk) * mk1;
      };

      let xn = this.pixX(0);

      let k = 0;
      let k1 = 0;

      for (let K = 0; K < n; K++) {
        const curvePiece = [];

        k1 += p[K + 1][0] - p[K][0];

        const x = xn;
        xn = this.pixX(k1);

        // interpolate the curve between this point and the next
        for (let j = 0; j < xn - x; j++) {
          const xv = this.valX(x + j);
          const yv = f(xv, k, p[K][1], k1, p[K + 1][1], m[K], m[K + 1]);

          curvePiece.push([x + j, this.pixY(yv)]);
        }

        curve.push(curvePiece);

        k = k1;
      }

      // add the last point
      curve[curve.length - 1].push([
        this.pixX(n), this.pixY(p[n])
      ]);

      return curve;
    }

    drawCubicLine(p, colors) {
      const curve = this.getSpline(p);

      if (this.fill) {
        this.ctx.beginPath();

        this.ctx.fillStyle = colors[0];

        this.ctx.moveTo(this.pixX(0), this.pixY(0));

        for (const piece of curve) {
          piece.forEach(point => {
            this.ctx.lineTo(point[0], point[1]);
          });
        }

        this.ctx.lineTo(this.pixX(p.length - 1), this.pixY(0));

        this.ctx.lineTo(this.pixX(0), this.pixY(0));

        this.ctx.fill();

        this.ctx.closePath();
      }

      if (this.stroke) {
        this.ctx.lineWidth = this.lineWidth;

        this.ctx.beginPath();

        let colorKey = 0;

        this.ctx.strokeStyle = colors[colorKey];

        let moved = false;

        curve.forEach((piece, i) => {
          if (i === this.transition[0]) {
            this.transition.shift();

            this.ctx.lineTo(piece[0][0], piece[0][1]);
            this.ctx.stroke();

            this.ctx.closePath();
            this.ctx.beginPath();

            this.ctx.strokeStyle = colors[++colorKey % colors.length];

            moved = false;
          }

          for (const point of piece) {
            if (!moved) {
              this.ctx.moveTo(point[0], point[1]);

              moved = true;
            }
            else {
              this.ctx.lineTo(point[0], point[1]);
            }
          }
        });

        this.ctx.stroke();

        this.ctx.closePath();
      }
    }

    drawLine(p, color) {
      let moved = false;

      this.ctx.beginPath();

      p.forEach(point => {
        const x = this.pixX(point[0]);
        const y = this.pixY(point[1]);

        if (moved) {
          this.ctx.lineTo(x, y);
        }
        else {
          this.ctx.moveTo(x, y);

          moved = true;
        }
      });

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = this.lineWidth;

      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  class GraphBalance extends LineGraph {
    constructor(options) {
      super(options);

      this.currentYear = options.currentYear;
      this.currentMonth = options.currentMonth;

      this.startYear = options.startYear;
      this.startMonth = options.startMonth;

      this.yearMonths = options.yearMonths;

      this.colors = [COLOR_BALANCE_ACTUAL, COLOR_BALANCE_PREDICTED];
      this.tension = 0.5;
      this.stroke = true;

      this.getData(options.dataPast, options.dataFuture);
    }

    draw() {
      // clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      // draw axes
      this.ctx.strokeStyle = COLOR_LIGHT_GREY;
      this.ctx.lineWidth = 1;

      this.ctx.font = FONT_AXIS_LABEL;
      this.ctx.fillStyle = COLOR_DARK;
      this.ctx.textBaseline = "top";
      this.ctx.textAlign = "center";

      // draw month (X axis) ticks, and vertical lines
      for (let i = 3; i < this.maxX - 1; i += 4) {
        const tickName = months[this.yearMonths[i][1] - 1] + "-"
        + (this.yearMonths[i][0] % 100).toString();

        const tickPosX = Math.floor(this.pixX(i)) + 0.5;
        const tickPosY = Math.floor(this.pixY(0)) + 0.5;

        // draw month tick (X axis)
        this.ctx.fillText(tickName, tickPosX, tickPosY + 2);

        // draw vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(tickPosX, 0);
        this.ctx.lineTo(tickPosX, tickPosY);
        this.ctx.stroke();
      }

      // calculate tick range
      const numTicks = GRAPH_BALANCE_NUM_TICKS;

      const tickSize = getTickSize(this.minY, this.maxY, numTicks);

      const ticksY = [];

      // draw value (Y axis) ticks and horizontal lines
      for (let i = 1; i < numTicks; i++) {
        const tickPos = Math.floor(
          this.pixY(i * tickSize)
        ) + 0.5;

        // add value (Y axis) tick to array to draw on top of graph
        ticksY.push([i * tickSize * 100, tickPos]);

        // draw horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(this.padX1, tickPos);
        this.ctx.lineTo(this.width - this.padX2, tickPos);
        this.ctx.stroke();
      }

      // plot past data
      this.drawCubicLine(this.data, this.colors);

      // draw Y axis
      this.ctx.textBaseline = "bottom";
      this.ctx.textAlign = "left";

      for (const tick of ticksY) {
        const tickName = formatCurrency(tick[0], true, true);

        this.ctx.fillText(tickName, this.padX1, tick[1]);
      }

      // add title and key
      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      this.ctx.fillRect(45, 8, 200, 60);
      this.ctx.closePath();

      this.ctx.font = FONT_GRAPH_TITLE;
      this.ctx.fillStyle = COLOR_GRAPH_TITLE;
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";

      this.ctx.fillText("Balance", 65, 10);

      this.ctx.beginPath();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = COLOR_BALANCE_ACTUAL;
      this.ctx.moveTo(50, 40);
      this.ctx.lineTo(74, 40);
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.font = FONT_GRAPH_KEY_SMALL;
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = COLOR_DARK;
      this.ctx.fillText("Actual", 78, 40);

      this.ctx.beginPath();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = COLOR_BALANCE_PREDICTED;
      this.ctx.moveTo(130, 40);
      this.ctx.lineTo(154, 40);
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.fillText("Predicted", 158, 40);
    }

    getData(past, future) {
      const dataPast = past.map(hundredth);
      const dataFuture = future.map(hundredth);

      this.futureKey = 12 * (this.currentYear - this.startYear) +
        this.currentMonth - this.startMonth + 1;

      const data = dataPast.map((item, key) => {
        return key < this.futureKey ? item : dataFuture[key];
      });

      this.maxY = Math.max.apply(null, data);

      this.data = data.map(indexPoints);

      this.transition = [this.futureKey - 1];
    }

    update(costBalance, costPredicted) {
      this.getData(costBalance, costPredicted);

      this.draw();
    }
  }

  class GraphSpend extends LineGraph {
    constructor(options) {
      super(options);

      this.tension = 1;

      this.yearMonths = options.yearMonths;

      this.categories = ["bills", "food", "general", "holiday", "social"];

      this.textColors = categoryColors;

      this.colors = {};

      for (const category of this.categories) {
        this.colors[category] = [rgba(this.textColors[category], 0.75)];
      }

      this.fill = true;

      this.getData(options.data);
    }

    draw() {
      // calculate tick range
      const tickSize = getTickSize(this.minY, this.maxY, 5);

      this.ctx.clearRect(0, 0, this.width, this.height);
      // draw X axis ticks
      this.ctx.strokeStyle = COLOR_LIGHT_GREY;
      this.ctx.lineWidth = 1;

      const ticksY = [];
      for (let i = 3, j = 0; i < this.maxX - 1; i += 2, j++) {
        const tickPos = Math.floor(this.pixX(i)) + 0.5;

        ticksY.push([i, tickPos]);

        this.ctx.beginPath();
        this.ctx.moveTo(tickPos, this.padY1);
        this.ctx.lineTo(tickPos, this.height - this.padY2 + 10 * (1 - j % 2));
        this.ctx.stroke();
      }

      // draw Y axis ticks
      const ticksX = [];
      for (let i = 0; i < 3; i++) {
        const tickPos = Math.floor(this.pixY(tickSize * i)) + 0.5;

        ticksX.push(tickPos);

        this.ctx.beginPath();
        this.ctx.moveTo(this.padX1, tickPos);
        this.ctx.lineTo(this.width - this.padX2, tickPos);
        this.ctx.stroke();
      }

      // plot data
      this.data.forEach((line, i) => {
        this.drawCubicLine(
          line, this.colors[this.categories[this.categories.length - 1 - i]]
        );
      });

      this.ctx.font = FONT_AXIS_LABEL;
      this.ctx.textBaseline = "top";
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = COLOR_GRAPH_TITLE;

      ticksX.forEach((tickPos, i) => {
        if (i > 0) {
          const tickName = "£" + numberFormat(tickSize * i);

          this.ctx.fillText(tickName, 0, tickPos);
        }
      });

      // draw month ticks
      this.ctx.fillStyle = COLOR_DARK;
      this.ctx.textBaseline = "bottom";
      this.ctx.textAlign = "center";

      ticksY.forEach((tick, j) => {
        const tickName = months[this.yearMonths[tick[0]][1] - 1] + "-" +
          (this.yearMonths[tick[0]][0] % 100).toString();

        this.ctx.fillText(
          tickName, tick[1], this.height - this.padY2 + 3 + 10.5 * (2 - j % 2)
        );
      });

      // add title and key
      this.ctx.font = FONT_GRAPH_TITLE;
      this.ctx.fillStyle = COLOR_GRAPH_TITLE;
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";

      this.ctx.fillText("Spending", 15, 10);

      this.ctx.textBaseline = "middle";
      this.ctx.font = FONT_GRAPH_KEY;

      const fontColor = COLOR_DARK;

      this.ctx.fillStyle = fontColor;
      this.ctx.fillText("Bills", 20, 40);
      this.ctx.fillText("Food", 72, 40);
      this.ctx.fillText("General", 130, 40);
      this.ctx.fillText("Holiday", 200, 40);
      this.ctx.fillText("Social", 265, 40);

      this.ctx.fillStyle = rgb(this.textColors.bills);
      this.ctx.fillRect(
        GRAPH_KEY_OFFSET_X, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE
      );

      this.ctx.fillStyle = rgb(this.textColors.food);
      this.ctx.fillRect(57, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE);

      this.ctx.fillStyle = rgb(this.textColors.general);
      this.ctx.fillRect(115, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE);

      this.ctx.fillStyle = rgb(this.textColors.holiday);
      this.ctx.fillRect(185, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE);

      this.ctx.fillStyle = rgb(this.textColors.social);
      this.ctx.fillRect(250, GRAPH_KEY_OFFSET_Y, GRAPH_KEY_SIZE, GRAPH_KEY_SIZE);
    }

    getData(data) {
      const sum = [];

      let maxY = 0;

      this.data = this.categories.map(category => {
        const thisData = data[category].map((item, key) => {
          if (!sum[key]) {
            sum[key] = 0;
          }

          sum[key] += item > 0 ? hundredth(item) : 0;

          return sum[key];
        });

        maxY = Math.max(maxY, Math.max.apply(null, thisData));

        return thisData.map(indexPoints);
      }).reverse();

      this.maxY = maxY;

      // const chartCategories = this.categories.concat().reverse();
    }

    update(data) {
      this.getData(data);

      this.draw();
    }
  }

  class GraphFundHistory extends LineGraph {
    constructor(options) {
      super(options);

      this.tension = GRAPH_FUND_HISTORY_TENSION;

      this.data       = options.data;
      this.startTime  = options.startTime;
      this.dataOffset = 0;
      this.hlPoint    = -1;

      this.color = COLOR_GRAPH_FUND_LINE;

      this.$label = $("<div></div>").addClass("label");
      this.$gCont.append(this.$label);

      this.$canvas[0].addEventListener("mousewheel", evt => {
        if (evt.wheelDelta > 0) {
          this.increaseDetail();
        }
        else {
          this.decreaseDetail();
        }
      });

      this.$gCont.on("mousemove", evt => {
        this.mouseOver(evt.pageX - this.$gCont.offset().left);
      })
      .on("mouseout", () => {
        this.hlPoint = -1;
        this.draw();
      });

      // build stock rendering thingy
      this.buildStockViewer();

      windowSize.narrow(() => {
        this.resize(400);
      })
      .wide(() => {
        this.resize(600);
      })
      .trigger();
    }

    resize(size) {
      this.width = size;
      this.$canvas[0].width = size;

      this.draw();
    }

    buildStockViewer() {
      this.stocksRefreshInterval = STOCKS_REFRESH_INTERVAL;
      this.hlTime = STOCKS_REFRESH_INTERVAL - 1000;

      this.stocksListLoading = false;

      this.stockPricesLoading = false;

      this.stocks = {};

      this.$stocksListOuter = $("<div></div>")
      .addClass("stocks-list");

      this.$stocksList = $("<ul></ul>")
      .addClass("stocks-list-ul");

      this.$stocksListOuter.append(this.$stocksList);

      this.$gCont.append(this.$stocksListOuter);

      this.loadStocksList();
    }

    loadStocksList() {
      if (this.stocksListLoading) {
        return;
      }
      this.stocksListLoading = true;

      api.request(
        "data/stocks", "GET", null, user.apiKey,
        res => this.onStocksListLoaded(res),
        () => this.onStocksListError(),
        () => this.onStocksListRequestComplete()
      );
    }

    onStocksListLoaded(res) {
      this.stockWeight = res.data.stocks;

      const total = res.data.total;

      this.stocks = {};

      this.$stocksList.empty();

      for (const symbol in res.data.stocks) {
        this.stocks[symbol] = {
          name:   res.data.stocks[symbol].n,
          weight: res.data.stocks[symbol].w / total,
          price:  0,
          change: 0,
          changeText: "",
          $elem:  null,
          active: false
        };
      }

      this.loadStockPrices();
    }
    onStocksListError() {
      console.warn("Error loading stocks list!");
    }
    onStocksListRequestComplete() {
      this.stocksListLoading = false;
    }

    loadStockPrices() {
      if (this.stockPricesLoading || pageActive !== "funds") {
        return;
      }

      this.stockPricesLoading = true;

      finance.get(
        this.stocks,
        res => this.onStockPricesLoaded(res),
        () => this.onStockPricesFail(),
        () => this.onStockPricesRequestComplete()
      );
    }

    onStockPricesLoaded(res) {
      let badStocks = 0;

      for (const stock of res) {
        const symbol = stock.e + ":" + stock.t;

        if (!this.stocks[symbol]) {
          badStocks++;
        }
        else {
          const price = parseFloat(stock.l_fix, 10);

          // change as a percentage
          const change = parseFloat(stock.c_fix, 10) / price * 100;

          // highlight
          let hl = false;

          if (this.stocks[symbol].price !== price) {
            hl = this.stocks[symbol].price > price ? "hl-down" : "hl-up";
          }

          this.stocks[symbol].hl = hl;

          this.stocks[symbol].price = price;

          this.stocks[symbol].change = change;

          this.stocks[symbol].changeText = (change >= 0 ? "+" : "") + change.toFixed(2);
        }
      }

      if (badStocks > 0) {
        console.warn("Got " + badStocks.toString() + " extra stocks from finance api");

        return;
      }

      this.updateStockList();

      // refresh the prices in 5 seconds
      if (this.stocksLoadingTimer) {
        window.clearTimeout(this.stocksLoadingTimer);
      }

      this.stocksLoadingTimer = window.setTimeout(() => {
        this.loadStockPrices();
      }, this.stocksRefreshInterval);
    }

    updateStockList() {
      for (const symbol in this.stocks) {
        const stock = this.stocks[symbol];

        if (stock.$elem) {
          // update the item
          stock.$price.text(stock.price.toFixed(2));

          stock.$change.text(stock.changeText);

          if (stock.hl) {
            stock.$priceOuter.addClass(stock.hl);
            stock.hl = false;

            window.setTimeout(() => {
              stock.$priceOuter.removeClass("hl-up").removeClass("hl-down");
            }, this.hlTime);
          }
        }
        else {
          // add the item
          stock.$elem = $("<li></li>").addClass("stock-list-item");

          stock.$label = $("<span></span>").addClass("label").text(symbol);

          stock.$elem.attr("title", stock.name);

          stock.$priceOuter = $("<span></span>")
          .addClass("price");

          stock.$price = $("<span></span>")
          .addClass("absolute")
          .text(stock.price.toFixed(2));

          stock.$change = $("<span></span>")
          .addClass("change")
          .text(stock.changeText);

          stock.$priceOuter.append(stock.$price);
          stock.$priceOuter.append(stock.$change);

          stock.$elem.append(stock.$label);
          stock.$elem.append(stock.$priceOuter);

          this.$stocksList.append(stock.$elem);
        }

        stock.$elem.toggleClass("up", stock.change > 0);
        stock.$elem.toggleClass("down", stock.change < 0);
      }
    }

    onStockPricesFail() {
      console.warn("Error loading stock prices!");
    }
    onStockPricesRequestComplete() {
      this.stockPricesLoading = false;
    }

    increaseDetail() {
      this.dataOffset = Math.min(this.data.length - 3, this.dataOffset + 1);
      this.detailChanged();
    }
    decreaseDetail() {
      this.dataOffset = Math.max(0, this.dataOffset - 1);
      this.detailChanged();
    }
    detailChanged() {
      this.minX = this.data[this.dataOffset][0];

      this.draw();
    }

    draw() {
      // clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      const axisColor = COLOR_DARK;
      const axisTextColor = COLOR_LIGHT;

      const stocksWidth = STOCKS_LIST_WIDTH;

      const numTicks = GRAPH_FUND_HISTORY_NUM_TICKS;

      // draw axes
      this.ctx.strokeStyle = axisColor;
      this.ctx.lineWidth = 1;

      // calculate tick range
      const tickSizeY = getTickSize(
        this.minY, this.maxY, numTicks
      );

      this.maxY = tickSizeY * Math.ceil(this.maxY / tickSizeY);

      this.minY = tickSizeY * Math.floor(this.minY / tickSizeY);

      const ticksY = [];

      // draw value (Y axis) ticks and horizontal lines
      for (let i = 0; i < numTicks; i++) {
        const value = this.minY + i * tickSizeY;

        const tickPos = Math.floor(this.pixY(value)) + 0.5;

        // add value (Y axis) tick to array to draw on top of graph
        ticksY.push([value, tickPos]);

        // draw horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(this.padX1 + stocksWidth, tickPos);
        this.ctx.lineTo(this.width - this.padX2, tickPos);
        this.ctx.stroke();
      }

      // plot past data
      this.drawLine(this.data.slice(this.dataOffset), this.color);

      // draw Y axis
      this.ctx.fillStyle = axisTextColor;
      this.ctx.textBaseline = "bottom";
      this.ctx.textAlign = "right";
      this.ctx.font = FONT_AXIS_LABEL;

      for (const tick of ticksY) {
        const tickName = formatCurrency(tick[0], true, true);

        this.ctx.fillText(tickName, this.width - this.padX2, tick[1]);
      }

      // highlight point on mouseover
      if (this.hlPoint > -1) {
        const hlX = this.pixX(this.data[this.hlPoint][0]);
        const hlY = this.pixY(this.data[this.hlPoint][1]);

        const time = this.data[this.hlPoint][0] + this.startTime;

        const age = new Date().getTime() - time * 1000;

        const ageText = formatAge(age / 1000);

        const align = hlX < this.width / 2 ? -1 : 1;

        const label = ageText + ": " + formatCurrency(
          this.data[this.hlPoint][1]
        );

        const left = align > 0
          ? "initial" : hlX + GRAPH_FUND_HISTORY_POINT_RADIUS;
        const right = align > 0
          ? this.width - hlX - GRAPH_FUND_HISTORY_POINT_RADIUS : "initial";
        const top = hlY + GRAPH_FUND_HISTORY_POINT_RADIUS;

        this.$label.css({
          textAlign: align > 0 ? "right" : "left",
          left,
          right,
          top
        })
        .html(label)
        .show();

        // highlight the point with a circle
        this.ctx.beginPath();
        this.ctx.moveTo(hlX, hlY);
        this.ctx.arc(
          hlX, hlY, GRAPH_FUND_HISTORY_POINT_RADIUS, 0, Math.PI * 2, false
        );

        this.ctx.fillStyle = COLOR_GRAPH_FUND_POINT;
        this.ctx.fill();
        this.ctx.closePath();
      }
      else {
        this.$label.hide();
      }
    }

    mouseOver(x) {
      const xv = this.valX(x);

      let lastProximity = -1;

      const hlPoint = this.data.reduce((prev, point, index) => {
        const thisProximity = Math.abs(xv - point[0]);

        const returnVal = prev === null || thisProximity < lastProximity
          ? index : prev;

        lastProximity = thisProximity;

        return returnVal;
      }, null);

      if (hlPoint !== this.hlPoint) {
        this.hlPoint = hlPoint;

        this.draw();
      }
    }
  }

  class PieGraph extends Graph {
    constructor(options) {
      super(options);

      this.data           = options.data.data;
      this.total          = options.data.total;
      this.type           = options.data.type;
      this.index          = options.index;
      this.stretchFactor  = options.stretchFactor;
      this.pieTolerance   = options.pieTolerance;
      this.pieLabelLength = options.pieLabelLength;

      const $gCont = $("<div></div>")
      .addClass("graph-container")
      .addClass("graph-container-pie")
      .addClass("graph-container-pie-" + this.index.toString())
      .attr("id", "graph-pie-" + this.title.toLowerCase() + "-" + this.page);

      this.colors = [
        COLOR_PIE_L1,
        COLOR_PIE_L2,
        COLOR_PIE_L3,
        COLOR_PIE_M1,
        COLOR_PIE_M2,
        COLOR_PIE_M3,
        COLOR_PIE_S1,
        COLOR_PIE_S2
      ];

      this.labelColors = {};

      this.labelKey = 0;

      $gCont.append(this.$canvas);

      this.$cont.append($gCont);
    }

    stretch() {
      this.ctx.save();
      this.ctx.translate(this.width * 0.5 * (1 - this.stretchFactor), 0);
      this.ctx.scale(this.stretchFactor, 1);
    }

    unstretch() {
      this.ctx.restore();
    }

    stretchPoint(x) {
      return this.width / 2 + (x - this.width / 2) * this.stretchFactor;
    }

    pointFromCircle(centreX, centreY, radius, angle) {
      return [
        centreX + radius * Math.cos(angle),
        centreY + radius * Math.sin(angle)
      ];
    }

    draw() {
      const pio2 = Math.PI / 2;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // set label colours
      for (const item of this.data) {
        const label = item[0];

        if (!this.labelColors[label]) {
          const offset = Math.floor(this.labelKey / this.colors.length);

          this.labelColors[label] = this.colors[
            (offset + this.labelKey++) % this.colors.length
          ];
        }
      }

      this.ctx.strokeStyle = COLOR_GRAPH_TITLE;
      this.ctx.font = FONT_AXIS_LABEL;

      let smallLabelOffset = PIE_SMALL_LABEL_OFFSET;

      let lastLabelAngle = 0;

      const centreX = 9 * this.width / 17;
      const centreY = 5 * this.height / 8;

      const radius = Math.min(this.width, this.height) / 4.5;

      let angle = -0.1 - pio2;

      const labelRadiusExtension = x => {
        return x < PIE_LABEL_SWITCH_POINT
        ? PIE_LABEL_SCALE_FACTOR_PRE * Math.sin(
          Math.PI * x / 2 / PIE_LABEL_SWITCH_POINT
        )
        : -PIE_LABEL_SCALE_FACTOR_POST * (x - 1) /
          (1 - PIE_LABEL_SWITCH_POINT);
      };

      for (const p of this.data) {
        const thisAngle = 2 * Math.PI * p[1] / this.total;

        const thisColor = this.labelColors[p[0]];

        const newAngle = angle + thisAngle;

        this.stretch();

        this.ctx.beginPath();
        this.ctx.moveTo(centreX, centreY);
        this.ctx.arc(centreX, centreY, radius, angle, newAngle, false);

        this.unstretch();

        this.ctx.fillStyle = thisColor;
        this.ctx.fill();
        this.ctx.stroke();

        // draw label
        const midAngle = (angle + 0.5 * thisAngle + 2 * Math.PI) % (2 * Math.PI);

        let labelDirection = -1;

        if (
          !lastLabelAngle || (
            midAngle - lastLabelAngle + 2 * Math.PI
          ) % (2 * Math.PI) > this.pieTolerance
        ) {
          lastLabelAngle = midAngle;

          const quadrant = Math.floor((midAngle + pio2) / pio2) % 4;

          let labelRadiusScale = PIE_LABEL_RADIUS_START;

          if (quadrant === 3) {
            // x is the fraction of the top-left quadrant where the label is
            const x = (midAngle - Math.PI) / pio2;

            if (x >= PIE_LABEL_SWITCH_POINT) {
              labelDirection = 1;
            }

            labelRadiusScale = PIE_LABEL_RADIUS_START + PIE_LABEL_RADIUS_SCALE *
              labelRadiusExtension(x);
          }

          const labelRadius = radius * labelRadiusScale;

          const labelBegin = this.pointFromCircle(
            centreX, centreY, radius * PIE_LABEL_INSIDE_RADIUS, midAngle
          );
          const labelEnd = this.pointFromCircle(
            centreX, centreY, labelRadius, midAngle
          );

          this.stretch();

          this.ctx.beginPath();
          this.ctx.moveTo(labelBegin[0], labelBegin[1]);

          const textAnchor = this.pointFromCircle(
            centreX, centreY, labelRadius + 1, midAngle
          );

          textAnchor[1] = Math.floor(textAnchor[1]) + 0.5;

          const baseline = quadrant === 1 && midAngle > 0.2 ? "top" : "middle";
          const align = quadrant < 2 || labelDirection > 0 ? "left" : "right";

          if (quadrant === 3) {
            this.ctx.lineTo(textAnchor[0], textAnchor[1]);

            textAnchor[0] += labelDirection * smallLabelOffset++;

            this.ctx.lineTo(textAnchor[0] - 3 * labelDirection, textAnchor[1]);
          }
          else {
            this.ctx.lineTo(labelEnd[0], labelEnd[1]);
          }

          this.unstretch();

          this.ctx.stroke();
          this.ctx.closePath();

          const labelValue = p[1];

          let labelName = p[0];
          if (labelName.length > this.pieLabelLength) {
            labelName = trim(labelName.substring(0, this.pieLabelLength)) + "... ";
          }

          const label = labelName + " (" + formatData(labelValue, this.type, true) + ")";

          this.ctx.fillStyle = COLOR_GRAPH_TITLE;
          this.ctx.textAlign = align;
          this.ctx.textBaseline = baseline;
          this.ctx.fillText(label, this.stretchPoint(textAnchor[0]), textAnchor[1]);
        }

        angle = newAngle;
      }

      this.ctx.fillStyle = "#000";
      this.ctx.font = FONT_GRAPH_TITLE_LARGE;
      this.ctx.textAlign = "right";
      this.ctx.textBaseline = "top";

      this.ctx.fillText(this.title, this.width - 10, 10);
    }
  }

  class Page {
    constructor(options) {
      this.page = options.page;
      this.$page = $("#page-" + this.page);

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

        api.request(
          args.join("/"), "GET", null, user.apiKey,
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
      this.loadData(() => this.hookSwitchToAfterLoad(), true);

      this.hookSwitchToCallback(pageExists);
    }

    render() {
    }
  }

  /**
   * a PageList is a type of page which displays an editable list of data,
   * optionally with pie chart(s)
   */
  class PageList extends Page {
    constructor(options) {
      super(options);

      this.col            = options.col;  // list of columns
      this.colShort       = options.colShort;

      this.colEdit     = options.colEdit || options.col.map((item, i) => i);

      this.dataType       = options.dataType;
      this.addDefaultVal  = options.addDefaultVal;
      this.dailyColumn    = options.daily;

      this.drawPie        = options.drawPie;
      this.stretchFactor  = options.pieStretch || 1.5;
      this.pieWidth       = options.pieWidth || 500;
      this.pieHeight      = options.pieHeight || 300;
      this.pieTolerance   = pieTolerance;
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

      if (!res.data.older) {
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
            this.listEditCallback(j), this.dataType[j], suggestion
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

      this.$lhead = $("<div></div>").addClass("list-head");

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

        if (val === null) {
          console.warn("Must enter valid data");

          this.$addButton.attr("disabled", false);

          return;
        }

        data[col] = val.toString();

        dataVal[col] = val;
      }

      api.request(
        "add/" + this.page, "POST", data, user.apiKey,
        res => this.onNewAdded(dataVal, res),
        () => this.onNewError(),
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

    onNewError() {
      console.warn("Error inserting row! (Server error)");
    }

    onNewRequestComplete() {
      this.sortByDate();

      this.$addButton.attr("disabled", false);
    }

    submitEdit(id, key, val, callback) {
      const postData = { id };

      postData[key] = val.toString();

      const dataKey = editing.$elem.parent().data("dataKey");

      api.request(
        "update/" + this.page, "POST", postData, user.apiKey,
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
      console.warn("Error updating value! (Server error)");
    }

    onSubmitRequestComplete(dataKey, key, callback) {
      editing.deactivate(this.data[dataKey][key]);

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

      api.request(
        "pie/" + this.page, "GET", null, user.apiKey,
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

      // old code
      /*
      const scrollTop = this.$lbody.scrollTop();

      const scrollHeight = this.$lbody[0].scrollHeight;

      const windowHeight = $(window).height();

      const offsetTop = this.$lbody.offset().top;

      const scrolledToBottom = scrollHeight < (windowHeight - offsetTop) ||
        scrollTop + windowHeight >= scrollHeight + offsetTop - 100;

      if (scrolledToBottom) {
        this.increaseLimit();
      }
      */
    }

    /*
     * called when the user triggers an edit
     * submits an AJAX call via submitEdit() if the value has changed
     *
     * @param callback:
     */
    triggerListEdit(column, type, callback) {
      const dataKey = editing.$elem.parent().data("dataKey");

      const status = afterEditValidateCompare(
        editing.$input.val(), this.data[dataKey][column], type
      );

      if (!status) {
        // invalid data input
        console.warn("invalid data input");

        editing.cancel();
      }
      else {
        if (status.changed) {
          const id = editing.$elem.parent().data("id");

          this.submitEdit(id, column, status.val, callback);

          return;
        }

        editing.deactivate(status.val);
      }

      if (typeof callback === "function") {
        callback();
      }
    }
  }

  class PageFunds extends PageList {
    constructor(options) {
      super(options);
    }

    calculateGain(unitsTxt, priceVal, cost) {
      const units = parseFloat(unitsTxt, 10);
      const price = parseFloat(priceVal, 10);

      let pct = 0;
      let gainAbs = 0;

      let value = cost;

      if (!isNaN(units) && !isNaN(price) && cost > 0) {
        value = units * price;

        // percentage value
        pct = 100 * (value - cost) / cost;

        // absolute value
        gainAbs = value - cost;
      }

      const txt = "<span class=\"value\">" + formatCurrency(value, false, false, true) + "</span>" +
        "<span class=\"abs\">(" + formatCurrency(gainAbs, false, false, true) + ")</span>" +
        "<span class=\"pct\">(" + pct.toFixed(1) + "%)</span>"
      ;

      return { pct, txt };
    }

    addGainText(gain, $span) {
      return $span
        .toggleClass("profit", gain.pct > 0)
        .toggleClass("loss", gain.pct < 0)
        .toggleClass("high", Math.abs(gain.pct) > 5)
        .html(gain.txt)
      ;
    }

    hookCalculate() {
      super.hookCalculate();

      this.$lbody.children("li:not(.li-add)").each((i, li) => {
        const id = $(li).data("id");

        const units = this.$li[id].units.data("val");
        const price = this.$li[id].units.data("price");

        const $span = this.addGainText(
          this.calculateGain(units, price, this.data[i].cost),
          this.$li[id].gain.children(".text")
        );

        this.$li[id].gain.children(".text").replaceWith($span);
      });
    }

    hookCustomColumns(newItem, newData) {
      const id = newItem.id;

      const units = newData.u;
      const price = newData.P;

      this.$li[id].units.data("price", price);

      const $gainSpan = this.addGainText(
        this.calculateGain(units, price, newData.c),
        $("<span></span>").addClass("text")
      );

      // add a "gain/loss" column
      this.$li[id].gain = $("<span></span>").addClass("gain").append($gainSpan);

      this.$lis[id].append(this.$li[id].gain);

      return newItem;
    }

    render() {
      super.render();

      const $gain = $("<span></span>").addClass("gain");
      this.$gainInfo = $("<span></span>").addClass("gain-info");
      this.$gainText = $("<span></span>").addClass("text");

      $gain.append(this.$gainInfo);
      $gain.append(this.$gainText);
      this.$lhead.append($gain);

      // build graph showing fund value history
      this.loadFundHistory();
    }

    hookSwitchToCallback(pageExists) {
      super.hookSwitchToCallback();

      if (pageExists) {
        this.graphFundHistory.loadStocksList();
      }
    }

    loadFundHistory() {
      api.request(
        "data/fund_history", "GET", null, user.apiKey,
        res => this.onFundHistoryLoaded(res),
        () => {},
        () => {}
      );
    }
    onFundHistoryLoaded(res) {
      // get minimum value
      let minValue = -1;
      let maxValue = -1;

      res.data.history.forEach(item => {
        if (minValue < 0 || item[1] < minValue) {
          minValue = item[1];
        }

        if (item[1] > maxValue) {
          maxValue = item[1];
        }
      });

      if (res.data.history.length > 0) {
        const lastValue = res.data.history[res.data.history.length - 1][1];

        const profit = lastValue - this.costTotal;

        // put the current value at the top of the page
        const profitSign = profit >= 0 ? "+" : "-";

        const profitLabel = " (" + profitSign +
          formatCurrency(Math.abs(profit)) + ")";

        const valueTime = res.data.startTime +
          res.data.history[res.data.history.length - 1][0];

        const ageHours = Math.round(
          (new Date().getTime() - valueTime * 1000) / 3600000
        );

        const ago = ageHours + " hour" + (ageHours === 1 ? "" : "s") + " ago";

        this.$gainInfo.html(
          "Current value (" + ago + "): " +
            formatCurrency(lastValue)
        );

        this.$gainText.html(profitLabel)
        .toggleClass("profit", profit > 0)
        .toggleClass("loss", profit < 0);
      }

      this.graphFundHistory = new GraphFundHistory({
        width:  GRAPH_FUND_HISTORY_WIDTH,
        height: this.pieHeight,
        $cont:  this.$graphs,
        page:   this.page,
        title:  "fund-history",
        data:   res.data.history,
        range:  [0, res.data.totalTime, minValue, maxValue],
        pad:    [24, 0, 0, 0],
        lineWidth: GRAPH_FUND_HISTORY_LINE_WIDTH,
        startTime: res.data.startTime
      });
    }
  }

  class PageOverview extends Page {
    constructor() {
      super({ page: "overview" });

      this.categories = [
        "funds",
        "bills",
        "food", "general", "holiday", "social",
        "in", "out", "net",
        "predicted", "balance"
      ];

      this.colors = categoryColors;
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
        .addClass("table-overview");

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
    }

    afterBalanceEdit(callback) {
      const val = validateCurrencyInput(editing.$input.val());

      if (val === null) {
        return;
      }

      const $tr = editing.$elem.parent();

      const yearMonth = $tr.data("yearMonth");
      const key = $tr.index();

      if (val !== this.data.cost.balance[key]) {
        api.request(
          "update/overview", "POST", {
            year:   yearMonth[0],
            month:  yearMonth[1],
            balance:  val
          }, user.apiKey,
          () => this.onBalanceEdited(key, val),
          () => this.onBalanceEditError(),
          () => this.onBalanceEditRequestComplete(key, callback)
        );
      }
      else {
        editing.deactivate(val);

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
      console.warn("Error updating value! (Server error)");
    }

    onBalanceEditRequestComplete(key, callback) {
      editing.deactivate(this.data.cost.balance[key]);

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
      if (pages[category]) {
        const doneRows = [];

        for (let i = 0; i < pages[category].data.length; i++) {
          const year  = pages[category].data[i].date.year;
          const month = pages[category].data[i].date.month;

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
            this.data.cost[category][row] += pages[category].data[i].cost;
          }
        }
      }
    }
  }

  const pageDef = {
    in: {
      page:           "in",
      col:            ["date", "item", "cost"],
      colShort:       ["d", "i", "c"],
      dataType:       ["date", "text", "cost"],
      addDefaultVal:  {
        date: today.format(),
        item: "",
        cost: "0.00"
      },
      daily: false,
      drawPie: true,
      pieWidth: 800
    },
    bills: {
      page:           "bills",
      col:            ["date", "item", "cost"],
      colShort:       ["d", "i", "c"],
      limit:          true,
      dataType:       ["date", "text", "cost"],
      addDefaultVal:  {
        date: today.format(),
        item: "",
        cost: "0.00"
      },
      daily: false
    },
    food: {
      page:           "food",
      col:            ["date", "item", "category", "cost", "shop"],
      colShort:       ["d", "i", "k", "c", "s"],
      dataType:       ["date", "text", "text", "cost", "text"],
      limit:          true,
      addDefaultVal:  {
        date: today.format(),
        item: "",
        category: "",
        cost: "0.00",
        shop: ""
      },
      daily: true,
      drawPie: true
    },
    general: {
      page:           "general",
      col:            ["date", "item", "category", "cost", "shop"],
      colShort:       ["d", "i", "k", "c", "s"],
      dataType:       ["date", "text", "text", "cost", "text"],
      limit:          true,
      addDefaultVal:  {
        date: today.format(),
        item: "",
        category: "",
        cost: "0.00",
        shop: ""
      },
      daily: true,
      drawPie: true
    },
    social: {
      page:           "social",
      col:            ["date", "item", "society", "cost", "shop"],
      colShort:       ["d", "i", "y", "c", "s"],
      dataType:       ["date", "text", "text", "cost", "text"],
      addDefaultVal:  {
        date: today.format(),
        item: "",
        society: "",
        cost: "0.00",
        shop: ""
      },
      daily: false,
      drawPie: true
    },
    holiday: {
      page:           "holiday",
      col:            ["date", "item", "holiday", "cost", "shop"],
      colShort:       ["d", "i", "h", "c", "s"],
      dataType:       ["date", "text", "text", "cost", "text"],
      addDefaultVal:  {
        date: today.format(),
        item: "",
        holiday: "",
        cost: "0.00",
        shop: ""
      },
      daily: false,
      drawPie: true
    }
  };

  const pageDefFunds = {
    page:           "funds",
    col:            ["date", "item", "units", "cost", "price"],
    colShort:       ["d", "i", "u", "c", "P"],
    colEdit:        [0, 1, 2, 3],
    dataType:       ["date", "text", "text", "cost"],
    addDefaultVal:  {
      date:     today.format(),
      item:     "",
      units:    "0.00",
      cost:     "0.00"
    },
    daily: false,
    drawPie: true,
    pieStretch: 1.2,
    pieWidth: 600,
    pieLabelLength: 20
  };

  function newPageList(page) {
    return new PageList(pageDef[page]);
  }

  function getYearMonthRow(startYear, startMonth, year, month) {
    return (year - startYear) * 12 + (month - startMonth);
  }

  function selectPage(id, button, callback) {
    if (button.is(".active")) {
      return;
    }

    let pageExists = true;

    if (typeof pages[id] === "undefined") {
      pageExists = false;

      switch (id) {
      case "overview":
        pages[id] = new PageOverview();
        break;
      case "funds":
        pages[id] = new PageFunds(pageDefFunds);
        break;
      default:
        pages[id] = newPageList(id);
      }
    }

    Cookies.set("currentPage", id, { expires: 7 });

    pages[id].switchTo(pageExists);

    if (navActive) {
      navActive.removeClass("active");
    }
    else {
      $("#bg").fadeOut();
    }

    if (pageActive) {
      $("#page-" + pageActive).hide();
    }

    button.addClass("active");
    navActive = button;
    pageActive = id;

    $("#page-" + id).show();

    if (typeof callback === "function") {
      callback();
    }
  }

  function navHandler($btn, event, callback) {
    if (!$btn || typeof $btn !== "object") {
      $btn = $(this);

      event = "mousedown";
    }

    $btn.on(event, selectPage.bind(
      null, $btn.attr("id").substring(9), $btn, callback
    ));
  }

  function tableNavigate(wasEditing, evt, x, y, dx, dy, maxX, maxY) {
    if (evt.key === "Tab") {
      if (evt.shiftKey) {
        if (wasEditing) {
          if (x > 0) {
            dx = -1;
            dy = 0;
          }
          else if (y > 0) {
            dx = maxX;
            dy = -1;
          }
        }
        else {
          return false;
          // x = maxX;
          // y = maxY;
        }
      }
      else if (wasEditing) {
        if (x < maxX) {
          dx = 1;
          dy = 0;
        }
        else if (y < maxY) {
          dx = -1 * maxX;
          dy = 1;
        }
      }

      x += dx;
      y += dy;
    }

    if (pageActive === "overview") {
      if (dx !== 0) {
        return false;
      }

      if (evt.key === "ArrowUp" && !wasEditing) {
        y = maxY;
      }

      pages.overview.$td[y].balance.mousedown();
    }
    else {
      const $span = pages[pageActive].$lbody
        .children(":eq(" + (y + 1).toString() + ")")
        .children(".editable:eq(" + x.toString() + ")");

      $span.mousedown();
    }

    return true;
  }

  /**
   * main window keydown handler
   * @param {event} evt the event object send by the event listener
   * @returns {void} nothing
   */
  function keyDownHandler(evt) {
    if (!user.uid) {
      if (user.inputActive === -1) {
        return;
      }

      let val = parseInt(evt.key, 10);

      if (isNaN(val)) {
        return;
      }

      val = Math.min(9, Math.max(0, val));

      user.loginPin += Math.pow(10, 3 - user.inputActive) * val;

      user.$input.slice(user.inputActive, user.inputActive + 1)
      .addClass("done").removeClass("active");

      if (user.inputActive < 3) {
        user.inputActive++;

        user.$input.slice(user.inputActive, user.inputActive + 1)
        .addClass("active");
      }
      else {
        user.login();
      }
    }
    else if (evt.key === "Enter") {
      if (editing.finish()) {
        evt.preventDefault();
      }
    }
    else if (evt.key === "Escape") {
      if (editing.cancel()) {
        evt.preventDefault();
      }
    }
    else if (pageActive && (
      (evt.ctrlKey && (evt.key === "ArrowLeft" || evt.key === "ArrowRight")) ||
      (evt.key === "ArrowUp" || evt.key === "ArrowDown") ||
      (!editingAdd && evt.key === "Tab")
    )) {
      const page0 = pageActive === "overview";

      let x = 0;
      let y = 0;

      const dx = evt.key === "ArrowLeft"  ? -1 : (evt.key === "ArrowRight"  ? 1 : 0);
      const dy = evt.key === "ArrowUp"    ? -1 : (evt.key === "ArrowDown"   ? 1 : 0);

      let maxX;
      let maxY;

      if (page0) {
        maxX = 0;
        maxY = pages.overview.data.cost.balance.length - 1;
      }
      else {
        maxX = pages[pageActive].numEditCols() - 1;
        maxY = pages[pageActive].data.length - 1;
      }

      if (editing.active) {
        if (page0) {
          y = Math.min(maxY, Math.max(0, editing.$elem.parent().index() + dy));
        }
        else {
          x = Math.min(maxX, Math.max(0, editing.$elem.index() + dx));

          y = Math.min(maxY, Math.max(0, editing.$elem.parent().index() - 1 + dy));
        }

        editing.finish(
          () => tableNavigate(true, evt, x, y, dx, dy, maxX, maxY)
        );
      }
      else {
        tableNavigate(false, evt, x, y, dx, dy, maxX, maxY);
      }

      evt.preventDefault();
    }
  }

  /**
   * main window mouseup handler
   * @returns {void} void
   */
  function mouseUpHandler() {
    if (editing.clicked) {
      // handle selecting from inside to outside input
      editing.unlock();
      editing.clicked = false;
    }
    else {
      editing.finish();
    }
  }

  $.fn.editable = function editable(editHook, type, suggestion, add) {
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

    this.editable = add ? new AddItem(options) : new EditItem(options);

    return this;
  };

  class AutoSearch {
    constructor($input, page, col) {
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

          api.request(
            args.join("/"), "GET", null, user.apiKey,
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
      console.warn("Error loading suggestions!");
    }

    suggestionsComplete() {
      this.$spinner.hide();

      this.loading = false;
    }
  }

  class AutoSearchDropdown extends AutoSearch {
    constructor($input, page, col) {
      super($input, page, col);

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

  $(document).ready(() => {
    $(window)
    .on("mouseup", mouseUpHandler)
    .on("keydown", keyDownHandler);

    // handle user login
    user.init($("#login-form").children(".input-pin"), $("#login-form"));

    $(".nav-link").each(navHandler);

    $("#nav-link-logout").on("mousedown", () => user.logout());

    currentPage = Cookies.get("currentPage");

    if (!currentPage) {
      currentPage = "overview";
    }
  });
})(jQuery);

