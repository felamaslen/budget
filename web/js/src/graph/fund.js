/**
 * Fund graphs
 */

import $ from "../../lib/jquery.min";

import {
  COLOR_DARK, COLOR_LIGHT_GREY, COLOR_PROFIT, COLOR_LOSS,
  COLOR_GRAPH_FUND_LINE, COLOR_GRAPH_TITLE, COLOR_KEY,
  GRAPH_FUND_ITEM_LINE_WIDTH, GRAPH_FUND_ITEM_TENSION,
  GRAPH_FUND_HISTORY_TENSION, GRAPH_FUND_HISTORY_POINT_RADIUS,
  GRAPH_FUND_HISTORY_NUM_TICKS, GRAPH_FUND_HISTORY_LINE_WIDTH,
  GRAPH_FUND_HISTORY_WIDTH_NARROW, GRAPH_FUND_HISTORY_WIDTH,
  GRAPH_FUND_HISTORY_MOVING_AVG,
  FONT_AXIS_LABEL
} from "const";

import { getMovingAverage, arraySum } from "misc/misc";
import { formatAge, formatCurrency } from "misc/format";
import MediaQueryHandler from "misc/media_query";
import { todayDate, timeSeriesTicks } from "misc/date";

import { getTickSize, LineGraph } from "graph/graph";

const windowSize = new MediaQueryHandler();

export class GraphFundItem extends LineGraph {
  constructor(options, api) {
    const minX = Math.min.apply(null, options.data.map(item => item[0]));
    const maxX = Math.max.apply(null, options.data.map(item => item[0]));

    const minY = Math.min.apply(null, options.data.map(item => item[1]));
    const maxY = Math.max.apply(null, options.data.map(item => item[1]));

    options.range = [minX, maxX, minY, maxY];

    super(options, api);

    this.dataMinY = minY;
    this.dataMaxY = maxY;

    this.lineWidth = GRAPH_FUND_ITEM_LINE_WIDTH;
    this.tension = GRAPH_FUND_ITEM_TENSION;

    this.data = options.data;

    this.genColors();

    this.defaultWidth = this.width;
    this.defaultHeight = this.height;

    this.popout = false;
    this.$canvas.on("click", () => this.togglePopout());
  }
  genColors() {
    const colors = [];
    const transition = [];
    const levels = [
      [0, COLOR_LOSS],
      [Infinity, COLOR_PROFIT]
    ];

    if (this.data.length > 1) {
      let level = levels.findIndex(item => this.data[1][1] < item[0]);
      if (level > -1) {
        colors.push(levels[level][1]);
      }

      this.data.slice(2).forEach((point, key) => {
        const thisLevel = levels.findIndex(item => point[1] < item[0]);

        if (thisLevel !== level) {
          level = thisLevel;
          colors.push(levels[level][1]);
          transition.push(key);
        }
      });

      this.colors = colors;
      this.transition = transition;
    }
    else {
      this.colors = [COLOR_DARK];
    }
  }
  togglePopout() {
    // make the graph larger
    this.popout = !this.popout;

    this.$canvas.toggleClass("popout", this.popout);

    this.width = this.popout ? this.$canvas.width() : this.defaultWidth;
    this.height = this.popout ? this.$canvas.height() : this.defaultHeight;

    this.$canvas[0].width = this.width;
    this.$canvas[0].height = this.height;

    const minY = this.popout ? Math.floor(this.dataMinY) : this.dataMinY;
    const maxY = this.popout ? Math.ceil(this.dataMaxY) : this.dataMaxY;

    this.setRange([this.minX, this.maxX, minY, maxY]);

    this.draw();
  }

  draw() {
    if (!this.supported) {
      return;
    }

    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // draw axes
    this.ctx.lineWidth = 1;

    if (this.popout) {
      this.ctx.fillStyle = COLOR_DARK;
      this.ctx.textBaseline = "middle";
      this.ctx.textAlign = "left";
      this.ctx.font = FONT_AXIS_LABEL;

      const range = this.maxY - this.minY;
      const inc = this.popout
        ? Math.round(
          Math.max(20, this.height / range) / this.height * range / 2
        ) * 2
        : 1;

      for (let i = Math.floor(this.minY / inc) * inc; i <= this.maxY; i += inc) {
        const tickPos = Math.floor(this.pixY(i)) + 0.5;
        const tickName = i.toFixed(1) + "%";
        this.ctx.fillText(tickName, this.padX1, tickPos);
      }
    }

    // plot data
    this.drawCubicLine(this.data, this.colors);
  }
}

export class GraphFundHistory extends LineGraph {
  constructor(options, api, state) {
    super(options, api, state);

    this.tension = GRAPH_FUND_HISTORY_TENSION;
    this.raw = options.data;
    this.funds = options.funds;
    this.fundLines = this.funds.map(() => false);
    this.fundLines.unshift(true); // overall line
    this.startTime = options.startTime;
    this.hlPoint = [-1, -1];

    this.togglePercent(true, true);

    this.colorMajor = COLOR_GRAPH_FUND_LINE;

    this.$label = $("<div></div>").addClass("label");
    this.$gCont.append(this.$fundSidebar);
    this.buildFundSidebar();
    this.$gCont.append(this.$label);

    this.$gCont[0].addEventListener("mousewheel", evt => {
      this.zoomX(-evt.wheelDelta / Math.abs(evt.wheelDelta));

      evt.preventDefault();
    });

    this.$gCont.on("mousemove", evt => {
      const offset = this.$gCont.offset();
      this.mouseOver(evt.pageX - offset.left, evt.pageY - offset.top);
    })
    .on("mouseout", () => {
      this.hlPoint = [-1, -1];
      this.draw();
    })
    .on("click", () => {
      this.togglePercent(!this.percent);
    });

    windowSize.narrow(() => {
      this.resize(GRAPH_FUND_HISTORY_WIDTH_NARROW);
    })
    .wide(() => {
      this.resize(GRAPH_FUND_HISTORY_WIDTH);
    })
    .trigger();
  }

  buildFundSidebar() {
    const $fundSidebar = $("<ul></ul>").addClass("fund-sidebar").addClass("noselect");

    const items = this.funds;
    items.unshift("Overall");
    this.funds.forEach((fund, index) => {
      const color = index > 0 ? COLOR_KEY[(index - 1) % COLOR_KEY.length] : "#000";
      const $item = $("<li></li>")
      .append($("<span></span>")
              .addClass("checkbox").css("border-color", color))
      .append($("<span></span>").addClass("fund").text(fund))
      .toggleClass("enabled", this.fundLines[index]);
      $item.on("click", evt => {
        const numActive = this.fundLines.reduce((a, b) => a + (b ? 1 : 0), 0);
        const status = numActive > 1 ? !$item.hasClass("enabled") : true;
        $item.toggleClass("enabled", status);
        this.fundLines[index] = status;
        this.togglePercent(this.percent);
        evt.stopPropagation();
      });
      $fundSidebar.append($item);
    });
    this.$gCont.append($fundSidebar);
  }

  resize(size) {
    this.width = size;
    this.$canvas[0].width = size;

    this.draw();
  }

  processData() {
    if (!this.raw.length) {
      return null;
    }

    const lines = [];

    if (this.percent) {
      this.fundLines.slice(1).forEach((status, index) => {
        // enabled individual fund lines
        if (status) {
          const color = COLOR_KEY[index % COLOR_KEY.length];
          let initial = null;
          const line = this.raw.map(item => {
            if (!item[1][index]) {
              return null;
            }
            const priceUnits = item[1][index];
            if (priceUnits[1]) {
              // units changed
              initial = priceUnits[0];
            }
            const percent = 100 * (priceUnits[0] - initial) / initial;

            return [item[0], percent];
          }).filter(item => item !== null);

          lines.push([color, line]);
        }
      });

      if (this.fundLines[0]) {
        // main line
        // have to weight by units
        let units = null;
        let initialLength = this.raw[0][1].length;
        const changedKeys = [];
        const fundWeights = this.raw.map((item, key) => {
          const changedFunds = item[1].map(priceUnits => {
            return key === 0 || priceUnits[1] ? 1 : 0;
          });

          const changed = !units || item[1].length !== initialLength ||
            arraySum(changedFunds) > 0;

          if (changed) {
            units = item[1].map((priceUnits, fundKey) => priceUnits[1] || units[fundKey]);
            changedKeys.push([key, changedFunds]);
            initialLength = item[1].length;
          }

          return units;
        }).map(item => {
          const total = arraySum(item);
          return item.map(unit => unit / total);
        });

        let initial = [null, null];
        const mainLine = [COLOR_GRAPH_FUND_LINE, this.raw.map((item, key) => {
          const changed = changedKeys.length && changedKeys[0][0] === key;
          const weights = item[1].map((priceUnits, fundKey) => {
            return changed && changedKeys[0][1][fundKey] ? fundWeights[key][fundKey] : initial[0][fundKey];
          });

          const newValue = item[1].map((priceUnits, fundKey) => {
            return priceUnits[0] * weights[fundKey];
          });

          if (changed) {
            const changedValue = item[1].map((priceUnits, fundKey) => {
              return changedKeys[0][1][fundKey] ? priceUnits[0] * weights[fundKey] : initial[1][fundKey];
            });

            initial = [weights, changedValue];
            changedKeys.shift();
          }
          const initialValue = arraySum(initial[1]);
          const percent = 100 * (arraySum(newValue) - initialValue) / initialValue;

          return [item[0], percent];
        })];

        lines.push(mainLine);
      }
    }
    else {
      this.fundLines.slice(1).forEach((status, index) => {
        // enabled individual fund lines
        if (status) {
          const color = COLOR_KEY[index % COLOR_KEY.length];
          let units = null;
          const line = this.raw.map(item => {
            if (!item[1][index]) {
              return null;
            }
            const priceUnits = item[1][index];
            if (priceUnits[1]) {
              units = priceUnits[1];
            }

            return [item[0], priceUnits[0] * units];
          }).filter(item => item !== null);

          lines.push([color, line]);
        }
      });

      if (this.fundLines[0]) {
        // main line
        const units = [];
        const mainLine = [COLOR_GRAPH_FUND_LINE, this.raw.map((item, key) => {
          const value = arraySum(item[1].map((priceUnits, fundKey) => {
            if (key === 0 || priceUnits[1]) {
              units[fundKey] = priceUnits[1];
            }
            return priceUnits[0] * units[fundKey];
          }));

          return [item[0], value];
        })];

        lines.push(mainLine);
      }
    }

    return lines;
  }
  togglePercent(status, noDraw) {
    this.percent = status;
    this.data = this.processData();
    if (!this.data) {
      return;
    }
    this.dataVisible = this.filterDataVisible();
    if (this.hlPoint[0] > this.data.length - 1) {
      this.hlPoint[0] = this.data.length - 1;
    }
    this.calculateYRange();
    if (!noDraw) {
      this.draw();
    }
  }
  getTimeScale() {
    // divides the time axis (horizontal) into appropriate chunks
    return timeSeriesTicks(
      this.startTime + this.minX, this.startTime + this.maxX
    ).map(tick => {
      return {
        major: tick.major,
        pix: Math.floor(this.pixX(tick.t - this.startTime)) + 0.5,
        text: tick.label || null
      };
    });
  }
  filterDataVisible() {
    return this.data.map(line => {
      return line.map((item, key) => {
        if (key === 1) {
          return item.filter((point, pointKey) => this.itemInRange(item, pointKey));
        }
        return item;
      });
    });
  }
  itemInRange(item, key) {
    const nextVisible = item[Math.min(item.length - 1, key + 1)][0] >= this.minX;
    const prevVisible = item[Math.max(0, key - 1)][0] <= this.maxX;

    return nextVisible && prevVisible;
  }
  zoomX(direction) {
    if (this.hlPoint[0] === -1 || this.hlPoint[1] === -1 ||
        (direction < 0 && this.dataVisible[0][1].length < 4)) {
      return;
    }

    const point = this.data[this.hlPoint[0]][1][this.hlPoint[1]][0];
    super.zoomX(direction, point);
    this.dataVisible = this.filterDataVisible();
    this.calculateYRange();
    this.draw();
  }
  calculateYRange() {
    // calculate new Y range based on truncating the data (zooming)
    let minY = Infinity;
    let maxY = -Infinity;
    this.dataVisible.forEach(line => {
      minY = line[1].reduce((last, current) => current[1] < last ? current[1] : last, minY);
      maxY = line[1].reduce((last, current) => current[1] > last ? current[1] : last, maxY);
    });

    if (minY === maxY) {
      minY -= 0.5;
      maxY += 0.5;
    }

    if (this.percent && minY === 0) {
      minY = -maxY * 0.2;
    }

    // return the tick size for the new range
    this.tickSizeY = getTickSize(minY, maxY, GRAPH_FUND_HISTORY_NUM_TICKS);

    // set the new ranges
    this.setRange([
      this.minX, this.maxX,
      this.tickSizeY * Math.floor(minY / this.tickSizeY),
      this.tickSizeY * Math.ceil(maxY / this.tickSizeY)
    ]);
  }

  formatValue(value) {
    return this.percent
      ? value.toFixed(2) + "%"
      : formatCurrency(value, { raw: true });
  }
  draw() {
    if (!this.supported) {
      return;
    }
    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    const axisTextColor = COLOR_DARK;
    const timeTicks = this.getTimeScale();

    // calculate tick range
    const ticksY = [];
    // draw value (Y axis) ticks and horizontal lines
    const newNumTicks = Math.floor((this.maxY - this.minY) / this.tickSizeY);

    // draw axes
    this.ctx.lineWidth = 1;
    for (let i = 0; i < newNumTicks; i++) {
      const value = this.minY + (i + 1) * this.tickSizeY;

      const tickPos = Math.floor(this.pixY(value)) + 0.5;

      // add value (Y axis) tick to array to draw on top of graph
      ticksY.push([value, tickPos]);

      // draw horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(this.padX1, tickPos);
      this.ctx.lineTo(this.width - this.padX2, tickPos);

      this.ctx.strokeStyle = this.percent ? (value > 0 ? COLOR_PROFIT : COLOR_LOSS) : COLOR_LIGHT_GREY;
      this.ctx.stroke();
    }

    // draw time (X axis) ticks
    const y0 = this.pixY(this.minY);

    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = axisTextColor;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom";

    const tickAngle = -Math.PI / 6;
    const tickSize = 10;

    timeTicks.forEach(tick => {
      const thisTickSize = tickSize * 0.5 * (tick.major + 1);

      this.ctx.beginPath();
      this.ctx.strokeStyle = tick.major ? COLOR_GRAPH_TITLE : COLOR_DARK;
      this.ctx.moveTo(tick.pix, y0);
      this.ctx.lineTo(tick.pix, y0 - thisTickSize);
      this.ctx.stroke();
      this.ctx.closePath();

      if (tick.major > 1) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = COLOR_LIGHT_GREY;
        this.ctx.moveTo(tick.pix, y0 - thisTickSize);
        this.ctx.lineTo(tick.pix, this.padY1);
        this.ctx.stroke();
        this.ctx.closePath();
      }

      if (tick.text) {
        this.ctx.save();
        this.ctx.translate(tick.pix, y0 - thisTickSize);
        this.ctx.rotate(tickAngle);
        this.ctx.fillText(tick.text, 0, 0);
        this.ctx.restore();
      }
    });

    const mainIndex = this.data.length - 1;

    // plot past data
    if (this.dataVisible) {
      const mainOnly = this.dataVisible.length === 1;
      const mainColor = mainOnly ? this.dataVisible[0][0] : COLOR_LIGHT_GREY;

      this.dataVisible.forEach((line, index) => {
        const mainLine = index === mainIndex && this.fundLines[0];

        this.lineWidth = mainLine ? GRAPH_FUND_HISTORY_LINE_WIDTH : 1;
        this.drawCubicLine(
          line[1],
          [mainLine ? mainColor : line[0]],
          mainLine ? [30, 90] : 0
        );

        if (mainLine) {
          GRAPH_FUND_HISTORY_MOVING_AVG.forEach((period, key) => {
            const avg = getMovingAverage(this.data[index][1], period);
            const avgFiltered = avg.filter(
              (point, pointKey) => this.itemInRange(avg, pointKey));
            const averageCurve = this.getSpline(avgFiltered);
            this.drawCubicLineCurve(averageCurve, avg, [mainColor], 1, 5 * (2 * key + 1), 5);
          });
        }
      });
    }

    // draw Y axis
    this.ctx.fillStyle = axisTextColor;
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "right";
    this.ctx.font = FONT_AXIS_LABEL;

    for (const tick of ticksY) {
      const tickName = this.formatValue(tick[0], true, true);

      this.ctx.fillText(tickName, this.width - this.padX2, tick[1]);
    }

    // highlight point on mouseover
    if (
      this.hlPoint[0] > -1 &&
      this.data[this.hlPoint[0]][1][this.hlPoint[1]] &&
      this.data[this.hlPoint[0]][1][this.hlPoint[1]][0] >= this.minX
    ) {
      const point = this.data[this.hlPoint[0]][1][this.hlPoint[1]];

      const hlX = this.pixX(point[0]);
      const hlY = this.pixY(point[1]);

      const time = point[0] + this.startTime;
      const age = todayDate.getTime() - time * 1000;
      const ageText = formatAge(age / 1000);

      const align = hlX < this.width / 2 ? -1 : 1;
      const label = ageText + ": " + this.formatValue(point[1]);

      const left = align > 0
        ? "initial" : hlX + GRAPH_FUND_HISTORY_POINT_RADIUS;
      const right = align > 0
        ? this.width - hlX + GRAPH_FUND_HISTORY_POINT_RADIUS : "initial";
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

      this.ctx.fillStyle = this.hlPoint[2];
      this.ctx.fill();
      this.ctx.closePath();
    }
    else {
      this.$label.hide();
    }
  }
  mouseOver(x, y) {
    if (!this.data) {
      return;
    }

    const xv = this.valX(x);
    const yv = this.valY(y);

    // find point nearest to mouse
    let lastProximity = Infinity;
    const hlPoint = this.data.reduce((prevPoint, thisLine, lineIndex) => {
      return thisLine[1].reduce((prevLinePoint, thisLinePoint, pointIndex) => {
        if (thisLinePoint[0] < this.minX || thisLinePoint[1] > this.maxX) {
          return prevLinePoint;
        }

        const thisProximity = Math.sqrt(Math.pow(xv - thisLinePoint[0], 2) +
                                        Math.pow(yv - thisLinePoint[1], 2));

        if (thisProximity < lastProximity) {
          lastProximity = thisProximity;
          return [lineIndex, pointIndex, thisLine[0]];
        }

        return prevLinePoint;
      }, prevPoint);
    }, [-1, -1]);

    if (hlPoint[0] !== this.hlPoint[0] || hlPoint[1] !== this.hlPoint[1]) {
      this.hlPoint = hlPoint;
      this.draw();
    }
  }
}

