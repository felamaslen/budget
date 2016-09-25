"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function Budget($) {
  var PIE_LABEL_RADIUS_START = 1.1;
  var PIE_LABEL_RADIUS_SCALE = 1.2;
  var PIE_LABEL_INSIDE_RADIUS = 0.6;
  var PIE_LABEL_SWITCH_POINT = 0.65;
  var PIE_LABEL_SCALE_FACTOR_PRE = 0.4;
  var PIE_LABEL_SCALE_FACTOR_POST = 1.2;
  var PIE_SMALL_LABEL_OFFSET = 10;

  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var editingAdd = false;

  var pages = {};
  var pageActive = null;
  var navActive = null;

  var currentPage = void 0;

  var graphHidden = false;

  var categoryColors = {
    funds: [84, 110, 122],
    bills: [183, 28, 28],
    food: [67, 160, 71],
    general: [1, 87, 155],
    holiday: [0, 137, 123],
    social: [191, 158, 36],
    in: [36, 191, 55],
    out: [191, 36, 36],
    net: [[36, 191, 55], [191, 36, 36]],
    predicted: [36, 191, 55],
    balance: [36, 191, 55]
  };

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
    var sorted = array.concat().sort();

    var numKeys = sorted.length;

    if (numKeys & 1) {
      // odd
      return sorted[Math.floor(numKeys / 2)];
    }

    // even
    return 0.5 * (sorted[numKeys / 2 - 1] + sorted[numKeys / 2]);
  }
  function arrayAverage(array, offset) {
    return array.slice(0, -1 * offset).reduce(function (red, item) {
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

  var YMD = function () {
    function YMD(year, month, date) {
      _classCallCheck(this, YMD);

      this.year = year;
      this.month = month;
      this.date = date;
    }

    _createClass(YMD, [{
      key: "toString",
      value: function toString() {
        return [this.year, this.month, this.date].join(",");
      }
    }, {
      key: "isAfter",
      value: function isAfter(date2) {
        // returns true if date1 is after date2
        return this.year > date2.year || this.year === date2.year && (this.month > date2.month || this.month === date2.month && this.date > date2.date);
      }
    }, {
      key: "isEqual",
      value: function isEqual(date2) {
        return this.year === date2.year && this.month === date2.month && this.date === date2.date;
      }
    }, {
      key: "format",
      value: function format() {
        return leadingZeroes(this.date) + "/" + leadingZeroes(this.month) + "/" + this.year;
      }
    }]);

    return YMD;
  }();

  var todayDate = new Date();
  var today = new YMD(todayDate.getFullYear(), todayDate.getMonth() + 1, todayDate.getDate());

  function rgb(color) {
    return "#" + color.map(function (item) {
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
    } else if (negative) {
      score = 0;
    }

    return rgb(color.map(function (value) {
      return Math.round(255 - (255 - value) * score);
    }));
  }
  function getTickSize(min, max, numTicks) {
    var minimum = (max - min) / numTicks;

    var magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.log(10)));

    var res = minimum / magnitude;

    var tick = void 0;

    if (res > 5) {
      tick = 10 * magnitude;
    } else if (res > 2) {
      tick = 5 * magnitude;
    } else if (res > 1) {
      tick = 2 * magnitude;
    } else {
      tick = magnitude;
    }

    return tick;
  }

  function validateDateInput(val) {
    var isDate = val.match(/^[0-3]?[0-9]\/[0-1]?[0-9](\/[0-9]{2}([0-9]{2})?)?$/);

    if (!isDate) {
      console.warn("\"" + val + "\" isn\"t a date");

      return null;
    }

    var year = void 0;

    var split = val.split("/");

    if (split.length < 3) {
      year = today.year;
    } else {
      year = parseInt(split[2], 10);

      if (year < 100) {
        year += 2000;
      }
    }

    var month = parseInt(split[1], 10);

    var date = parseInt(split[0], 10);

    return new YMD(year, month, date);
  }
  function validateCurrencyInput(val) {
    var floatVal = parseFloat(val);

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

    var changed = false;

    switch (type) {
      case "date":
        changed = !val.isEqual(compare);
        break;
      case "cost":
      case "text":
      default:
        changed = val !== compare;
    }

    return { val: val, changed: changed };
  }

  function numberFormat(number) {
    // adds commas to a long number
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function formatCurrency(number, raw, noZeroes, abbreviate) {
    var absValuePounds = Math.abs(number) / 100;

    var abbreviation = "";

    var log = 0;

    var abbr = ["k", "m", "bn", "trn"];

    if (abbreviate && number !== 0) {
      log = Math.min(Math.floor(Math.log(absValuePounds) / Math.log(10) / 3), abbr.length);
    }

    if (log > 0) {
      absValuePounds = Math.round(100 * absValuePounds / Math.pow(10, log * 3)) / 100;

      abbreviation = abbr[log - 1];
    } else if (typeof noZeroes === "undefined" || !noZeroes || number === 0) {
      absValuePounds = absValuePounds.toFixed(2);
    }

    return (number < 0 ? "&minus;" : "") + (raw ? "£" : "&pound;") + numberFormat(absValuePounds) + abbreviation;
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

  var Api = function () {
    function Api() {
      var _this = this;

      _classCallCheck(this, Api);

      this.apiUrl = "rest.php?t=";

      this.queuedMain = 0;
      this.queuedMinor = 0;

      // make loader
      this.$spinner = $("<div></div>").addClass("progress-outer");

      var $spinnerInner = $("<div></div>").addClass("progress-inner");

      var $spinnerElem = $("<div></div>").addClass("progress").append($("<div></div>").text("Loading..."));

      $spinnerInner.append($spinnerElem);

      this.$spinner.append($spinnerInner);

      $(document).ready(function () {
        $(document.body).append(_this.$spinner);
      });
    }

    _createClass(Api, [{
      key: "incrementRequestQueue",
      value: function incrementRequestQueue(interrupt) {
        if (interrupt) {
          if (!this.queuedMain & ++this.queuedMain > 0) {
            this.$spinner.show();
          }
        } else if (!this.queuedMinor & ++this.queuedMinor > 0) {
          $(document.body).addClass("wait");
        }
      }
    }, {
      key: "decrementRequestQueue",
      value: function decrementRequestQueue(interrupt) {
        if (interrupt) {
          if (this.queuedMain & ! --this.queuedMain) {
            this.$spinner.hide();
          }
        } else if (this.queuedMinor & ! --this.queuedMinor) {
          $(document.body).removeClass("wait");
        }
      }
    }, {
      key: "request",
      value: function request(path, type, params, apiKey, _success, _error, _complete, interrupt) {
        var _this2 = this;

        this.incrementRequestQueue(interrupt);

        $.ajax({
          url: this.apiUrl + path,
          type: type,
          dataType: "json",
          data: params,
          context: this,
          beforeSend: function beforeSend(xhr) {
            if (apiKey) {
              xhr.setRequestHeader("Authorization", apiKey);
            }
          },
          success: function success(data) {
            if (data && data.error === false) {
              if (_success) {
                _success(data);
              }
            } else {
              console.warn("API says: " + data.errorText);
              if (_error) {
                _error(data.errorText);
              }
            }
          },
          error: function error() {
            console.warn("General API error!");
            if (_error) {
              _error();
            }
          },
          complete: function complete() {
            _this2.decrementRequestQueue(interrupt);

            if (_complete) {
              _complete();
            }
          }
        });
      }
    }]);

    return Api;
  }();

  var api = new Api();

  var GoogleFinanceAPI = function () {
    function GoogleFinanceAPI() {
      _classCallCheck(this, GoogleFinanceAPI);
    }

    _createClass(GoogleFinanceAPI, [{
      key: "get",
      value: function get(stocks, success, error, complete) {
        var symbols = [];

        for (var symbol in stocks) {
          symbols.push(symbol);
        }

        $.ajax({
          url: "https://www.google.com/finance/info?client=ig&q=" + symbols.join(",") + "&callback=?",
          type: "GET",
          data: { q: symbols.join(",") },
          dataType: "json",
          success: success,
          error: error,
          complete: complete
        });
      }
    }]);

    return GoogleFinanceAPI;
  }();

  var finance = new GoogleFinanceAPI();

  var User = function () {
    function User() {
      _classCallCheck(this, User);

      this.$input = null;
      this.$form = null;

      this.inputActive = -1;
      this.loginPin;

      this.loggingIn = false;

      this.uid = 0;
      this.name = "";
      this.apiKey = null;
    }

    _createClass(User, [{
      key: "init",
      value: function init($input, $form) {
        var _this3 = this;

        this.$input = $input;
        this.$form = $form;

        var focusLogin = true;

        // check if we have a localStorage user defined
        if (typeof Storage !== "undefined") {
          var loginPin = localStorage.getItem("userPin");

          if (loginPin) {
            focusLogin = false;

            this.loginPin = loginPin;

            this.login();
          }
        }

        this.$input.on("click", function (evt) {
          return _this3.handleInputClick(evt);
        });

        if (focusLogin) {
          this.focus();
        }
      }
    }, {
      key: "focus",
      value: function focus() {
        this.$form.fadeIn();

        this.inputActive = 0;
        this.loginPin = 0;

        this.$input.removeClass("active").removeClass("done");
        this.$input.slice(this.inputActive, 1).addClass("active");
      }
    }, {
      key: "login",
      value: function login() {
        var _this4 = this;

        if (this.loggingIn) {
          return;
        }
        this.loggingIn = true;

        api.request("login", "POST", { pin: this.loginPin }, null, function (data) {
          return _this4.onLoginSuccess(data);
        }, function () {
          return _this4.onLoginFail();
        }, function () {
          return _this4.onLoginRequestComplete();
        }, true);
      }
    }, {
      key: "onLoginSuccess",
      value: function onLoginSuccess(data) {
        this.uid = data.uid;
        this.name = data.name;
        this.apiKey = data.api_key;

        // store api key so we don't need to log in every time
        if (typeof Storage !== "undefined") {
          localStorage.setItem("userPin", this.loginPin);
        } else {
          console.warn("Your browser does not support HTML5 storage, so logins won't be remembered.");
        }

        $("#nav-link-" + currentPage).mousedown();

        this.$form.fadeOut();
      }
    }, {
      key: "onLoginFail",
      value: function onLoginFail() {
        this.focus();
      }
    }, {
      key: "onLoginRequestComplete",
      value: function onLoginRequestComplete() {
        this.loggingIn = false;
      }
    }, {
      key: "logout",
      value: function logout() {
        this.uid = 0;
        this.name = "";
        this.apiKey = null;

        if (typeof Storage !== "undefined") {
          localStorage.removeItem("userPin");
        }

        for (var id in pages) {
          pages[id].$page.empty();

          $("#nav-link-" + id).removeClass("active");
        }

        pages = {};

        navActive = null;

        currentPage = pageActive;

        $("#bg").fadeIn();

        this.focus();
      }
    }, {
      key: "handleInputClick",
      value: function handleInputClick(evt) {
        var index = $(evt.target).index() - 1;

        if (index <= this.inputActive) {
          this.loginPin -= this.loginPin % Math.pow(10, 4 - index);

          this.$input.removeClass("active").removeClass("done");

          this.inputActive = index;

          this.$input.slice(0, this.inputActive).addClass("done");

          this.$input.slice(this.inputActive, this.inputActive + 1).addClass("active");
        }
      }
    }]);

    return User;
  }();

  var user = new User();

  var editing = null;

  var EditItem = function () {
    function EditItem($input, $td, editHook, type) {
      _classCallCheck(this, EditItem);

      this.$input = $input;
      this.$td = $td;
      this.editHook = editHook;
      this.type = type;

      this.locked = false;
      this.active = false;

      if (this.$td) {
        this.$td.on("mousedown", this.finishLastAndActivate.bind(this));

        // these two events prevent a click action on the input itself from triggering an edit
        this.$input.on("mouseup", this.unlock.bind(this));
        this.$input.on("mousedown", this.lock.bind(this));

        this.$td.append(this.$input).addClass("editable");
      }
    }

    _createClass(EditItem, [{
      key: "activate",
      value: function activate() {
        editing = this;

        var val = this.$td.data("val");

        switch (this.type) {
          case "date":
            val = val.format();
            break;
          case "cost":
            val = (val / 100).toFixed(2);
            break;
        }

        this.$input.val(val).show();

        this.$td.addClass("editing");

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

    }, {
      key: "finish",
      value: function finish(callback) {
        if (!this.active) {
          // console.warn("Tried to finish editing while not active");
          return false;
        }

        if (this.locked) {
          // probably still loading previous edit request
          console.warn("Tried to finish editing while locked");
          return false;
        }

        if (this.editHook) {
          this.lock();

          this.editHook(callback);

          return true;
        }

        console.warn("Tried to finish editing while no hook set");

        return false;
      }
    }, {
      key: "cancel",
      value: function cancel() {
        this.unlock();

        this.$input.hide();
        this.$td.removeClass("editing");

        if (!this.active) {
          return false;
        }

        this.active = false;

        return true;
      }
    }, {
      key: "finishLastAndActivate",
      value: function finishLastAndActivate(evt) {
        var _this5 = this;

        // this is called when the user does something like click away from the edit box

        if (editing.active) {
          // there is still an item being edited, let's finish that one first
          editing.finish(function () {
            return _this5.activate();
          });
        } else {
          // no item was being edited beforehand, so just activate this one
          this.activate();
        }

        evt.stopPropagation();
      }
    }, {
      key: "deactivate",
      value: function deactivate(newValRaw) {
        var newVal = newValRaw;

        switch (this.type) {
          case "date":
            newVal = newVal.format();
            break;
          case "cost":
            newVal = formatCurrency(newVal);
            break;
        }

        this.$td.parent().data(this.type, newValRaw);

        this.$input.hide();
        this.$td.removeClass("editing").children(".text").html(newVal);

        this.locked = false;
        this.active = false;
      }
    }, {
      key: "isLocked",
      value: function isLocked() {
        return this.locked;
      }
    }, {
      key: "lock",
      value: function lock(evt) {
        this.locked = true;

        if (evt) {
          evt.stopPropagation();
        }
      }
    }, {
      key: "unlock",
      value: function unlock(evt) {
        this.locked = false;

        if (evt) {
          evt.stopPropagation();
        }
      }
    }]);

    return EditItem;
  }();

  editing = new EditItem();

  var Graph = function Graph(options) {
    _classCallCheck(this, Graph);

    this.supported = !!window.CanvasRenderingContext2D;

    if (!this.supported) {
      console.warn("HTML5 Canvas is not supported! Not drawing graphs");

      return;
    }

    this.width = options.width;
    this.height = options.height;
    this.$cont = options.$cont;
    this.title = options.title;
    this.page = options.page;

    this.$canvas = $("<canvas></canvas>").attr({
      width: this.width,
      height: this.height
    });

    this.ctx = this.$canvas[0].getContext("2d");
  };

  var LineGraph = function (_Graph) {
    _inherits(LineGraph, _Graph);

    function LineGraph(options) {
      _classCallCheck(this, LineGraph);

      var _this6 = _possibleConstructorReturn(this, (LineGraph.__proto__ || Object.getPrototypeOf(LineGraph)).call(this, options));

      _this6.padX1 = options.pad && options.pad[3] || 0;
      _this6.padX2 = options.pad && options.pad[1] || 0;
      _this6.padY1 = options.pad && options.pad[0] || 0;
      _this6.padY2 = options.pad && options.pad[2] || 0;

      _this6.setRange(options.range);

      _this6.tension = options.tension || 0.5;

      _this6.fill = options.fill;
      _this6.stroke = options.stroke || true;

      _this6.transition = options.transition || [];

      _this6.$gCont = $("<div></div>").addClass("graph-container").attr("id", "graph-" + _this6.title);

      _this6.$gCont.append(_this6.$canvas);

      _this6.$cont.append(_this6.$gCont);
      return _this6;
    }

    _createClass(LineGraph, [{
      key: "setRange",
      value: function setRange(range) {
        this.minX = range[0];
        this.maxX = range[1];
        this.minY = range[2];
        this.maxY = range[3];
      }
    }, {
      key: "pixX",
      value: function pixX(x) {
        return this.padX1 + (x - this.minX) / (this.maxX - this.minX) * (this.width - this.padX1 - this.padX2);
      }
    }, {
      key: "pixY",
      value: function pixY(y) {
        return this.height - this.padY2 - (y - this.minY) / (this.maxY - this.minY) * (this.height - this.padY1 - this.padY2);
      }
    }, {
      key: "valX",
      value: function valX(pix) {
        return (pix - this.padX1) * (this.maxX - this.minX) / (this.width - this.padX1 - this.padX2) + this.minX;
      }
    }, {
      key: "valY",
      value: function valY(pix) {
        return (this.height - this.padY2 - pix) * (this.maxY - this.minY) / (this.height - this.padY1 - this.padY2) + this.minY;
      }
    }, {
      key: "getSpline",
      value: function getSpline(p) {
        // array of [pixX, pixY] values
        var curve = [];

        // Hermite spline
        // cardinal spline
        var c = 1 - this.tension; // tension parameter

        var n = p.length - 1;

        // secants
        var d = [];

        for (var k = 0; k < n; k++) {
          d[k] = p[k + 1] - p[k];
        }

        // tangents
        var m = p.map(function (yv, k) {
          if (k === 0) {
            return d[0];
          }

          if (k === n) {
            return d[n - 1];
          }

          return c * (d[k - 1] + d[k]);
        });

        var h00 = function h00(t) {
          return (1 + 2 * t) * Math.pow(1 - t, 2);
        };
        var h10 = function h10(t) {
          return t * Math.pow(1 - t, 2);
        };
        var h01 = function h01(t) {
          return Math.pow(t, 2) * (3 - 2 * t);
        };
        var h11 = function h11(t) {
          return Math.pow(t, 2) * (t - 1);
        };

        var f = function f(x, xk, yk, xk1, yk1, mk, mk1) {
          var t = (x - xk) / (xk1 - xk);

          return h00(t) * yk + h10(t) * (xk1 - xk) * mk + h01(t) * yk1 + h11(t) * (xk1 - xk) * mk1;
        };

        var xn = this.pixX(0);

        for (var _k = 0; _k < n; _k++) {
          var curvePiece = [];

          var k1 = _k + 1;

          var x = xn;
          xn = this.pixX(k1);

          // interpolate the curve between this point and the next
          for (var j = 0; j < xn - x; j++) {
            var xv = this.valX(x + j);
            var yv = f(xv, _k, p[_k], k1, p[k1], m[_k], m[k1]);

            curvePiece.push([x + j, this.pixY(yv)]);
          }

          curve.push(curvePiece);
        }

        // add the last point
        curve[curve.length - 1].push([this.pixX(n), this.pixY(p[n])]);

        return curve;
      }
    }, {
      key: "drawCubicLine",
      value: function drawCubicLine(p, colors) {
        var _this7 = this;

        var curve = this.getSpline(p);

        if (this.fill) {
          this.ctx.beginPath();

          this.ctx.fillStyle = colors[0];

          this.ctx.moveTo(this.pixX(0), this.pixY(0));

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = curve[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var piece = _step.value;

              piece.forEach(function (point) {
                _this7.ctx.lineTo(point[0], point[1]);
              });
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          this.ctx.lineTo(this.pixX(p.length - 1), this.pixY(0));

          this.ctx.lineTo(this.pixX(0), this.pixY(0));

          this.ctx.fill();

          this.ctx.closePath();
        }

        if (this.stroke) {
          (function () {
            _this7.ctx.lineWidth = 2;

            _this7.ctx.beginPath();

            var colorKey = 0;

            _this7.ctx.strokeStyle = colors[colorKey];

            var moved = false;

            curve.forEach(function (piece, i) {
              if (i === _this7.transition[0]) {
                _this7.transition.shift();

                _this7.ctx.lineTo(piece[0][0], piece[0][1]);
                _this7.ctx.stroke();

                _this7.ctx.closePath();
                _this7.ctx.beginPath();

                _this7.ctx.strokeStyle = colors[++colorKey % colors.length];

                moved = false;
              }

              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = piece[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var point = _step2.value;

                  if (!moved) {
                    _this7.ctx.moveTo(point[0], point[1]);

                    moved = true;
                  } else {
                    _this7.ctx.lineTo(point[0], point[1]);
                  }
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }
            });

            _this7.ctx.stroke();

            _this7.ctx.closePath();
          })();
        }
      }
    }]);

    return LineGraph;
  }(Graph);

  var GraphBalance = function (_LineGraph) {
    _inherits(GraphBalance, _LineGraph);

    function GraphBalance(options) {
      _classCallCheck(this, GraphBalance);

      var _this8 = _possibleConstructorReturn(this, (GraphBalance.__proto__ || Object.getPrototypeOf(GraphBalance)).call(this, options));

      _this8.currentYear = options.currentYear;
      _this8.currentMonth = options.currentMonth;

      _this8.startYear = options.startYear;
      _this8.startMonth = options.startMonth;

      _this8.yearMonths = options.yearMonths;

      _this8.colors = ["#039", "red"];
      _this8.tension = 0.5;
      _this8.stroke = true;

      _this8.getData(options.dataPast, options.dataFuture);
      return _this8;
    }

    _createClass(GraphBalance, [{
      key: "draw",
      value: function draw() {
        // clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // draw axes
        this.ctx.strokeStyle = "#999";
        this.ctx.lineWidth = 1;

        this.ctx.font = "12px Arial, Helvetica, sans-serif";
        this.ctx.fillStyle = "#333";
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "center";

        // draw month (X axis) ticks, and vertical lines
        for (var i = 3; i < this.maxX - 1; i += 4) {
          var tickName = months[this.yearMonths[i][1] - 1] + "-" + (this.yearMonths[i][0] % 100).toString();

          var tickPosX = Math.floor(this.pixX(i)) + 0.5;
          var tickPosY = Math.floor(this.pixY(0)) + 0.5;

          // draw month tick (X axis)
          this.ctx.fillText(tickName, tickPosX, tickPosY + 2);

          // draw vertical line
          this.ctx.beginPath();
          this.ctx.moveTo(tickPosX, 0);
          this.ctx.lineTo(tickPosX, tickPosY);
          this.ctx.stroke();
        }

        // calculate tick range
        var tickSize = getTickSize(0, this.maxY, 5);

        var ticksY = [];

        // draw value (Y axis) ticks and horizontal lines
        for (var _i = 1; _i < 4; _i++) {
          var tickPos = Math.floor(this.pixY(_i * tickSize)) + 0.5;

          // add value (Y axis) tick to array to draw on top of graph
          ticksY.push([_i * tickSize * 100, tickPos]);

          // drwa horizontal line
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

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = ticksY[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var tick = _step3.value;

            var _tickName = formatCurrency(tick[0], true, true);

            this.ctx.fillText(_tickName, this.padX1, tick[1]);
          }

          // add title and key
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.ctx.fillRect(45, 8, 200, 60);
        this.ctx.closePath();

        this.ctx.font = "16px bold Arial, Helvetica, sans-serif";
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";

        this.ctx.fillText("Balance", 65, 10);

        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#039";
        this.ctx.moveTo(50, 40);
        this.ctx.lineTo(74, 40);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.font = "11px Arial, Helvetica, sans-serif";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "#333";
        this.ctx.fillText("Actual", 78, 40);

        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "red";
        this.ctx.moveTo(130, 40);
        this.ctx.lineTo(154, 40);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.fillText("Predicted", 158, 40);
      }
    }, {
      key: "getData",
      value: function getData(past, future) {
        var _this9 = this;

        var dataPast = past.map(hundredth);
        var dataFuture = future.map(hundredth);

        this.futureKey = 12 * (this.currentYear - this.startYear) + this.currentMonth - this.startMonth + 1;

        this.data = dataPast.map(function (item, key) {
          return key < _this9.futureKey ? item : dataFuture[key];
        });

        this.maxY = Math.max.apply(null, this.data);

        this.transition = [this.futureKey - 1];
      }
    }, {
      key: "update",
      value: function update(costBalance, costPredicted) {
        this.getData(costBalance, costPredicted);

        this.draw();
      }
    }]);

    return GraphBalance;
  }(LineGraph);

  var GraphSpend = function (_LineGraph2) {
    _inherits(GraphSpend, _LineGraph2);

    function GraphSpend(options) {
      _classCallCheck(this, GraphSpend);

      var _this10 = _possibleConstructorReturn(this, (GraphSpend.__proto__ || Object.getPrototypeOf(GraphSpend)).call(this, options));

      _this10.tension = 1;

      _this10.yearMonths = options.yearMonths;

      _this10.categories = ["bills", "food", "general", "holiday", "social"];

      _this10.textColors = categoryColors;

      _this10.colors = {};

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _this10.categories[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var category = _step4.value;

          _this10.colors[category] = [rgba(_this10.textColors[category], 0.75)];
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      _this10.fill = true;

      _this10.getData(options.data);
      return _this10;
    }

    _createClass(GraphSpend, [{
      key: "draw",
      value: function draw() {
        var _this11 = this;

        // calculate tick range
        var tickSize = getTickSize(this.minY, this.maxY, 5);

        this.ctx.clearRect(0, 0, this.width, this.height);
        // draw X axis ticks
        this.ctx.strokeStyle = "#999";
        this.ctx.lineWidth = 1;

        var ticksY = [];
        for (var i = 3, j = 0; i < this.maxX - 1; i += 2, j++) {
          var tickPos = Math.floor(this.pixX(i)) + 0.5;

          ticksY.push([i, tickPos]);

          this.ctx.beginPath();
          this.ctx.moveTo(tickPos, this.padY1);
          this.ctx.lineTo(tickPos, this.height - this.padY2 + 10 * (1 - j % 2));
          this.ctx.stroke();
        }

        // draw Y axis ticks
        this.ctx.strokeStyle = "#333";

        var ticksX = [];
        for (var _i2 = 0; _i2 < 3; _i2++) {
          var _tickPos = Math.floor(this.pixY(tickSize * _i2)) + 0.5;

          ticksX.push(_tickPos);

          this.ctx.beginPath();
          this.ctx.moveTo(this.padX1, _tickPos);
          this.ctx.lineTo(this.width - this.padX2, _tickPos);
          this.ctx.stroke();
        }

        // plot data
        this.data.forEach(function (line, i) {
          _this11.drawCubicLine(line, _this11.colors[_this11.categories[_this11.categories.length - 1 - i]]);
        });

        this.ctx.font = "12px Arial, Helvetica, sans-serif";
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#000";

        ticksX.forEach(function (tickPos, i) {
          if (i > 0) {
            _this11.ctx.strokeStyle = "#999";

            var tickName = "£" + numberFormat(tickSize * i);

            _this11.ctx.fillText(tickName, 0, tickPos);
          }
        });

        // draw month ticks
        this.ctx.fillStyle = "#333";
        this.ctx.textBaseline = "bottom";
        this.ctx.textAlign = "center";

        ticksY.forEach(function (tick, j) {
          var tickName = months[_this11.yearMonths[tick[0]][1] - 1] + "-" + (_this11.yearMonths[tick[0]][0] % 100).toString();

          _this11.ctx.fillText(tickName, tick[1], _this11.height - _this11.padY2 + 3 + 10.5 * (2 - j % 2));
        });

        // add title and key
        this.ctx.font = "16px bold Arial, Helvetica, sans-serif";
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";

        this.ctx.fillText("Spending", 15, 10);

        this.ctx.textBaseline = "middle";
        this.ctx.font = "13px Arial, Helvetica, sans-serif";

        var fontColor = "#333";

        this.ctx.fillStyle = rgb(this.textColors.bills);
        this.ctx.fillRect(5, 34, 12, 12);
        this.ctx.fillStyle = fontColor;
        this.ctx.fillText("Bills", 20, 40);

        this.ctx.fillStyle = rgb(this.textColors.food);
        this.ctx.fillRect(57, 34, 12, 12);
        this.ctx.fillStyle = fontColor;
        this.ctx.fillText("Food", 72, 40);

        this.ctx.fillStyle = rgb(this.textColors.general);
        this.ctx.fillRect(115, 34, 12, 12);
        this.ctx.fillStyle = fontColor;
        this.ctx.fillText("General", 130, 40);

        this.ctx.fillStyle = rgb(this.textColors.holiday);
        this.ctx.fillRect(185, 34, 12, 12);
        this.ctx.fillStyle = fontColor;
        this.ctx.fillText("Holiday", 200, 40);

        this.ctx.fillStyle = rgb(this.textColors.social);
        this.ctx.fillRect(250, 34, 12, 12);
        this.ctx.fillStyle = fontColor;
        this.ctx.fillText("Social", 265, 40);
      }
    }, {
      key: "getData",
      value: function getData(data) {
        var sum = [];

        var maxY = 0;

        this.data = this.categories.map(function (category) {
          var thisData = data[category].map(function (item, key) {
            if (!sum[key]) {
              sum[key] = 0;
            }

            sum[key] += item > 0 ? hundredth(item) : 0;

            return sum[key];
          });

          maxY = Math.max(maxY, Math.max.apply(null, thisData));

          return thisData;
        }).reverse();

        this.maxY = maxY;

        // const chartCategories = this.categories.concat().reverse();
      }
    }, {
      key: "update",
      value: function update(data) {
        this.getData(data);

        this.draw();
      }
    }]);

    return GraphSpend;
  }(LineGraph);

  var PieGraph = function (_Graph2) {
    _inherits(PieGraph, _Graph2);

    function PieGraph(options) {
      _classCallCheck(this, PieGraph);

      var _this12 = _possibleConstructorReturn(this, (PieGraph.__proto__ || Object.getPrototypeOf(PieGraph)).call(this, options));

      _this12.data = options.data.data;
      _this12.total = options.data.total;
      _this12.type = options.data.type;
      _this12.index = options.index;
      _this12.stretchFactor = options.stretchFactor;
      _this12.pieTolerance = options.pieTolerance;
      _this12.pieLabelLength = options.pieLabelLength;

      var $gCont = $("<div></div>").addClass("graph-container").addClass("graph-container-pie").addClass("graph-container-pie-" + _this12.index.toString()).attr("id", "graph-pie-" + _this12.title.toLowerCase() + "-" + _this12.page);

      _this12.colors = ["#f15854", "#decf3f", "#b276b2", "#b2912f", "#f17cb0", "#60bd68", "#faa43a", "#5da5da"];

      _this12.labelColors = {};

      _this12.labelKey = 0;

      $gCont.append(_this12.$canvas);

      _this12.$cont.append($gCont);
      return _this12;
    }

    _createClass(PieGraph, [{
      key: "stretch",
      value: function stretch() {
        this.ctx.save();
        this.ctx.translate(this.width * 0.5 * (1 - this.stretchFactor), 0);
        this.ctx.scale(this.stretchFactor, 1);
      }
    }, {
      key: "unstretch",
      value: function unstretch() {
        this.ctx.restore();
      }
    }, {
      key: "stretchPoint",
      value: function stretchPoint(x) {
        return this.width / 2 + (x - this.width / 2) * this.stretchFactor;
      }
    }, {
      key: "pointFromCircle",
      value: function pointFromCircle(centreX, centreY, radius, angle) {
        return [centreX + radius * Math.cos(angle), centreY + radius * Math.sin(angle)];
      }
    }, {
      key: "draw",
      value: function draw() {
        var pio2 = Math.PI / 2;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // set label colours
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var item = _step5.value;

            var label = item[0];

            if (!this.labelColors[label]) {
              var offset = Math.floor(this.labelKey / this.colors.length);

              this.labelColors[label] = this.colors[(offset + this.labelKey++) % this.colors.length];
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        this.ctx.strokeStyle = "#000";
        this.ctx.font = "12px Arial, Helvetica, sans-serif";

        var smallLabelOffset = PIE_SMALL_LABEL_OFFSET;

        var lastLabelAngle = 0;

        var centreX = 9 * this.width / 17;
        var centreY = 5 * this.height / 8;

        var radius = Math.min(this.width, this.height) / 4.5;

        var angle = -0.1 - pio2;

        var labelRadiusExtension = function labelRadiusExtension(x) {
          return x < PIE_LABEL_SWITCH_POINT ? PIE_LABEL_SCALE_FACTOR_PRE * Math.sin(Math.PI * x / 2 / PIE_LABEL_SWITCH_POINT) : -PIE_LABEL_SCALE_FACTOR_POST * (x - 1) / (1 - PIE_LABEL_SWITCH_POINT);
        };

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.data[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var p = _step6.value;

            var thisAngle = 2 * Math.PI * p[1] / this.total;

            var thisColor = this.labelColors[p[0]];

            var newAngle = angle + thisAngle;

            this.stretch();

            this.ctx.beginPath();
            this.ctx.moveTo(centreX, centreY);
            this.ctx.arc(centreX, centreY, radius, angle, newAngle, false);

            this.unstretch();

            this.ctx.fillStyle = thisColor;
            this.ctx.fill();
            this.ctx.stroke();

            // draw label
            var midAngle = (angle + 0.5 * thisAngle + 2 * Math.PI) % (2 * Math.PI);

            var labelDirection = -1;

            if (!lastLabelAngle || (midAngle - lastLabelAngle + 2 * Math.PI) % (2 * Math.PI) > this.pieTolerance) {
              lastLabelAngle = midAngle;

              var quadrant = Math.floor((midAngle + pio2) / pio2) % 4;

              var labelRadiusScale = PIE_LABEL_RADIUS_START;

              if (quadrant === 3) {
                // x is the fraction of the top-left quadrant where the label is
                var x = (midAngle - Math.PI) / pio2;

                if (x >= PIE_LABEL_SWITCH_POINT) {
                  labelDirection = 1;
                }

                labelRadiusScale = PIE_LABEL_RADIUS_START + PIE_LABEL_RADIUS_SCALE * labelRadiusExtension(x);
              }

              var labelRadius = radius * labelRadiusScale;

              var labelBegin = this.pointFromCircle(centreX, centreY, radius * PIE_LABEL_INSIDE_RADIUS, midAngle);
              var labelEnd = this.pointFromCircle(centreX, centreY, labelRadius, midAngle);

              this.stretch();

              this.ctx.beginPath();
              this.ctx.moveTo(labelBegin[0], labelBegin[1]);

              var textAnchor = this.pointFromCircle(centreX, centreY, labelRadius + 1, midAngle);

              textAnchor[1] = Math.floor(textAnchor[1]) + 0.5;

              var baseline = quadrant === 1 && midAngle > 0.2 ? "top" : "middle";
              var align = quadrant < 2 || labelDirection > 0 ? "left" : "right";

              if (quadrant === 3) {
                this.ctx.lineTo(textAnchor[0], textAnchor[1]);

                textAnchor[0] += labelDirection * smallLabelOffset++;

                this.ctx.lineTo(textAnchor[0] - 3 * labelDirection, textAnchor[1]);
              } else {
                this.ctx.lineTo(labelEnd[0], labelEnd[1]);
              }

              this.unstretch();

              this.ctx.stroke();
              this.ctx.closePath();

              var labelValue = p[1];

              var labelName = p[0];
              if (labelName.length > this.pieLabelLength) {
                labelName = trim(labelName.substring(0, this.pieLabelLength)) + "... ";
              }

              var _label = labelName + " (" + formatData(labelValue, this.type, true) + ")";

              this.ctx.fillStyle = "black";
              this.ctx.textAlign = align;
              this.ctx.textBaseline = baseline;
              this.ctx.fillText(_label, this.stretchPoint(textAnchor[0]), textAnchor[1]);
            }

            angle = newAngle;
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        this.ctx.fillStyle = "#000";
        this.ctx.font = "18px bold Arial, Helvetica, sans-serif";
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "top";

        this.ctx.fillText(this.title, this.width - 10, 10);
      }
    }]);

    return PieGraph;
  }(Graph);

  var Page = function () {
    function Page(options) {
      _classCallCheck(this, Page);

      this.page = options.page;
      this.$page = $("#page-" + this.page);

      this.data = null;

      this.loading = false;
    }

    _createClass(Page, [{
      key: "hookDataAddArgs",
      value: function hookDataAddArgs(args) {
        return args;
      }
    }, {
      key: "hookDataLoadedBeforeRender",
      value: function hookDataLoadedBeforeRender() {}
    }, {
      key: "hookDataLoadedAfterRender",
      value: function hookDataLoadedAfterRender() {}
    }, {
      key: "hookSwitchToCallback",
      value: function hookSwitchToCallback() {}
    }, {
      key: "hookSwitchToAfterLoad",
      value: function hookSwitchToAfterLoad() {}
    }, {
      key: "loadData",
      value: function loadData(callback, render, changed) {
        var _this13 = this;

        if (this.loading) {
          return;
        }

        if (this.data && !changed) {
          if (callback) {
            callback();
          }
        } else {
          this.loading = true;
          this.data = [];

          var args = this.hookDataAddArgs(["data", this.page]);

          api.request(args.join("/"), "GET", null, user.apiKey, function (res) {
            return _this13.onDataLoaded(callback, render, res);
          }, null, function () {
            return _this13.onRequestComplete();
          }, true);
        }
      }
    }, {
      key: "onDataLoaded",
      value: function onDataLoaded(callback, render, res) {
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
    }, {
      key: "onRequestComplete",
      value: function onRequestComplete() {
        this.loading = false;
      }
    }, {
      key: "switchTo",
      value: function switchTo(pageExists) {
        var _this14 = this;

        this.loadData(function () {
          return _this14.hookSwitchToAfterLoad();
        }, true);

        this.hookSwitchToCallback(pageExists);
      }
    }, {
      key: "render",
      value: function render() {}
    }]);

    return Page;
  }();

  /**
   * a PageList is a type of page which displays an editable list of data,
   * optionally with pie chart(s)
   */


  var PageList = function (_Page) {
    _inherits(PageList, _Page);

    function PageList(options) {
      _classCallCheck(this, PageList);

      var _this15 = _possibleConstructorReturn(this, (PageList.__proto__ || Object.getPrototypeOf(PageList)).call(this, options));

      _this15.col = options.col; // list of columns
      _this15.colShort = options.colShort;

      _this15.colEdit = options.colEdit || options.col.map(function (item, i) {
        return i;
      });

      _this15.dataType = options.dataType;
      _this15.addDefaultVal = options.addDefaultVal;
      _this15.dailyColumn = options.daily;

      _this15.drawPie = options.drawPie;
      _this15.stretchFactor = options.pieStretch || 1.5;
      _this15.pieWidth = options.pieWidth || 500;
      _this15.pieHeight = options.pieHeight || 300;
      _this15.pieTolerance = pieTolerance;
      _this15.pieLabelLength = options.pieLabelLength || 30;

      _this15.limit = options.limit;
      _this15.offset = 0;

      if (_this15.drawPie) {
        _this15.$graphsOuter = $("<div></div>").addClass("graph-container-outer");

        _this15.$graphs = $("<div></div>").addClass("graph-container-inner");

        _this15.$graphToggle = $("<button></button").addClass("graph-toggle-btn");

        _this15.$graphsOuter.append(_this15.$graphToggle);

        _this15.$graphToggle.on("click", function () {
          graphHidden = !graphHidden;

          $(document.body).toggleClass("graph-hidden", graphHidden);
        });

        _this15.$graphsOuter.append(_this15.$graphs);

        _this15.$page.prepend(_this15.$graphsOuter);
      } else {
        _this15.$page.addClass("graph-hidden");
      }

      // this.dailyAverage = 0;  // TODO
      // this.weeklyAverage = 0; // TODO

      _this15.costTotal = 0;
      return _this15;
    }

    _createClass(PageList, [{
      key: "hookDataAddArgs",
      value: function hookDataAddArgs(args) {
        if (this.offset > 0) {
          args.push(this.offset);
        }

        return args;
      }
    }, {
      key: "hookDataLoadedAfterRender",
      value: function hookDataLoadedAfterRender(callback, res) {
        this.costTotal = res.data.total;

        this.update(res.data.data);

        if (!res.data.older) {
          this.offset = -1;
        }
      }
    }, {
      key: "hookSwitchToCallback",
      value: function hookSwitchToCallback() {
        this.updatePieChart();
      }
    }, {
      key: "update",
      value: function update(newData) {
        this.addNewRows(newData);

        if (this.dailyColumn) {
          this.calculateDaily();
        }
      }
    }, {
      key: "numEditCols",
      value: function numEditCols() {
        return this.colEdit.length;
      }
    }, {
      key: "hookCustomColumns",
      value: function hookCustomColumns(newItem) {
        return newItem;
      }
    }, {
      key: "addNewRows",
      value: function addNewRows(newData) {
        var _this16 = this;

        newData.forEach(function (item, i) {
          var id = parseInt(newData[i].I, 10);

          var newItem = { id: id };

          _this16.$lis[id] = $("<li></li>");

          _this16.$li[id] = {};

          _this16.colEdit.forEach(function (j) {
            var col = _this16.col[j];

            var newDataValue = newData[i][_this16.colShort[j]];

            newItem[col] = getData(newDataValue, _this16.dataType[j]);

            _this16.$li[id][col] = $("<span></span>").addClass(col).append($("<span></span>").addClass("text").html(formatData(newItem[col], _this16.dataType[j]))).data("val", newItem[col]);

            _this16.$li[id][col].editable(_this16.listEditCallback(j), _this16.dataType[j]);

            _this16.$lis[id].append(_this16.$li[id][col]);
          });

          newItem = _this16.hookCustomColumns(newItem, newData[i]);

          if (newItem.date.isAfter(today)) {
            _this16.$lis[id].addClass("future");
          }
          /*
          else if (today.isAfter(newItem.date)) {
            this.$lis[id].addClass("past");
          }
          // */

          _this16.data.push(newItem);

          if (_this16.dailyColumn) {
            _this16.$li[id].daily = $("<span></span>").addClass("daily");
            _this16.$lis[id].append(_this16.$li[id].daily);
          }

          _this16.$lis[id].data("id", id).data("date", newItem.date).data("dataKey", _this16.data.length - 1);

          _this16.$lbody.append(_this16.$lis[id]);
        });

        this.$total.html(formatCurrency(this.costTotal));

        // TODO: average cost
      }
    }, {
      key: "render",
      value: function render() {
        var _this17 = this;

        this.$cont = $("<div></div>").addClass("list-insert").addClass("list-" + this.page).addClass("list");

        this.$total = $("<span></span>");

        this.$lhead = $("<div></div>").addClass("list-head");

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this.colEdit[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var j = _step7.value;

            this.$lhead.append($("<span></span>").addClass(this.col[j]).text(this.col[j]));
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        if (this.dailyColumn) {
          this.$lhead.append($("<span></span>").addClass("daily").text("Daily Tally"));
        }

        this.$lhead.append($("<span></span>").text("Total: ")).append(this.$total);

        this.$cont.append(this.$lhead);

        this.$lbody = $("<ul></ul>").addClass("list-ul");

        this.$liAdd = $("<li></li>").addClass("li-add");

        this.$li = {};
        this.$lis = {};

        this.$addInput = {};
        this.$addInputCont = {};

        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = this.colEdit[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _j = _step8.value;

            var col = this.col[_j];

            if (!col.name || col.edit) {
              this.$addInput[col] = $("<input></input>").addClass("editable-input").addClass("editable-" + col).val(this.addDefaultVal[col]);

              this.$addInput[col].on("focus", function () {
                editingAdd = true;return;
              }).on("blur", function () {
                editingAdd = false;return;
              });

              this.$addInputCont[col] = $("<span></span>").addClass(col).append(this.$addInput[col]);

              this.$liAdd.append(this.$addInputCont[col]);
            }
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        this.$addButton = $("<button></button>").text("Add").on("click", function () {
          return _this17.addNew();
        });

        this.$addButtonCont = $("<span></span>").append(this.$addButton);

        this.$liAdd.append(this.$addButtonCont);

        this.$lbody.append(this.$liAdd);

        this.$cont.append(this.$lbody);

        if (this.limit) {
          this.$lbody[0].addEventListener("mousewheel", function () {
            return _this17.handleScroll();
          }, { passive: true });

          this.$lbody[0].addEventListener("scroll", function () {
            return _this17.handleScroll();
          });
        }

        this.$page.append(this.$cont);
      }
    }, {
      key: "addNew",
      value: function addNew() {
        var _this18 = this;

        this.$addButton.attr("disabled", true);

        var data = {};
        var dataVal = {};

        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this.colEdit[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var j = _step9.value;

            var col = this.col[j];

            var val = validateInput(this.$addInput[col].val(), col);

            if (val === null) {
              console.warn("Must enter valid data");

              this.$addButton.attr("disabled", false);

              return;
            }

            data[col] = val.toString();

            dataVal[col] = val;
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }

        api.request("add/" + this.page, "POST", data, user.apiKey, function (res) {
          return _this18.onNewAdded(dataVal, res);
        }, function () {
          return _this18.onNewError();
        }, function () {
          return _this18.onNewRequestComplete();
        });
      }
    }, {
      key: "onNewAdded",
      value: function onNewAdded(data, response) {
        var newItem = { I: response.id };

        var i = 0;
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = this.colEdit[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var j = _step10.value;

            var col = this.col[j];

            this.$addInput[col].val(this.addDefaultVal[col]);

            newItem[this.colShort[i++]] = data[col];
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }

        var newData = [newItem];

        this.costTotal = parseInt(response.total, 10);

        this.update(newData);

        this.$addInput.date.val("").focus();

        this.updatePieChart();
      }
    }, {
      key: "onNewError",
      value: function onNewError() {
        console.warn("Error inserting row! (Server error)");
      }
    }, {
      key: "onNewRequestComplete",
      value: function onNewRequestComplete() {
        this.sortByDate();

        this.$addButton.attr("disabled", false);
      }
    }, {
      key: "submitEdit",
      value: function submitEdit(id, key, val, callback) {
        var _this19 = this;

        var postData = { id: id };

        postData[key] = val.toString();

        var dataKey = editing.$td.parent().data("dataKey");

        api.request("update/" + this.page, "POST", postData, user.apiKey, function (res) {
          return _this19.onSubmitEdited(id, dataKey, key, val, res);
        }, function () {
          return _this19.onSubmitError();
        }, function () {
          return _this19.onSubmitRequestComplete(dataKey, key, callback);
        });
      }
    }, {
      key: "hookCalculate",
      value: function hookCalculate() {
        this.calculateDaily();
      }
    }, {
      key: "onSubmitEdited",
      value: function onSubmitEdited(id, dataKey, key, val, data) {
        this.data[dataKey][key] = val;

        this.$li[id][key].data("val", val);

        if (key === "date") {
          this.$lis[id].toggleClass("future", val.isAfter(today)).data("date", data.val);
        }

        this.costTotal = parseInt(data.total, 10);

        this.$total.html(formatCurrency(this.costTotal));

        this.hookCalculate();

        this.updatePieChart();
      }
    }, {
      key: "onSubmitError",
      value: function onSubmitError() {
        console.warn("Error updating value! (Server error)");
      }
    }, {
      key: "onSubmitRequestComplete",
      value: function onSubmitRequestComplete(dataKey, key, callback) {
        editing.deactivate(this.data[dataKey][key]);

        if (key === "date") {
          this.sortByDate();
        }

        if (typeof callback === "function") {
          callback();
        }
      }
    }, {
      key: "sortByDate",
      value: function sortByDate() {
        this.$lbody.children("li:not(.li-add)").sort(function (a, b) {
          var dateA = $(a).data("date");
          var dateB = $(b).data("date");

          if (dateA.isEqual(dateB)) {
            return $(a).data("id") < $(b).data("id") ? 1 : -1;
          }

          return dateA.isAfter(dateB) ? -1 : 1;
        }).appendTo(this.$lbody);

        this.calculateDaily();
      }
    }, {
      key: "listEditCallback",
      value: function listEditCallback(j) {
        var _this20 = this;

        return function (callback) {
          _this20.triggerListEdit(_this20.col[j], _this20.dataType[j], callback);
        };
      }
    }, {
      key: "increaseLimit",
      value: function increaseLimit() {
        if (this.loading || this.offset < 0) {
          return;
        }

        this.offset++;

        this.loadData(null, false, true);
      }
    }, {
      key: "calculateDaily",
      value: function calculateDaily() {
        var _this21 = this;

        if (!this.dailyColumn) {
          return;
        }

        var tally = 0;

        this.$lbody.children("li:not(.li-add)").each(function (i, li) {
          var id = $(li).data("id");

          tally += _this21.$li[id].cost.data("val");

          var dateA = $(li).data("date");
          var dateB = $(li).next().data("date");

          var lastInDate = !(dateB && dateA.isEqual(dateB));

          _this21.$li[id].daily.html(lastInDate ? formatCurrency(tally) : "");

          if (lastInDate) {
            tally = 0;
          }
        });
      }
    }, {
      key: "updatePieChart",
      value: function updatePieChart() {
        if (!this.drawPie) {
          return;
        }

        api.request("pie/" + this.page, "GET", null, user.apiKey, this.onPieUpdated.bind(this), null, null);
      }
    }, {
      key: "onPieUpdated",
      value: function onPieUpdated(res) {
        var loadedBefore = true;

        if (!this.pie) {
          loadedBefore = false;

          this.pie = [];
        }

        var item = void 0;

        if (loadedBefore) {
          var i = 0;
          var _iteratorNormalCompletion11 = true;
          var _didIteratorError11 = false;
          var _iteratorError11 = undefined;

          try {
            for (var _iterator11 = res.data[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              item = _step11.value;

              this.pie[i].data = item.data;
              this.pie[i].total = item.total;
              this.pie[i].title = item.title;

              ++i;
            }
          } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion11 && _iterator11.return) {
                _iterator11.return();
              }
            } finally {
              if (_didIteratorError11) {
                throw _iteratorError11;
              }
            }
          }
        } else {
          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = res.data[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              item = _step12.value;

              this.createPieChart(item);
            }
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12.return) {
                _iterator12.return();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }
        }

        this.updatePieChartGraph();
      }
    }, {
      key: "createPieChart",
      value: function createPieChart(data) {
        this.pie.push(new PieGraph({
          width: this.pieWidth,
          height: this.pieHeight,
          $cont: this.$graphs,
          page: this.page,
          title: data.title,
          index: this.pie.length,
          data: data,
          stretchFactor: this.stretchFactor,
          pieTolerance: this.pieTolerance,
          pieLabelLength: this.pieLabelLength
        }));
      }
    }, {
      key: "updatePieChartGraph",
      value: function updatePieChartGraph() {
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = this.pie[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var pie = _step13.value;

            pie.draw();
          }
        } catch (err) {
          _didIteratorError13 = true;
          _iteratorError13 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion13 && _iterator13.return) {
              _iterator13.return();
            }
          } finally {
            if (_didIteratorError13) {
              throw _iteratorError13;
            }
          }
        }
      }
    }, {
      key: "handleScroll",
      value: function handleScroll() {
        var scrollTop = $(document.body).scrollTop();

        var windowHeight = $(window).height();

        var offsetTop = this.$lbody.offset().top;

        var listHeight = this.$lbody.height();

        var scrolledToBottom = scrollTop + windowHeight - offsetTop >= listHeight - 100;

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

    }, {
      key: "triggerListEdit",
      value: function triggerListEdit(column, type, callback) {
        var dataKey = editing.$td.parent().data("dataKey");

        var status = afterEditValidateCompare(editing.$input.val(), this.data[dataKey][column], type);

        if (!status) {
          // invalid data input
          console.warn("invalid data input");

          editing.cancel();
        } else {
          if (status.changed) {
            var id = editing.$td.parent().data("id");

            this.submitEdit(id, column, status.val, callback);

            return;
          }

          editing.deactivate(status.val);
        }

        if (typeof callback === "function") {
          callback();
        }
      }
    }]);

    return PageList;
  }(Page);

  var PageFunds = function (_PageList) {
    _inherits(PageFunds, _PageList);

    function PageFunds(options) {
      _classCallCheck(this, PageFunds);

      return _possibleConstructorReturn(this, (PageFunds.__proto__ || Object.getPrototypeOf(PageFunds)).call(this, options));
    }

    _createClass(PageFunds, [{
      key: "calculateGain",
      value: function calculateGain(unitsTxt, priceVal, cost) {
        var units = parseFloat(unitsTxt, 10);
        var price = parseFloat(priceVal, 10);

        var pct = 0;
        var gainAbs = 0;

        var value = cost;

        if (!isNaN(units) && !isNaN(price) && cost > 0) {
          value = units * price;

          // percentage value
          pct = 100 * (value - cost) / cost;

          // absolute value
          gainAbs = value - cost;
        }

        var txt = "<span class=\"value\">" + formatCurrency(value, false, false, true) + "</span>" + "<span class=\"abs\">(" + formatCurrency(gainAbs, false, false, true) + ")</span>" + "<span class=\"pct\">(" + pct.toFixed(1) + "%)</span>";

        return { pct: pct, txt: txt };
      }
    }, {
      key: "addGainText",
      value: function addGainText(gain, $span) {
        return $span.toggleClass("profit", gain.pct > 0).toggleClass("loss", gain.pct < 0).toggleClass("high", Math.abs(gain.pct) > 5).html(gain.txt);
      }
    }, {
      key: "hookCalculate",
      value: function hookCalculate() {
        var _this23 = this;

        _get(PageFunds.prototype.__proto__ || Object.getPrototypeOf(PageFunds.prototype), "hookCalculate", this).call(this);

        this.$lbody.children("li:not(.li-add)").each(function (i, li) {
          var id = $(li).data("id");

          var units = _this23.$li[id].units.data("val");
          var price = _this23.$li[id].units.data("price");

          var $span = _this23.addGainText(_this23.calculateGain(units, price, _this23.data[i].cost), _this23.$li[id].gain.children(".text"));

          _this23.$li[id].gain.children(".text").replaceWith($span);
        });
      }
    }, {
      key: "hookCustomColumns",
      value: function hookCustomColumns(newItem, newData) {
        var id = newItem.id;

        var units = newData.u;
        var price = newData.P;

        this.$li[id].units.data("price", price);

        var $gainSpan = this.addGainText(this.calculateGain(units, price, newData.c), $("<span></span>").addClass("text"));

        // add a "gain/loss" column
        this.$li[id].gain = $("<span></span>").addClass("gain").append($gainSpan);

        this.$lis[id].append(this.$li[id].gain);

        return newItem;
      }
    }, {
      key: "render",
      value: function render() {
        _get(PageFunds.prototype.__proto__ || Object.getPrototypeOf(PageFunds.prototype), "render", this).call(this);

        // build stock rendering thingy
        this.buildStockViewer();
      }
    }, {
      key: "buildStockViewer",
      value: function buildStockViewer() {
        this.stocksRefreshInterval = 30000;
        this.hlTime = 30000;

        this.stocksListLoading = false;

        this.stockPricesLoading = false;

        this.stocks = {};

        this.$stocksListOuter = $("<div></div>").addClass("stocks-list");

        this.$stocksList = $("<ul></ul>").addClass("stocks-list-ul");

        this.$stocksListOuter.append(this.$stocksList);

        this.$graphs.append(this.$stocksListOuter);

        this.loadStocksList();
      }
    }, {
      key: "hookSwitchToCallback",
      value: function hookSwitchToCallback(pageExists) {
        _get(PageFunds.prototype.__proto__ || Object.getPrototypeOf(PageFunds.prototype), "hookSwitchToCallback", this).call(this);

        if (pageExists) {
          this.loadStocksList();
        }
      }
    }, {
      key: "loadStocksList",
      value: function loadStocksList() {
        var _this24 = this;

        if (this.stocksListLoading) {
          return;
        }
        this.stocksListLoading = true;

        api.request("data/stocks", "GET", null, user.apiKey, function (res) {
          return _this24.onStocksListLoaded(res);
        }, function () {
          return _this24.onStocksListError();
        }, function () {
          return _this24.onStocksListRequestComplete();
        });
      }
    }, {
      key: "onStocksListLoaded",
      value: function onStocksListLoaded(res) {
        this.stockWeight = res.data.stocks;

        var total = res.data.total;

        this.stocks = {};

        for (var symbol in res.data.stocks) {
          this.stocks[symbol] = {
            name: res.data.stocks[symbol].n,
            weight: res.data.stocks[symbol].w / total,
            price: 0,
            change: 0,
            changeText: "",
            $elem: null,
            active: false
          };
        }

        this.loadStockPrices();
      }
    }, {
      key: "onStocksListError",
      value: function onStocksListError() {
        console.warn("Error loading stocks list!");
      }
    }, {
      key: "onStocksListRequestComplete",
      value: function onStocksListRequestComplete() {
        this.stocksListLoading = false;
      }
    }, {
      key: "loadStockPrices",
      value: function loadStockPrices() {
        var _this25 = this;

        if (this.stockPricesLoading || pageActive !== "funds") {
          return;
        }

        this.stockPricesLoading = true;

        finance.get(this.stocks, function (res) {
          return _this25.onStockPricesLoaded(res);
        }, function () {
          return _this25.onStockPricesFail();
        }, function () {
          return _this25.onStockPricesRequestComplete();
        });
      }
    }, {
      key: "onStockPricesLoaded",
      value: function onStockPricesLoaded(res) {
        var _this26 = this;

        var badStocks = 0;

        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = res[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var stock = _step14.value;

            var symbol = stock.e + ":" + stock.t;

            if (!this.stocks[symbol]) {
              badStocks++;
            } else {
              var price = parseFloat(stock.l_fix, 10);

              // change as a percentage
              var change = parseFloat(stock.c_fix, 10) / price * 100;

              var hl = false;

              if (this.stocks[symbol].price !== price) {
                hl = this.stocks[symbol].price > price ? "hl-down" : "hl-up";
              }

              this.stocks[symbol].hl = hl;

              this.stocks[symbol].price = price;

              this.stocks[symbol].change = change;

              this.stocks[symbol].changeText = (change >= 0 ? "+" : "") + change.toFixed(2);
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
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

        this.stocksLoadingTimer = window.setTimeout(function () {
          _this26.loadStockPrices();
        }, this.stocksRefreshInterval);
      }
    }, {
      key: "updateStockList",
      value: function updateStockList() {
        var _this27 = this;

        var _loop = function _loop(symbol) {
          var stock = _this27.stocks[symbol];

          if (stock.$elem) {
            // update the item
            stock.$price.text(stock.price.toFixed(2));

            stock.$change.text(stock.changeText);

            if (stock.hl) {
              stock.$priceOuter.addClass(stock.hl);
              stock.hl = false;

              window.setTimeout(function () {
                stock.$priceOuter.removeClass("hl-up").removeClass("hl-down");
              }, _this27.hlTime);
            }
          } else {
            // add the item
            stock.$elem = $("<li></li>").addClass("stock-list-item");

            stock.$label = $("<span></span>").addClass("label").text(symbol);

            stock.$elem.attr("title", stock.name);

            stock.$priceOuter = $("<span></span>").addClass("price");

            stock.$price = $("<span></span>").text(stock.price.toFixed(2));

            stock.$change = $("<span></span>").addClass("change").text(stock.changeText);

            stock.$priceOuter.append(stock.$price);
            stock.$priceOuter.append(stock.$change);

            stock.$elem.append(stock.$label);
            stock.$elem.append(stock.$priceOuter);

            _this27.$stocksList.append(stock.$elem);
          }

          stock.$elem.toggleClass("up", stock.change > 0);
          stock.$elem.toggleClass("down", stock.change < 0);
        };

        for (var symbol in this.stocks) {
          _loop(symbol);
        }
      }
    }, {
      key: "onStockPricesFail",
      value: function onStockPricesFail() {
        console.warn("Error loading stock prices!");
      }
    }, {
      key: "onStockPricesRequestComplete",
      value: function onStockPricesRequestComplete() {
        this.stockPricesLoading = false;
      }
    }]);

    return PageFunds;
  }(PageList);

  var PageOverview = function (_Page2) {
    _inherits(PageOverview, _Page2);

    function PageOverview() {
      _classCallCheck(this, PageOverview);

      var _this28 = _possibleConstructorReturn(this, (PageOverview.__proto__ || Object.getPrototypeOf(PageOverview)).call(this, { page: "overview" }));

      _this28.categories = ["funds", "bills", "food", "general", "holiday", "social", "in", "out", "net", "predicted", "balance"];

      _this28.colors = categoryColors;
      return _this28;
    }

    _createClass(PageOverview, [{
      key: "hookDataLoadedBeforeRender",
      value: function hookDataLoadedBeforeRender(callback, res) {
        this.data = res.data;

        this.getYearMonths();
      }
    }, {
      key: "hookSwitchToAfterLoad",
      value: function hookSwitchToAfterLoad() {
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
    }, {
      key: "render",
      value: function render() {
        var _this29 = this;

        this.$tbl = $("<table></table>").addClass("table-insert").addClass("table-overview");

        this.$thead = $("<thead></thead>");

        this.$thr = $("<tr></tr>").append("<th>Month</th>");

        this.categories.forEach(function (category, key) {
          return _this29.addCategory(key, category);
        });

        this.$thead.append(this.$thr);
        this.$tbl.append(this.$thead);

        this.$tbody = $("<tbody></tbody>");

        this.$td = [];
        this.$tr = [];

        this.yearMonths.forEach(function (yearMonth, key) {
          return _this29.addTableRow(key, yearMonth);
        });

        this.$tbl.append(this.$tbody);

        this.$page.append(this.$tbl);

        // draw graphs
        this.addGraphs();
      }
    }, {
      key: "getYearMonths",
      value: function getYearMonths() {
        this.yearMonths = [];

        var y = this.data.startYearMonth[0];
        var m = this.data.startYearMonth[1];

        while (y < this.data.endYearMonth[0] || y === this.data.endYearMonth[0] && m <= this.data.endYearMonth[1]) {
          this.yearMonths.push([y, m]);

          if (++m > 12) {
            m = 1;
            y++;
          }
        }
      }
    }, {
      key: "calculateScores",
      value: function calculateScores() {
        var _this30 = this;

        this.scores = {};

        var _loop2 = function _loop2(category) {
          var costs = _this30.data.cost[category];

          var max = Math.max.apply(null, costs);
          var min = Math.min.apply(null, costs);

          var pve = [];
          var nve = [];

          for (var i = 0; i < costs.length; i++) {
            if (costs[i] >= 0) {
              pve.push(costs[i]);
            } else {
              nve.push(costs[i]);
            }
          }

          var median1 = median(pve);
          var median2 = median(nve);

          var thisScores = costs.map(function (thisCost) {
            var medianV = median1;
            var cost = thisCost;
            var M = max;

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

          _this30.scores[category] = thisScores;
        };

        for (var category in this.data.cost) {
          _loop2(category);
        }
      }
    }, {
      key: "calculateFutures",
      value: function calculateFutures() {
        // calculate futures (from past averages)
        var average = {};

        var futureCategories = ["food", "general", "holiday", "social"];

        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = futureCategories[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var category = _step15.value;

            average[category] = arrayAverage(this.data.cost[category], this.data.futureMonths);

            var spliceArgs = [this.data.cost[category].length - this.data.futureMonths, this.data.futureMonths];

            for (var i = 0; i < this.data.futureMonths; i++) {
              spliceArgs.push(average[category]);
            }

            Array.prototype.splice.apply(this.data.cost[category], spliceArgs);
          }
        } catch (err) {
          _didIteratorError15 = true;
          _iteratorError15 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion15 && _iterator15.return) {
              _iterator15.return();
            }
          } finally {
            if (_didIteratorError15) {
              throw _iteratorError15;
            }
          }
        }
      }
    }, {
      key: "calculateColumns",
      value: function calculateColumns() {
        var _this31 = this;

        // calculate total spend (including bills) for each month
        this.data.cost.out = this.yearMonths.map(function (yearMonth, key) {
          return _this31.data.cost.bills[key] + _this31.data.cost.food[key] + _this31.data.cost.general[key] + _this31.data.cost.holiday[key] + _this31.data.cost.social[key];
        });

        // calculate net change in balance for each month
        this.data.cost.net = this.data.cost.out.map(function (item, key) {
          return _this31.data.cost.in[key] - item;
        });

        // calculate the predicted balance for each month
        this.data.cost.predicted = [];

        var lastValue = 0;

        this.data.cost.predicted = this.data.cost.out.map(function (item, key) {
          var value = _this31.data.cost.net[key];

          if (key > 0) {
            var lastBalance = _this31.data.cost.balance[key - 1];

            if (lastBalance > 0) {
              value += lastBalance;
              _this31.data.cost.predicted[key] += lastBalance;
            } else {
              value += lastValue;
            }
          }

          lastValue = value;

          return value;
        });
      }
    }, {
      key: "afterBalanceEdit",
      value: function afterBalanceEdit(callback) {
        var _this32 = this;

        var val = validateCurrencyInput(editing.$input.val());

        if (val === null) {
          return;
        }

        var $tr = editing.$td.parent();

        var yearMonth = $tr.data("yearMonth");
        var key = $tr.index();

        if (val !== this.data.cost.balance[key]) {
          api.request("update/overview", "POST", {
            year: yearMonth[0],
            month: yearMonth[1],
            balance: val
          }, user.apiKey, function () {
            return _this32.onBalanceEdited(key, val);
          }, function () {
            return _this32.onBalanceEditError();
          }, function () {
            return _this32.onBalanceEditRequestComplete(key, callback);
          });
        } else {
          editing.deactivate(val);

          if (typeof callback === "function") {
            callback();
          }
        }
      }
    }, {
      key: "onBalanceEdited",
      value: function onBalanceEdited(key, val) {
        this.data.cost.balance[key] = val;

        this.update();
      }
    }, {
      key: "onBalanceEditError",
      value: function onBalanceEditError() {
        console.warn("Error updating value! (Server error)");
      }
    }, {
      key: "onBalanceEditRequestComplete",
      value: function onBalanceEditRequestComplete(key, callback) {
        editing.deactivate(this.data.cost.balance[key]);

        if (typeof callback === "function") {
          callback();
        }
      }
    }, {
      key: "addCategory",
      value: function addCategory(key, category) {
        this.$thr.append($("<th></th>").text(category));
      }
    }, {
      key: "addTableCell",
      value: function addTableCell(key, cKey, category) {
        var _this33 = this;

        this.$td[key][category] = $("<td></td>").addClass("cost").data("val", 0).append($("<span></span>").addClass("text"));

        if (category === "balance") {
          this.$td[key][category].editable(function (callback) {
            return _this33.afterBalanceEdit(callback);
          }, "cost");
        }

        this.$tr[key].append(this.$td[key][category]);
      }
    }, {
      key: "addTableRow",
      value: function addTableRow(key, yearMonth) {
        var _this34 = this;

        this.$tr[key] = $("<tr></tr>").toggleClass("past", yearMonth[0] === this.data.currentYear && yearMonth[1] < this.data.currentMonth || yearMonth[0] < this.data.currentYear).toggleClass("active", yearMonth[0] === this.data.currentYear && yearMonth[1] === this.data.currentMonth).toggleClass("future", yearMonth[0] === this.data.currentYear && yearMonth[1] > this.data.currentMonth || yearMonth[0] > this.data.currentYear).append($("<td></td>").addClass("month").text(months[yearMonth[1] - 1] + "-" + yearMonth[0].toString().substring(2))).data("yearMonth", yearMonth);

        this.$td[key] = {};

        this.categories.forEach(function (category, cKey) {
          return _this34.addTableCell(key, cKey, category);
        });

        this.$tbody.append(this.$tr[key]);
      }
    }, {
      key: "addGraphs",
      value: function addGraphs() {
        this.graphBalance = new GraphBalance({
          width: 500,
          height: 300,
          $cont: this.$page,
          title: "balance",
          dataPast: [],
          dataFuture: [],
          startYear: this.data.startYearMonth[0],
          startMonth: this.data.startYearMonth[1],
          currentYear: this.data.currentYear,
          currentMonth: this.data.currentMonth,
          yearMonths: this.yearMonths,
          pad: [64, 0, 24, 0],
          range: [0, this.yearMonths.length - 1, 0, 0]
        });

        this.graphSpend = new GraphSpend({
          width: 500,
          height: 300,
          $cont: this.$page,
          title: "spend",
          data: this.data.cost,
          pad: [64, 0, 24, 0],
          range: [0, this.yearMonths.length - 1, 0, 0],
          yearMonths: this.yearMonths
        });
      }
    }, {
      key: "updateCategories",
      value: function updateCategories(key, cKey, category) {
        this.$td[key][category].data("val", this.data.cost[category][key]).css("background-color", getColorFromScore(this.colors[category], this.scores[category][key], this.data.cost[category][key] < 0)).children(".text").html(formatCurrency(this.data.cost[category][key]));
      }
    }, {
      key: "updateYearMonths",
      value: function updateYearMonths(key) {
        var _this35 = this;

        this.categories.forEach(function (category, cKey) {
          _this35.updateCategories(key, cKey, category);
        });
      }
    }, {
      key: "updateGraphs",
      value: function updateGraphs() {
        this.graphBalance.update(this.data.cost.balance, this.data.cost.predicted);
        this.graphSpend.update(this.data.cost);
      }
    }, {
      key: "update",
      value: function update(data) {
        var _this36 = this;

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
        this.yearMonths.forEach(function (yearMonth, key) {
          return _this36.updateYearMonths(key);
        });

        // update the graphs
        this.updateGraphs();
      }
    }, {
      key: "processCategory",
      value: function processCategory(category) {
        if (pages[category]) {
          var doneRows = [];

          for (var i = 0; i < pages[category].data.length; i++) {
            var year = pages[category].data[i].date.year;
            var month = pages[category].data[i].date.month;

            var row = getYearMonthRow(this.data.startYearMonth[0], this.data.startYearMonth[1], year, month);

            var doneRow = doneRows.indexOf(row) > -1;

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
    }]);

    return PageOverview;
  }(Page);

  var pageDef = {
    in: {
      page: "in",
      col: ["date", "item", "cost"],
      colShort: ["d", "i", "c"],
      dataType: ["date", "text", "cost"],
      addDefaultVal: {
        date: today.format(),
        item: "",
        cost: "0.00"
      },
      daily: false,
      drawPie: true,
      pieWidth: 800
    },
    bills: {
      page: "bills",
      col: ["date", "item", "cost"],
      colShort: ["d", "i", "c"],
      limit: true,
      dataType: ["date", "text", "cost"],
      addDefaultVal: {
        date: today.format(),
        item: "",
        cost: "0.00"
      },
      daily: false
    },
    food: {
      page: "food",
      col: ["date", "item", "category", "cost", "shop"],
      colShort: ["d", "i", "k", "c", "s"],
      dataType: ["date", "text", "text", "cost", "text"],
      limit: true,
      addDefaultVal: {
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
      page: "general",
      col: ["date", "item", "category", "cost", "shop"],
      colShort: ["d", "i", "k", "c", "s"],
      dataType: ["date", "text", "text", "cost", "text"],
      limit: true,
      addDefaultVal: {
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
      page: "social",
      col: ["date", "item", "society", "cost", "shop"],
      colShort: ["d", "i", "y", "c", "s"],
      dataType: ["date", "text", "text", "cost", "text"],
      addDefaultVal: {
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
      page: "holiday",
      col: ["date", "item", "holiday", "cost", "shop"],
      colShort: ["d", "i", "h", "c", "s"],
      dataType: ["date", "text", "text", "cost", "text"],
      addDefaultVal: {
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

  var pageDefFunds = {
    page: "funds",
    col: ["date", "item", "units", "cost", "price"],
    colShort: ["d", "i", "u", "c", "P"],
    colEdit: [0, 1, 2, 3],
    dataType: ["date", "text", "text", "cost"],
    addDefaultVal: {
      date: today.format(),
      item: "",
      units: "0.00",
      cost: "0.00"
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

    var pageExists = true;

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
    } else {
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
    if (!$btn || (typeof $btn === "undefined" ? "undefined" : _typeof($btn)) !== "object") {
      $btn = $(this);

      event = "mousedown";
    }

    $btn.on(event, selectPage.bind(null, $btn.attr("id").substring(9), $btn, callback));
  }

  function tableNavigate(wasEditing, evt, x, y, dx, dy, maxX, maxY) {
    if (evt.key === "Tab") {
      if (evt.shiftKey) {
        if (wasEditing) {
          if (x > 0) {
            dx = -1;
            dy = 0;
          } else if (y > 0) {
            dx = maxX;
            dy = -1;
          }
        } else {
          return false;
          // x = maxX;
          // y = maxY;
        }
      } else if (wasEditing) {
        if (x < maxX) {
          dx = 1;
          dy = 0;
        } else if (y < maxY) {
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
    } else {
      var $span = pages[pageActive].$lbody.children(":eq(" + (y + 1).toString() + ")").children(".editable:eq(" + x.toString() + ")");

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

      var val = parseInt(evt.key, 10);

      if (isNaN(val)) {
        return;
      }

      val = Math.min(9, Math.max(0, val));

      user.loginPin += Math.pow(10, 3 - user.inputActive) * val;

      user.$input.slice(user.inputActive, user.inputActive + 1).addClass("done").removeClass("active");

      if (user.inputActive < 3) {
        user.inputActive++;

        user.$input.slice(user.inputActive, user.inputActive + 1).addClass("active");
      } else {
        user.login();
      }
    } else if (evt.key === "Enter") {
      if (editing.finish()) {
        evt.preventDefault();
      }
    } else if (evt.key === "Escape") {
      if (editing.cancel()) {
        evt.preventDefault();
      }
    } else if (pageActive && (evt.ctrlKey && (evt.key === "ArrowLeft" || evt.key === "ArrowRight") || evt.key === "ArrowUp" || evt.key === "ArrowDown" || !editingAdd && evt.key === "Tab")) {
      (function () {
        var page0 = pageActive === "overview";

        var x = 0;
        var y = 0;

        var dx = evt.key === "ArrowLeft" ? -1 : evt.key === "ArrowRight" ? 1 : 0;
        var dy = evt.key === "ArrowUp" ? -1 : evt.key === "ArrowDown" ? 1 : 0;

        var maxX = void 0;
        var maxY = void 0;

        if (page0) {
          maxX = 0;
          maxY = pages.overview.data.cost.balance.length - 1;
        } else {
          maxX = pages[pageActive].numEditCols() - 1;
          maxY = pages[pageActive].data.length - 1;
        }

        if (editing.active) {
          if (page0) {
            y = Math.min(maxY, Math.max(0, editing.$td.parent().index() + dy));
          } else {
            x = Math.min(maxX, Math.max(0, editing.$td.index() + dx));

            y = Math.min(maxY, Math.max(0, editing.$td.parent().index() - 1 + dy));
          }

          editing.finish(function () {
            return tableNavigate(true, evt, x, y, dx, dy, maxX, maxY);
          });
        } else {
          tableNavigate(false, evt, x, y, dx, dy, maxX, maxY);
        }

        evt.preventDefault();
      })();
    }
  }

  /**
   * main window mouseup handler
   * @returns {void} void
   */
  function mouseUpHandler() {
    editing.finish();
  }

  $.fn.editable = function editable(editHook, type) {
    this.editable = new EditItem($("<input type=text />").hide().addClass("editable-input").addClass("editable-" + type), $(this), editHook, type);
  };

  $(document).ready(function () {
    $(window).on("mouseup", mouseUpHandler).on("keydown", keyDownHandler);

    // handle user login
    user.init($("#login-form").children(".input-pin"), $("#login-form"));

    $(".nav-link").each(navHandler);

    $("#nav-link-logout").on("mousedown", function () {
      return user.logout();
    });

    currentPage = Cookies.get("currentPage");

    if (!currentPage) {
      currentPage = "overview";
    }
  });
})(jQuery);

