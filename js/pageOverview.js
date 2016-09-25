function PageOverview() {
  this.data = null;

  this.$page = $('#page-overview');

  this.categories = [
    'funds',
    'bills',
    'food', 'general', 'holiday', 'social',
    'in', 'out', 'net',
    'predicted', 'balance'
  ];

  this.colors = categoryColors;
}
PageOverview.prototype.loadData = function(callback) {
  if (this.loading) {
    return;
  }

  if (this.data) {
    callback();
  }
  else {
    this.loading = true;

    $.ajax({
      url: 'backend.php',
      data: {
        t: 'data_overview'
      },
      context: this,
      dataType: 'json',
      success: function(data) {
        this.data = data;

        this.getYearMonths();

        this.$page.removeClass('page-loading');

        this.render();

        callback();
      },
      complete: function() {
        this.loading = false;
      }
    });
  }
}
PageOverview.prototype.switchTo = function() {
  this.loadData(function() {
    // update data from other pages (which might have changed)
    this.processCategory('funds');
    this.processCategory('in');
    this.processCategory('food');
    this.processCategory('general');
    this.processCategory('holiday');
    this.processCategory('social');
    this.processCategory('bills');

    this.update();
  }.bind(this));
}
PageOverview.prototype.render = function() {
  this.$tbl = $('<table></table>')
    .addClass('table-insert')
    .addClass('table-overview');

  this.$thead = $('<thead></thead>');

  this.$thr = $('<tr></tr>').append('<th>Month</th>');

  $.each(this.categories, this.addCategory.bind(this));

  this.$thead.append(this.$thr);
  this.$tbl.append(this.$thead);

  this.$tbody = $('<tbody></tbody>');

  this.$td = [];
  this.$tr = [];

  $.each(this.yearMonths, this.addTableRow.bind(this));

  this.$tbl.append(this.$tbody);

  this.$page.append(this.$tbl);

  // draw graphs
  this.addGraphs();
}
PageOverview.prototype.getYearMonths = function() {
  this.yearMonths = [];

  var y = this.data.startYearMonth[0],
      m = this.data.startYearMonth[1];

  while (y < this.data.endYearMonth[0] || (
    y === this.data.endYearMonth[0] && m <= this.data.endYearMonth[1]
  )) {
    this.yearMonths.push([y, m]);

    m++;

    if (m > 12) {
      m = 1;
      y++;
    }
  }
}
PageOverview.prototype.calculateScores = function() {
  this.scores = {};

  $.each(this.data.cost, function(category, costs) {
    var max = Math.max.apply(null, costs),
        min = Math.min.apply(null, costs),
        range = max - min;

    var pve = [];
    var nve = [];

    for (var i = 0; i < costs.length; i++) {
      if (costs[i] >= 0) {
        pve.push(costs[i]);
      }
      else {
        nve.push(costs[i]);
      }
    }

    var median1 = median(pve);
    var median2 = median(nve);

    var thisScores = $.map(costs, function(thisCost, key) {
      var median = median1, cost = thisCost, M = max;

      if (thisCost < 0) {
        median = -1 * median2;
        cost *= -1;
        M = -1 * min;
      }

      if (cost > median) {
        return .5 * (1 + (cost - median) / (M - median));
      }
      else {
        return .5 * cost / median;
      }
    });

    this.scores[category] = thisScores;
  }.bind(this));
}
PageOverview.prototype.calculateFutures = function() {
  // calculate futures (from past averages)
  var average = {};

  var futureCategories = ['food', 'general', 'holiday', 'social'];

  $.each(futureCategories, function(key, category) {
    average[category] = arrayAverage(this.data.cost[category], this.data.futureMonths);

    var spliceArgs = [
      this.data.cost[category].length - this.data.futureMonths,
      this.data.futureMonths
    ];

    for (var i = 0; i < this.data.futureMonths; i++) {
      spliceArgs.push(average[category]);
    }

    Array.prototype.splice.apply(this.data.cost[category], spliceArgs);
  }.bind(this));
}
PageOverview.prototype.calculateColumns = function() {
  // calculate total spend (including bills) for each month
  this.data.cost.out = $.map(this.yearMonths, function(yearMonth, key) {
    return  this.data.cost.bills[key]   +
            this.data.cost.food[key]    +
            this.data.cost.general[key] +
            this.data.cost.holiday[key] +
            this.data.cost.social[key]
    ;
  }.bind(this));

  // calculate net change in balance for each month
  this.data.cost.net = $.map(this.data.cost.out, function(item, key) {
    return this.data.cost.in[key] - item;
  }.bind(this));

  // calculate the predicted balance for each month
  this.data.cost.predicted = [];

  var lastValue = 0;

  this.data.cost.predicted = $.map(this.data.cost.out, function(item, key) {
    var value = this.data.cost.net[key];

    if (key > 0) {
      var lastBalance = this.data.cost.balance[key - 1];

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
  }.bind(this));
}
PageOverview.prototype.afterBalanceEdit = function(callback) {
  var val = validateCurrencyInput(editing.$input.val());

  if (val == null) {
    return;
  }

  var $tr = editing.$td.parent();

  var yearMonth = $tr.data('yearMonth');
  var key = $tr.index();

  if (val != this.data.cost.balance[key]) {
    $.ajax({
      url: 'backend.php?t=update_balance',
      type: 'post',
      data: {
        year:   yearMonth[0],
        month:  yearMonth[1],
        value:  val
      },
      context: this,
      success: function() {
        this.data.cost.balance[key] = val;

        this.update();
      },
      error: function() {
        console.warn('Error updating value! (Server error)');
      },
      complete: function() {
        editableHide(this.data.cost.balance[key]);

        editing = null;

        if (typeof callback == 'function') {
          callback();
        }
      }
    });
  }
  else {
    editableHide(val);
    editing = null;

    if (typeof callback == 'function') {
      callback();
    }
  }
};
PageOverview.prototype.addCategory = function(key, category) {
  this.$thr.append($('<th></th>').text(category));
}
PageOverview.prototype.addTableCell = function(key, cKey, category) {
  this.$td[key][category] = $('<td></td>')
  .addClass('cost')
  .data('val', 0)
  .append($('<span></span>').addClass('text'));

  if (category === 'balance') {
    this.$td[key][category].editable(this.afterBalanceEdit.bind(this), 'cost');
  }

  this.$tr[key].append(this.$td[key][category]);
}
PageOverview.prototype.addTableRow = function(key, yearMonth) {
  this.$tr[key] = $('<tr></tr>').toggleClass(
    'active', yearMonth[0] === this.data.currentYear &&
      yearMonth[1] === this.data.currentMonth
  ).toggleClass(
    'future', (yearMonth[0] === this.data.currentYear &&
      yearMonth[1] > this.data.currentMonth) || yearMonth[0] > this.data.currentYear
  ).append($('<td></td>')
    .addClass('month')
    .text(months[yearMonth[1] - 1] + '-' + yearMonth[0].toString().substring(2))
  ).data('yearMonth', yearMonth);

  this.$td[key] = {};

  $.each(this.categories, this.addTableCell.bind(this, key));

  this.$tbody.append(this.$tr[key]);
}
PageOverview.prototype.addGraphs = function() {
  this.graphBalance = { width: 640, height: 300 };
  this.graphSpend   = { width: 640, height: 350 };

  this.graphBalance.$cont   = $('<div></div>')
  .addClass('graph-container')
  .attr('id', 'graph-balance');

  this.graphSpend.$cont   = $('<div></div>')
  .addClass('graph-container')
  .attr('id', 'graph-spend');

  this.graphBalance.$canvas = $('<canvas></canvas>').attr({
    width: this.graphBalance.width,
    height: this.graphBalance.height
  });

  this.graphSpend.$canvas = $('<canvas></canvas>').attr({
    width: this.graphSpend.width,
    height: this.graphSpend.height
  });

  this.graphBalance.$cont.append(this.graphBalance.$canvas);
  this.graphSpend.$cont.append(this.graphSpend.$canvas);

  this.graphBalance.ctx = this.graphBalance.$canvas[0].getContext('2d');
  this.graphSpend.ctx   = this.graphSpend.$canvas[0].getContext('2d');

  this.$page.append(this.graphBalance.$cont);
  this.$page.append(this.graphSpend.$cont);
}
PageOverview.prototype.updateCategories = function(key, cKey, category) {
  this.$td[key][category]
  .data('val', this.data.cost[category][key])
  .css('background-color', getColorFromScore(
    this.colors[category],
    this.scores[category][key],
    this.data.cost[category][key] < 0)
  ).children('.text').html(formatCurrency(this.data.cost[category][key]));
}
PageOverview.prototype.updateYearMonths = function(key, yearMonth) {
  $.each(this.categories, this.updateCategories.bind(this, key));
};
PageOverview.prototype.updateGraphs = function() {
  this.updateGraphBalance();
  this.updateGraphSpend();
}
PageOverview.prototype.updateGraphBalance = function() {
  var ctx = this.graphBalance.ctx;

  ctx.clearRect(0, 0, this.graphBalance.width, this.graphBalance.height);

  var width = this.graphBalance.width;
  var height = this.graphBalance.height;

  var padX = 0;
  var padY = 10;

  var dataPast    = $.map(this.data.cost.balance, hundredth);
  var dataFuture  = $.map(this.data.cost.predicted, hundredth);

  var numTicksX = this.yearMonths.length - 1;

  var maxY = Math.ceil(Math.max(
    Math.max.apply(null, dataPast),
    Math.max.apply(null, dataFuture)
  ));

  // calculate tick range
  var tickSize = getTickSize(0, maxY, 5);

  // find which key to transition from existing to future data
  var futureKey = 12 * (this.data.currentYear - this.data.startYearMonth[0])
    + this.data.currentMonth - this.data.startYearMonth[1] + 1;

  // draw axes
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;

  ctx.font = '12px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#333';
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';

  for (var i = 3; i < numTicksX - 1; i += 4) {
    var tickName = months[this.yearMonths[i][1] - 1] + '-'
      + (this.yearMonths[i][0] % 100).toString();

    var tickPos = Math.round(width * i / numTicksX) + .5;

    ctx.fillText(tickName, tickPos + 2, height);

    ctx.beginPath();
    ctx.moveTo(tickPos, 0);
    ctx.lineTo(tickPos, height - 18);
    ctx.stroke();
  }

  var ticksY = [];

  for (var i = 1; i < 4; i++) {
    var tickPos = Math.round(
      padY + (height - 2*padY) * (1 - (i * tickSize) / maxY)
    ) + .5;

    ticksY.push(tickPos);

    ctx.beginPath();
    ctx.moveTo(0, tickPos);
    ctx.lineTo(width, tickPos);
    ctx.stroke();
  }

  // plot past data
  var p = $.map(dataPast, function(item, key) {
    return key < futureKey ? item : dataFuture[key];
  });

  drawCubicLine(ctx, width, height-2*padY, padY, maxY, p, ['#039', 'red'], futureKey - 2);

  // draw Y axis
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  $.each(ticksY, function(i, tickPos) {
    var tickName = '£' + numberFormat(tickSize * (i+1));

    ctx.fillText(tickName, 0, tickPos);
  });

  // add title and key
  ctx.font = '16px bold Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillText('Balance', 15, 10);

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#039';
  ctx.moveTo(0, 40);
  ctx.lineTo(24, 40);
  ctx.stroke();
  ctx.closePath();

  ctx.font = '11px Arial, Helvetica, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#333';
  ctx.fillText('Actual', 28, 40);

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.moveTo(80, 40);
  ctx.lineTo(104, 40);
  ctx.stroke();
  ctx.closePath();

  ctx.fillText('Predicted', 108, 40);

}
PageOverview.prototype.updateGraphSpend = function() {
  var ctx = this.graphSpend.ctx;
  var width = this.graphSpend.width;
  var height = this.graphSpend.height;

  var categories = ['bills', 'food', 'general', 'holiday', 'social'];

  var sum = [];

  var value;

  var data = $.map(categories, function(category) {
    return [$.map(this.data.cost[category], function(item, key) {
      if (!sum[key]) {
        sum[key] = 0;
      }

      value = item > 0 ? hundredth(item) : 0;

      sum[key] += value;

      return sum[key];
    })];
  }.bind(this)).reverse();

  var chartCategories = categories.concat().reverse();

  var maxY = Math.max.apply(null, data[0]);
  var minY = 0;

  // calculate tick range
  var tickSize = getTickSize(minY, maxY, 5);

  ctx.clearRect(0, 0, width, height);

  var numTicksX = this.yearMonths.length - 1;

  var px = function(x) {
    return width * x / numTicksX;
  }

  var py = function(y) {
    return (height - 48) - (y - minY) / (maxY - minY) * (height - 112);
  }

  // draw X axis ticks
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;

  var ticksY = [];
  for (var i = 3, j = 0; i < numTicksX - 1; i += 2, j++) {
    var tickPos = Math.floor(px(i)) + .5;

    ticksY.push([i, tickPos]);

    ctx.beginPath();
    ctx.moveTo(tickPos, 56);
    ctx.lineTo(tickPos, height - 16 * (1 + (j % 2)));
    ctx.stroke();
  }

  // draw Y axis ticks
  ctx.strokeStyle = '#333';

  var ticksX = [];
  for (var i = 0; i < 3; i++) {
    var tickPos = Math.ceil(py(tickSize * i)) + .5;

    ticksX.push(tickPos);

    ctx.beginPath();
    ctx.moveTo(0, tickPos);
    ctx.lineTo(width, tickPos);
    ctx.stroke();
  }

  // plot data
  $.each(data, function(key, line) {
    drawCubicLine1(
      ctx,
      width, 0,
      height - 112, -64,
      minY, maxY,
      line, rgba(this.colors[chartCategories[key]], .75)
    );
  }.bind(this));

  ctx.font = '12px Arial, Helvetica, sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000';

  $.each(ticksX, function(i, tickPos) {
    if (i > 0) {
      ctx.strokeStyle = '#999';

      var tickName = '£' + numberFormat(tickSize * i);

      ctx.fillText(tickName, 0, tickPos);
    }
  });

  // draw month ticks
  ctx.fillStyle = '#333';
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';

  $.each(ticksY, function(j, tick) {
    var tickName = months[this.yearMonths[tick[0]][1] - 1] + '-'
      + (this.yearMonths[tick[0]][0] % 100).toString();

    ctx.fillText(tickName, tick[1], height - 16 * (j % 2));
  }.bind(this));

  // add title and key
  ctx.font = '16px bold Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillText('Spending', 15, 10);

  ctx.textBaseline = 'middle';
  ctx.font = '13px Arial, Helvetica, sans-serif';

  var fontColor = '#333';

  ctx.fillStyle = rgb(this.colors.bills);
  ctx.fillRect(5, 34, 12, 12);
  ctx.fillStyle = fontColor;
  ctx.fillText('Bills', 20, 40);

  ctx.fillStyle = rgb(this.colors.food);
  ctx.fillRect(57, 34, 12, 12);
  ctx.fillStyle = fontColor;
  ctx.fillText('Food', 72, 40);

  ctx.fillStyle = rgb(this.colors.general);
  ctx.fillRect(115, 34, 12, 12);
  ctx.fillStyle = fontColor;
  ctx.fillText('General', 130, 40);

  ctx.fillStyle = rgb(this.colors.holiday);
  ctx.fillRect(185, 34, 12, 12);
  ctx.fillStyle = fontColor;
  ctx.fillText('Holiday', 200, 40);

  ctx.fillStyle = rgb(this.colors.social);
  ctx.fillRect(250, 34, 12, 12);
  ctx.fillStyle = fontColor;
  ctx.fillText('Social', 265, 40);
}

PageOverview.prototype.update = function(data) {
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
  $.each(this.yearMonths, this.updateYearMonths.bind(this));

  // update the graphs
  this.updateGraphs();
}
PageOverview.prototype.processCategory = function(category) {
  if (pages[category]) {
    var k = this.data.cost[category].length;

    var doneRows = [];

    for (var i = 0; i < pages[category].data.length; i++) {
      var year  = pages[category].data[i].date[0],
          month = pages[category].data[i].date[1];

      var row = getYearMonthRow(
        this.data.startYearMonth[0], this.data.startYearMonth[1],
        year, month
      );

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

