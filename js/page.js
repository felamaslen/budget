/**
 * Page: an object for each page of data (except the overview page)
 */
function Page(options) {
  this.page           = options.page; // e.g. in, food, general etc.
  this.col            = options.col;  // list of columns
  this.colShort       = options.colShort;
  this.dataType       = options.dataType;
  this.addDefaultVal  = options.addDefaultVal;
  this.dailyColumn    = options.daily;

  this.drawPie        = options.drawPie;
  this.stretchFactor  = options.pieStretch || 1.5;
  this.pieWidth       = options.pieWidth || 640;
  this.pieHeight      = options.pieHeight || 320;

  this.limit = options.limit;
  this.offset = 0;

  this.loading = false;

  this.$page = $('#page-' + this.page);

  this.data = [];

  this.costTotal = 0;
  //this.dailyAverage = 0;  // TODO
  //this.weeklyAverage = 0; // TODO

  this.loadData(true);

  this.updatePieChart();
}
Page.prototype.loadData = function(render) {
  if (this.loading) {
    return;
  }
  this.loading = true;

  $.ajax({
    url: 'backend.php',
    data: {
      t: 'data',
      table: this.page,
      offset: this.offset
    },
    context: this,
    dataType: 'json',
    success: function(data) {
      this.$page.removeClass('page-loading');

      if (render) {
        this.render();
      }

      this.costTotal = data.total;

      this.update(data.data);
      //this.sortByDate();

      if (!data.older) {
        this.offset = -1;
      }
    },
    complete: function() {
      this.loading = false;
    }
  });
}
Page.prototype.switchTo = function() {
  // update data from other pages (which might have changed)
}
Page.prototype.render = function() {
  this.$cont = $('<div></div>')
  .addClass('list-insert')
  .addClass('list-' + this.page)
  .addClass('list');

  this.$total = $('<span></span>');

  this.$lhead = $('<div></div>').addClass('list-head');

  for (var i = 0; i < this.col.length; i++) {
    this.$lhead.append($('<span></span>').addClass(this.col[i]).text(this.col[i]));
  }

  if (this.dailyColumn) {
    this.$lhead.append(
      $('<span></span>').addClass('daily').text('Daily Tally')
    );
  }

  this.$lhead.append(
    $('<span></span>').text('Total: ')
  ).append(this.$total);

  this.$cont.append(this.$lhead);

  this.$lbody = $('<ul></ul>').addClass('list-ul');

  this.$liAdd = $('<li></li>').addClass('li-add');

  this.$li = {};
  this.$lis = {};

  this.$addInput = {};
  this.$addInputCont = {};

  for (var i = 0; i < this.col.length; i++) {
    this.$addInput[this.col[i]] = $('<input></input>')
      .addClass('editable-input')
      .addClass('editable-' + this.col[i])
      .val(this.addDefaultVal[this.col[i]])
    ;

    this.$addInput[this.col[i]]
    .on('focus', editingAddFocus)
    .on('blur', editingAddBlur);

    this.$addInputCont[this.col[i]] = $('<span></span>')
      .addClass(this.col[i])
      .append(this.$addInput[this.col[i]])
    ;

    this.$liAdd.append(this.$addInputCont[this.col[i]]);
  }

  this.$addButton = $('<button></button>')
  .text('Add')
  .on('click', this.addNew.bind(this))
  ;

  this.$addButtonCont = $('<span></span>')
  .append(this.$addButton);

  this.$liAdd.append(this.$addButtonCont);

  this.$lbody.append(this.$liAdd);

  this.$cont.append(this.$lbody);

  if (this.limit) {
    this.$lbody[0].addEventListener(
      'mousewheel',
      this.handleScroll.bind(this),
      { passive: true }
    );

    this.$lbody[0].addEventListener(
      'scroll',
      this.handleScroll.bind(this)
    );
  }

  this.$page.append(this.$cont);
}
Page.prototype.addNew = function() {
  var data = {};

  for (var i = 0; i < this.col.length; i++) {
    var val = validateInput(this.$addInput[this.col[i]].val(), this.col[i]);

    if (val == null) {
      alert('Must enter valid data');

      return;
    }

    data[this.col[i]] = val;
  }

  this.$addButton.attr('disabled', true);

  editing = true;

  $.ajax({
    url: 'backend.php?t=update&table=' + this.page,
    type: 'post',
    dataType: 'json',
    context: this,
    data: data,
    success: function(response) {
      var newItem = { I: response.id };

      for (var i = 0; i < this.col.length; i++) {
        this.$addInput[this.col[i]].val(
          this.addDefaultVal[this.col[i]]
        );

        newItem[this.colShort[i]] = data[this.col[i]];
      }

      var newData = [newItem];

      this.costTotal = parseInt(response.total);

      this.update(newData);
      this.sortByDate();

      this.$addInput.date.val('').focus();

      this.updatePieChart();
    },
    error: function() {
      console.warn('Error inserting row! (Server error)');
    },
    complete: function() {
      editing = null;
      this.$addButton.attr('disabled', false);
    }
  });
}
Page.prototype.submitEdit = function(id, key, val, callback) {
  var postData = { id: id };

  postData[key] = val;

  var dataKey = editing.$td.parent().data('dataKey');

  $.ajax({
    url: 'backend.php?t=update&table=' + this.page,
    type: 'post',
    dataType: 'json',
    data: postData,
    context: this,
    success: function(data) {
      this.data[dataKey][key] = val;

      this.$li[id][key].data('val', val);

      if (key == 'date') {
        this.$lis[id]
          .toggleClass('future', dateIsAfter(postData.date, today))
          .data('date', postData.date);
      }

      this.costTotal = parseInt(data.total);

      this.$total.html(formatCurrency(this.costTotal));

      if (this.dailyColumn) {
        this.calculateDaily();
      }

      this.updatePieChart();
    },
    error: function() {
      console.warn('Error updating value! (Server error)');
    },
    complete: function() {
      editableHide(this.data[dataKey][key]);
      editing = null;

      if (key == 'date') {
        this.sortByDate();
      }

      if (typeof callback == 'function') {
        callback();
      }
    }
  });
}
Page.prototype.sortByDate = function() {
  this.$lbody.children('li:not(.li-add)').sort(function(a, b) {
    var dateA = $(a).data('date');
    var dateB = $(b).data('date');

    if (dateIsEqual(dateA, dateB)) {
      return $(a).data('id') < $(b).data('id') ? 1 : -1;
    }
    else {
      return dateIsAfter(dateA, dateB) ? -1 : 1;
    }
  }).appendTo(this.$lbody);

  this.calculateDaily()
}
Page.prototype.addNewRows = function(newData) {
  for (var i = 0; i < newData.length; i++) {
    var id = newData[i].I;

    var newItem = { id: id };

    this.$lis[id] = $('<li></li>');

    this.$li[id] = {};

    for (var j = 0; j < this.col.length; j++) {
      newItem[this.col[j]] = newData[i][this.colShort[j]];

      this.$li[id][this.col[j]] = $('<span></span>').addClass(this.col[j]).append(
        $('<span></span>').addClass('text').html(formatData(
          newData[i][this.colShort[j]], this.dataType[j]
        ))
      ).data('val', newData[i][this.colShort[j]]);

      this.$li[id][this.col[j]].editable(afterEdit.bind(
        this, this.col[j], this.dataType[j]
      ), this.dataType[j]);

      this.$lis[id].append(this.$li[id][this.col[j]]);
    }

    if (dateIsAfter(newItem.date, today)) {
      this.$lis[id].addClass('future');
    }

    this.data.push(newItem);

    if (this.dailyColumn) {
      this.$li[id].daily = $('<span></span>').addClass('daily');
      this.$lis[id].append(this.$li[id].daily);
    }

    this.$lis[id]
    .data('id', id)
    .data('date', newItem.date)
    .data('dataKey', this.data.length - 1);

    this.$lbody.append(this.$lis[id]);
  }

  this.$total.html(formatCurrency(this.costTotal));

  // TODO: average cost
}
Page.prototype.increaseLimit = function() {
  if (this.loading || this.offset < 0) {
    return;
  }

  this.offset++;

  this.loadData(false);
}
Page.prototype.calculateDaily = function() {
  if (!this.dailyColumn) {
    return;
  }

  var tally = 0;

  var $li = this.$li;

  this.$lbody.children('li:not(.li-add)').each(function() {
    var id = $(this).data('id');

    tally += $li[id].cost.data('val');

    var dateA = $(this).data('date'),
        dateB = $(this).next().data('date');

    var lastInDate = !(dateB && dateIsEqual(dateA, dateB));

    $li[id].daily.html(lastInDate ? formatCurrency(tally) : '');

    if (lastInDate) {
      tally = 0;
    }
  });
}
Page.prototype.update = function(newData) {
  this.addNewRows(newData);

  if (this.dailyColumn) {
    this.calculateDaily();
  }
}
Page.prototype.updatePieChart = function() {
  if (!this.drawPie) {
    return;
  }

  var loadedBefore = true;

  if (!this.pie) {
    loadedBefore = false;

    this.pie = [];
  }

  $.ajax({
    url: 'backend.php?&t=pie&table=' + this.page,
    dataType: 'json',
    context: this,
    success: function(data) {
      $.each(data, function(i, thisData) {
        if (!loadedBefore) {
          this.createPieChart(thisData);
        }
        else {
          this.pie[i].data = thisData;
        }
      }.bind(this));

      this.updatePieChartGraph();
    }
  });
}
Page.prototype.createPieChart = function(data) {
  var pie = {
    $cont: $('<div></div>')
    .addClass('graph-container')
    .addClass('graph-container-pie')
    .addClass('graph-container-pie-' + this.pie.length.toString())
    .attr('id', 'graph-pie-' + data.title.toLowerCase() + '-' + this.page),

    width: this.pieWidth,
    height: this.pieHeight
  };

  pie.$canvas = $('<canvas></canvas>').attr({
    width: pie.width,
    height: pie.height
  });

  pie.ctx = pie.$canvas[0].getContext('2d');

  pie.data = data;

  pie.colors = {};
  pie.labelKey = 0;

  this.pie.push(pie);

  pie.$cont.append(pie.$canvas);

  this.$page.append(pie.$cont[0]);
}
Page.prototype.updatePieChartGraph = function() {
  $.each(this.pie, function(i, pie) {
    pie.ctx.clearRect(0, 0, pie.width, pie.height);

    this.drawPieChartGraph(i, pie);
  }.bind(this));
}
Page.prototype.drawPieChartGraph = function(key, pie) {
  var colors = [
    '#4d4d4d',
    '#5da5da',
    '#faa43a',
    '#60bd68',
    '#f17cb0',
    '#b2912f',
    '#b276b2',
    '#decf3f',
    '#f15854',
    '#6f0aa9'
  ];

  // associate each label with a colour
  $.each(pie.data.data, function(key, item) {
    var label = item[0];

    if (!pie.colors[label]) {
      pie.colors[label] = colors[pie.labelKey % colors.length];

      pie.labelKey++;
    }
  });

  var ctx = pie.ctx;

  ctx.strokeStyle = '#000';
  ctx.font = '12px Arial, Helvetica, sans-serif';

  var smallLabelOffset = 20;

  var stretchPoint = function(x) {
    return pie.width/2 + (x - pie.width/2) * this.stretchFactor;
  }.bind(this);

  var stretch = function() {
    ctx.save();
    ctx.translate(pie.width * 0.5 * (1 - this.stretchFactor), 0);
    ctx.scale(this.stretchFactor, 1);
  }.bind(this);

  var lastLabelAngle = 0;

  var centreX = 9 * pie.width / 17;
  var centreY = 5 * pie.height / 8;

  var radius = Math.min(pie.width, pie.height) / 4.5;

  var angle = -0.1 - Math.PI / 2;

  $.each(pie.data.data, function(i, p) {
    var thisAngle = 2 * Math.PI * p[1] / pie.data.total;

    var thisColor = pie.colors[p[0]];

    stretch();
    ctx.beginPath();
    ctx.moveTo(centreX, centreY);
    ctx.arc(centreX, centreY, radius, angle, angle + thisAngle, false);
    ctx.restore();

    ctx.fillStyle = thisColor;
    ctx.fill();
    ctx.stroke();

    // draw label
    var midAngle = (angle + 0.5 * thisAngle + 2 * Math.PI) % (2 * Math.PI);

    if (!lastLabelAngle || (midAngle - lastLabelAngle + 2*Math.PI) % (2*Math.PI) > pieTolerance) {
      lastLabelAngle = midAngle;

      var quadrant = Math.floor((midAngle + Math.PI / 2) / (Math.PI / 2)) % 4;

      var labelRadiusScale = 1.3;

      var R = 1.5;

      var x = (midAngle - Math.PI) / (Math.PI/2);

      if ((midAngle + Math.PI/2) % (2*Math.PI) > 3*Math.PI/2) {
        labelRadiusScale += R * (1 + Math.sin(Math.PI/2 * (x - 1)));
      }

      var labelRadius = radius * labelRadiusScale;

      var labelBegin = pointFromCircle(centreX, centreY, radius * 0.8, midAngle);
      var labelEnd = pointFromCircle(centreX, centreY, labelRadius, midAngle);

      stretch();
      ctx.beginPath();
      ctx.moveTo(labelBegin[0], labelBegin[1]);

      var textAnchor = pointFromCircle(centreX, centreY, labelRadius + 1, midAngle);

      textAnchor[1] = Math.floor(textAnchor[1]) + .5;

      var baseline = quadrant === 1 && midAngle > 0.2 ? 'top' : 'middle';
      var align = quadrant < 2 ? 'left' : 'right';

      if (quadrant === 3) {
        ctx.lineTo(textAnchor[0], textAnchor[1]);

        textAnchor[0] -= smallLabelOffset;

        ctx.lineTo(textAnchor[0] + 3, textAnchor[1]);

        smallLabelOffset += 1;
      }
      else {
        ctx.lineTo(labelEnd[0], labelEnd[1]);
      }
      ctx.restore();

      ctx.stroke();
      ctx.closePath();

      var labelText = p[1];

      var label = p[0] + ' (' + formatData(labelText, pie.data.type, true) + ')';

      ctx.fillStyle = '#000';
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.fillText(label, stretchPoint(textAnchor[0]), textAnchor[1]);
    }

    angle += thisAngle;
  }.bind(this));

  ctx.fillStyle = '#000';
  ctx.font = '18px bold Arial, Helvetica, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  ctx.fillText(pie.data.title, pie.width - 10, 10);
}
Page.prototype.handleScroll = function() {
  var scrollTop = this.$lbody.scrollTop();

  var scrollHeight = this.$lbody[0].scrollHeight;

  var windowHeight = $(window).height();

  var offsetTop = this.$lbody.offset().top;

  var scrolledToBottom = scrollHeight < (windowHeight - offsetTop) ||
    scrollTop + windowHeight >= scrollHeight + offsetTop - 100;

  if (scrolledToBottom) {
    this.increaseLimit();
  }
}

function PageFunds() {
  return new Page({
    page:         'funds',
    col:            ['date', 'item', 'cost'],
    colShort:       ['d', 'i', 'c', 'v'],
    dataType:       ['date', 'text', 'cost', 'cost'],
    addDefaultVal:  {
      date:     formatDate(today),
      item:     '',
      invested: '0.00'
    },
    daily: false,
    drawPie: true,
    pieStretch: 1.2,
    pieWidth: 800
  });
}
function PageIn() {
  return new Page({
    page:           'in',
    col:            ['date', 'item', 'cost'],
    colShort:       ['d', 'i', 'c'],
    dataType:       ['date', 'text', 'cost'],
    addDefaultVal:  {
      date: formatDate(today),
      item: '',
      cost: '0.00'
    },
    daily: false,
    drawPie: true
  });
}
function PageBills() {
  return new Page({
    page:           'bills',
    col:            ['date', 'item', 'cost'],
    colShort:       ['d', 'i', 'c'],
    limit:          true,
    dataType:       ['date', 'text', 'cost'],
    addDefaultVal:  {
      date: formatDate(today),
      item: '',
      cost: '0.00'
    },
    daily: false
  });
}
function PageFood() {
  return new Page({
    page:           'food',
    col:            ['date', 'item', 'category', 'cost', 'shop'],
    colShort:       ['d', 'i', 'k', 'c', 's'],
    dataType:       ['date', 'text', 'text', 'cost', 'text'],
    limit:          true,
    addDefaultVal:  {
      date: formatDate(today),
      item: '',
      category: '',
      cost: '0.00',
      shop: ''
    },
    daily: true,
    drawPie: true
  });
}
function PageGeneral() {
  return new Page({
    page:           'general',
    col:            ['date', 'item', 'category', 'cost', 'shop'],
    colShort:       ['d', 'i', 'k', 'c', 's'],
    dataType:       ['date', 'text', 'text', 'cost', 'text'],
    limit:          true,
    addDefaultVal:  {
      date: formatDate(today),
      item: '',
      category: '',
      cost: '0.00',
      shop: ''
    },
    daily: true,
    drawPie: true
  });
}
function PageSocial() {
  return new Page({
    page:           'social',
    col:            ['date', 'item', 'society', 'cost', 'shop'],
    colShort:       ['d', 'i', 'y', 'c', 's'],
    dataType:       ['date', 'text', 'text', 'cost', 'text'],
    addDefaultVal:  {
      date: formatDate(today),
      item: '',
      society: '',
      cost: '0.00',
      shop: ''
    },
    daily: false,
    drawPie: true
  });
}
function PageHoliday() {
  return new Page({
    page:           'holiday',
    col:            ['date', 'item', 'holiday', 'cost', 'shop'],
    colShort:       ['d', 'i', 'h', 'c', 's'],
    dataType:       ['date', 'text', 'text', 'cost', 'text'],
    addDefaultVal:  {
      date: formatDate(today),
      item: '',
      holiday: '',
      cost: '0.00',
      shop: ''
    },
    daily: false,
    drawPie: true
  });
}


