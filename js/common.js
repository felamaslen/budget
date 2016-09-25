var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var categoryColors = {
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

var todayDate = new Date();
var today = [
  todayDate.getFullYear(),
  todayDate.getMonth() + 1,
  todayDate.getDate()
];

function validateDateInput(val) {
  var isDate = val.match(/^[0-3]?[0-9]\/[0-1]?[0-9](\/[0-9]{2}([0-9]{2})?)?$/);

  if (!isDate) {
    alert('\'' + val + '\' isn\'t a date');

    return null;
  }

  var year, month, date;

  var split = val.split('/');

  if (split.length < 3) {
    year = today[0];
  }
  else {
    year = parseInt(split[2]);

    if (year < 100) {
      year += 2000;
    }
  }

  month = parseInt(split[1]);

  date = parseInt(split[0]);

  return [year, month, date];
}
function validateCurrencyInput(val) {
  var floatVal = parseFloat(val);

  if (isNaN(floatVal) || val.match(/[A-Za-z]/)) {
    alert('\'' + val.toString() + '\' isn\'t a number');

    return null;
  }

  return Math.round(floatVal * 100);
}
function validateInput(val, type) {
  switch (type) {
  case 'date':
    return validateDateInput(val);
  case 'cost':
    return validateCurrencyInput(val);
  default:
    return val;
  }
}

function median(array) {
  var sorted = array.concat().sort();

  var numKeys = sorted.length;

  if (numKeys & 1) {
    // odd
    return sorted[Math.floor(numKeys/2)];
  }
  else {
    // even
    return .5 * (
      sorted[numKeys/2-1] + sorted[numKeys/2]
    );
  }
}
function arrayAverage(array, offset) {
  return array.slice(0, -1 * offset).reduce(function(red, item) {
    return red + item;
  }) / (array.length - offset);
}
function hundredth(item) {
  return item / 100;
}
function leadingZeroes(n, base) {
  if (!base) base = 10;

  return (n < base ? '0' : '') + n.toString(base);
}

function emptyValue() {
  return '';
}
function numberFormat(number) {
  // adds commas to a long number
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function formatCurrency(number, raw) {
  return (number < 0 ? '&minus;' : '') + (raw ? '£' : '&pound;')
    + numberFormat((Math.abs(number) / 100).toFixed(2));
}
function formatDate(date) {
  return leadingZeroes(date[2]) + '/' + leadingZeroes(date[1]) + '/' + date[0];
}
function formatData(val, type, raw) {
  switch (type) {
  case 'date':
    return formatDate(val);
  case 'cost':
    return formatCurrency(val, raw);
  default:
    return val;
  }
}

function dateIsAfter(date1, date2) {
  // returns true if date1 is after date2
  return  date1[0] > date2[0] ||
          (date1[0] === date2[0] && (
            date1[1] > date2[1] || (date1[1] === date2[1] && date1[2] > date2[2])
          ));
}
function dateIsEqual(date1, date2) {
  return  date1[0] === date2[0] &&
          date1[1] === date2[1] &&
          date1[2] === date2[2];
}
function getYearMonthRow(startYear, startMonth, year, month) {
  return (year - startYear) * 12 + (month - startMonth);
}

var editing = null;
var editingAdd = false;

function editingAddFocus() {
  editingAdd = true;
}
function editingAddBlur() {
  editingAdd = false;
}

function editingMouseUp(evt) {
  editing.lock = false;
  evt.stopPropagation();
}
function editingMouseDown(evt) {
  editing.lock = true;
  evt.stopPropagation();
}

function finishEditing(callback) {
  if (editing && editing.doneHook) {
    if (editing.lock) {
      editing.lock = false;

      return false;
    }
    else {
      editing.doneHook(callback);

      return true;
    }
  }

  return false;
}
function editableClick(evt) {
  if (editing && !finishEditing()) {
    return;
  }

  editing = this.editable;

  var val = $(this).data('val');

  if (editing.type == 'date') {
    val = formatDate(val);
  }
  else if (editing.type == 'cost') {
    val = (val / 100).toFixed(2);
  }

  this.editable.$input.val(val).show()

  this.editable.$input.focus();

  $(this).addClass('editing');
};
function editableHide(val) {
  if (editing.type == 'cost') {
    val = formatCurrency(val);
  }
  else if (editing.type == 'date') {
    val = formatDate(val);
  }

  editing.$input.hide();
  editing.$td.removeClass('editing').children('.text').html(val);
}

var pages = {};
var pageActive = null;
var navActive = null;

function selectPage(id, button, callback) {
  if (button.is('.active')) {
    return;
  }

  if (typeof pages[id] === 'undefined') {
    switch (id) {
      case 'overview':
        pages.overview = new PageOverview();
        break;
      case 'funds':
        pages.funds = new PageFunds();
        break;
      case 'in':
        pages.in = new PageIn();
        break;
      case 'bills':
        pages.bills = new PageBills();
        break;
      case 'food':
        pages.food = new PageFood();
        break;
      case 'general':
        pages.general = new PageGeneral();
        break;
      case 'holiday':
        pages.holiday= new PageHoliday();
        break;
      case 'social':
        pages.social = new PageSocial();
        break;
    }
  }

  Cookies.set('currentPage', id, { expires: 7 });

  pages[id].switchTo();

  if (navActive) {
    navActive.removeClass('active');
  }
  else {
    $('#bg').fadeOut();
  }

  if (pageActive) {
    $('#page-' + pageActive).hide();
  }

  button.addClass('active');
  navActive = button;
  pageActive = id;

  $('#page-' + id).show();

  if (typeof callback == 'function') {
    callback();
  }
}
function navHandler($btn, event, callback) {
  if (!$btn || typeof $btn != 'object') {
    $btn = $(this);

    event = 'mousedown';
  }

  $btn.on(event, selectPage.bind(
    null, $btn.attr('id').substring(9), $btn, callback
  ));
};

var mobileNavShown = false;

var popupFormVisible = false;

function toggleMobileNav(showNav, override) {
  if (!override && popupFormVisible) {
    return;
  }

  if (showNav == null) {
    showNav = !navShown;
  }

  $('#nav-outer').toggleClass('active', showNav);

  navShown = showNav;
}

function navHandlerMobile() {
  navHandler($(this), 'click', toggleMobileNav.bind(null, false));
}

function rgb(color) {
  return '#' + $.map(color, function(item) {
    return leadingZeroes(item, 16);
  }).join('');
}
function rgba(color, alpha) {
  return 'rgba(' + color.join(',') + ',' + alpha + ')';
}
function getColorFromScore(color, score, negative) {
  if (!color) {
    console.warn('No colour given to getColor!');
    color = [36, 191, 55];
  }

  if (color.length === 2) {
    color = color[negative ? 1 : 0];
  }
  else if (negative) {
    score = 0;
  }

  return rgb($.map(color, function(value) {
    return Math.round(255 - (255 - value) * score);
  }));
}

function drawCubicLine1(ctx, width, offsetX, height, offsetY, minY, maxY, p, color) {
  var numData = p.length - 1;

  var px = function(x) {
    return offsetX + width * x / numData;
  }

  var py = function(y) {
    return height - offsetY - (y - minY) / (maxY - minY) * height;
  }

  var xp = function(pix) {
    return (pix - offsetX) * numData / width;
  }

  var yp = function(pix) {
    return height - offsetY - pix * (maxY - minY) / height + minY;
  }

  var fi = function(x, i) {
    return  2*(p[0+i]-p[1+i])*Math.pow(x-i,3) +
            3*(p[1+i]-p[0+i])*Math.pow(x-i,2) +
            p[0+i]
    ;
  }

  ctx.beginPath();
  ctx.fillStyle = color;

  ctx.moveTo(px(0), py(0));
  ctx.lineTo(px(0), py(p[0]));

  for (var i = 0; i < p.length - 1; i++) {
    for (var pix = px(i)+1; pix < px(i+1); pix++) {
      var x = xp(pix);

      ctx.lineTo(pix, py(fi(x, i)));
    }
  }

  ctx.lineTo(px(numData), py(0));
  ctx.lineTo(px(0), py(0));

  ctx.fill();
  ctx.closePath();
}
function drawCubicLine(ctx, width, height, padY, maxY, p, colors, transitionPos) {
  if (typeof colors == 'string') {
    colors = [colors];
  }

  var numData = p.length - 1;

  var px = function(x) {
    return width * x / numData;
  }

  var py = function(y) {
    return padY + (1 - y / maxY) * height;
  }

  var xp = function(pix) {
    return numData * pix / width;
  }

  var yp = function(pix) {
    return (1 - ((pix - padY) / height)) * maxY;
  }

  var m = $.map(p, function(P, i) {
    return i > 0 && i < p.length - 1
    ? .5 * (p[i+1] - p[i-1])
    : (i ? P - p[i-1] : p[i+1] - P);
  });

  var f0 = function(x) {
    return  (m[1] - m[0]) * Math.pow(x, 3) +
            (m[0] - m[1]) * Math.pow(x, 2) +
            m[0] * x +
            p[0]
    ;
  };

  var fi = function(x, i) {
    return  (m[2+i] + m[1+i] - 2*(p[2+i] - p[1+i])) * Math.pow(x-1-i, 3) +
            (-1*m[2+i] - 2*m[1+i] + 3*(p[2+i] - p[1+i])) * Math.pow(x-1-i, 2) +
            m[1+i] * (x-1-i) +
            p[1+i]
    ;
  }

  ctx.beginPath();
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2;

  ctx.moveTo(px(0), py(f0(0)));

  var x;

  for (var pix = Math.round(px(0)) + 1; pix < px(1); pix++) {
    x = xp(pix);

    ctx.lineTo(pix, py(f0(x)));
  }

  $.each(p.slice(0, -2), function(i, P) {
    if (i === transitionPos) {
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.strokeStyle = colors[1];

      ctx.moveTo(px(i+1)-1, py(fi(xp(px(i+1)-1), i-1)));
    }

    for (var pix = px(i+1); pix < px(i+2); pix++) {
      x = xp(pix);

      ctx.lineTo(pix, py(fi(x, i)));
    }
  });

  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = '#000';

  /*
  var c;
  $.each(p, function(i, P) {
    c = [px(i), py(P)];

    ctx.beginPath();
    ctx.moveTo(c[0], c[1]);
    ctx.arc(c[0], c[1], 3, 0, Math.PI * 2);
    ctx.fill();
  });
  */
}

function pointFromCircle(centreX, centreY, radius, angle) {
  return [
    centreX + radius * Math.cos(angle),
    centreY + radius * Math.sin(angle)
  ];
}

function getTickSize(min, max, numTicks) {
  var minimum = (max - min) / numTicks;

  var magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.log(10)));

  var res = minimum / magnitude;

  var tick;

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

function afterEditValidateCompare(val, compare, type) {
  val = validateInput(val, type);

  if (val == null) {
    return null;
  }

  var changed = false;

  switch (type) {
  case 'date':
    changed = !dateIsEqual(val, compare);
    break;
  case 'cost':
  case 'text':
  default:
    changed = val != compare;
  };

  return { val: val, changed: changed };
}

function afterEditPopup() {
  // this function gets bound to the PopupForm object
  if (editing) {
    return;
  }

  editing = true;

  // validate inputs
  var postData = {};
  var badInput = false;

  $.each(this.fields, function(fieldIndex, field) {
    var thisVal = validateInput(
      this.$input[fieldIndex].val(),
      field.type
    );

    if (thisVal == null) {
      alert('Must enter valid values!');
      badInput = true;
      return;
    }

    postData[field.name] = thisVal;
  }.bind(this));

  postData = $.extend(this.postData, postData);

  $.ajax({
    url:  'backend.php?t=update' + this.editSuffix + '&table=' + this.table,
    type: 'post',
    context: this,
    data: postData,
    dataType: 'json',
    success: function(response) {
      this.actionUpdate(postData, this.data, response);
    },
    error: function() {
      console.warn('Error updating/inserting row! (Server error)');
    },
    complete: function() {
      this.close();

      editing = false;
    }
  });
}

function afterEdit(column, type, callback) {
  var dataKey = editing.$td.parent().data('dataKey');

  var status = afterEditValidateCompare(
    editing.$input.val(), this.data[dataKey][column], type
  );

  if (!status) {
    return;
  }

  var id = editing.$td.parent().data('id');

  if (status.changed) {
    this.submitEdit(id, column, status.val, callback);
  }
  else {
    editableHide(status.val);
    editing = null;

    if (typeof callback == 'function') {
      callback();
    }
  }
}
