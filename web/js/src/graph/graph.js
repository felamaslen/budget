/**
 * Graph stuff
 */

import $ from "../../lib/jquery.min";

import {
  MSG_TIME_FATAL, MSG_TIME_DEBUG,
  COLOR_PIE_L1, COLOR_PIE_L2, COLOR_PIE_L3,
  COLOR_PIE_M1, COLOR_PIE_M2, COLOR_PIE_M3,
  COLOR_PIE_S1, COLOR_PIE_S2,
  COLOR_GRAPH_TITLE,
  FONT_AXIS_LABEL, FONT_GRAPH_TITLE_LARGE,
  PIE_SMALL_LABEL_OFFSET, PIE_LABEL_INSIDE_RADIUS,
  PIE_LABEL_SWITCH_POINT, PIE_DEPTH,
  PIE_LABEL_RADIUS_START, PIE_LABEL_RADIUS_SCALE,
  PIE_LABEL_SCALE_FACTOR_PRE, PIE_LABEL_SCALE_FACTOR_POST
} from "const";

import { trim, getMovingAverage, zoomSlice } from "misc/misc";
import { formatData } from "misc/format";

const pio2 = Math.PI / 2;

export function getTickSize(min, max, numTicks) {
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

class Graph {
  constructor(options, api, state) {
    this.supported = !!window.CanvasRenderingContext2D;

    this.api = api;
    this.state = state;

    if (!this.supported) {
      this.state.error.newMessage("HTML5 Canvas is not supported! Not drawing graphs", 3, MSG_TIME_FATAL);
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

    this.ctx = this.supported ? this.$canvas[0].getContext("2d") : null;
  }
}

export class LineGraph extends Graph {
  constructor(options, api, state) {
    super(options, api, state);

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
    .addClass("graph-" + this.title);

    this.$gCont.append(this.$canvas);

    this.$cont.append(this.$gCont);
  }

  setRange(range) {
    this.minX = range[0];
    this.maxX = range[1];
    this.minY = range[2];
    this.maxY = range[3];

    this.setLogRange();
  }
  setLogY() {
    if (this.minY * this.maxY <= 0) {
      // can't log a zero value; range contains zero
      this.state.error.newMessage("Attempted to set log range containing zero!", 0, MSG_TIME_DEBUG);
      return;
    }

    this.log = true;
    this.setLogRange();
  }
  setLogRange() {
    this.lMinY = this.log ? Math.log(this.minY) : this.minY;
    this.lMaxY = this.log ? Math.log(this.maxY) : this.maxY;
  }

  pixX(x) {
    return this.padX1 + (x - this.minX) / (this.maxX - this.minX)
      * (this.width - this.padX1 - this.padX2);
  }
  valX(pix) {
    return (pix - this.padX1) * (this.maxX - this.minX) /
      (this.width - this.padX1 - this.padX2) + this.minX;
  }
  pixY(y) {
    const ly = this.log ? Math.log(y) / this.log : y;

    return this.height - this.padY2 -
      (ly - this.lMinY) / (this.lMaxY - this.lMinY) *
      (this.height - this.padY1 - this.padY2);
  }
  valY(pix) {
    const yv = (this.height - this.padY2 - pix) * (this.lMaxY - this.lMinY) /
      (this.height - this.padY1 - this.padY2) + this.minY;

    return this.log ? Math.pow(Math.E, yv * this.log) : yv;
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

    let xn = this.pixX(this.minX);

    let k = this.minX;
    let k1 = this.minX;

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
  drawCubicLineCurve(curve, p, colors, width, dashed, dashGap) {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = colors[0];

    this.ctx.beginPath();

    let colorKey = 0;
    let moved = false;
    let transitionKey = 0;
    let arcLength = 0;
    let dashToggle = 1;
    let dashLength = dashed;
    let x;
    let y;

    curve.forEach((piece, i) => {
      if (i === this.transition[transitionKey]) {
        transitionKey++;

        if (!dashed || dashToggle) {
          this.ctx.lineTo(piece[0][0], piece[0][1]);
          this.ctx.stroke();
          this.ctx.closePath();
          this.ctx.beginPath();
        }

        this.ctx.strokeStyle = colors[++colorKey % colors.length];

        moved = false;
      }

      for (const point of piece) {
        if (!dashed || dashToggle) {
          if (!moved) {
            this.ctx.moveTo(point[0], point[1]);
            moved = true;
          }
          else {
            this.ctx.lineTo(point[0], point[1]);
          }
        }

        if (dashed) {
          if (x) {
            arcLength += Math.sqrt(Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2));
          }
          if (arcLength > dashLength) {
            if (dashToggle) {
              this.ctx.stroke();
              this.ctx.closePath();
            }
            else {
              this.ctx.beginPath();
              moved = false;
            }
            dashToggle = !dashToggle;
            dashLength = dashToggle ? dashed : dashGap;
            arcLength = 0;
          }
          x = point[0];
          y = point[1];
        }
      }
    });

    if (dashed && !dashToggle) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(this.pixX(p[p.length - 1][0]),
                    this.pixY(p[p.length - 1][1]));

    this.ctx.stroke();
    this.ctx.closePath();
  }
  drawCubicLine(points, colors, movingAverage, zoom) {
    zoom = zoom || 0;
    const zoomPoints = zoomSlice(points, zoom);
    const curve = this.getSpline(zoomPoints);

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
      this.drawCubicLineCurve(curve, zoomPoints, colors, this.lineWidth);
    }

    if (movingAverage) {
      movingAverage.forEach((period, key) => {
        const avg = zoomSlice(getMovingAverage(points, period), zoom);
        const averageCurve = this.getSpline(avg);
        this.drawCubicLineCurve(averageCurve, avg, colors, 1, 5 * (key + 1), 5);
      });
    }
  }
  drawLine(p, color) {
    if (typeof color === "object") {
      color = color[0];
    }

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

export class PieGraph extends Graph {
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
  setLabelColors() {
    this.data.forEach(item => {
      const label = item[0];

      if (!this.labelColors[label]) {
        const offset = Math.floor(this.labelKey / this.colors.length);

        this.labelColors[label] = this.colors[
          (offset + this.labelKey++) % this.colors.length
        ];
      }
    });
  }
  labelRadiusExtension(x) {
    return x < PIE_LABEL_SWITCH_POINT
    ? PIE_LABEL_SCALE_FACTOR_PRE * Math.sin(
      pio2 * x / PIE_LABEL_SWITCH_POINT
    )
    : -PIE_LABEL_SCALE_FACTOR_POST * (x - 1) /
      (1 - PIE_LABEL_SWITCH_POINT);
  }
  drawLabel(p, x, y, angle, thisAngle, radius, smallLabelOffset, lastLabelAngle) {
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
        // fraction of the top-left quadrant where the label is
        const frac = (midAngle - Math.PI) / pio2;

        if (frac >= PIE_LABEL_SWITCH_POINT) {
          labelDirection = 1;
        }

        labelRadiusScale = PIE_LABEL_RADIUS_START + PIE_LABEL_RADIUS_SCALE *
          this.labelRadiusExtension(frac);
      }

      const labelRadius = radius * labelRadiusScale;

      const labelBegin = this.pointFromCircle(
        x, y, radius * PIE_LABEL_INSIDE_RADIUS, midAngle
      );
      const labelEnd = this.pointFromCircle(
        x, y, labelRadius, midAngle
      );

      this.stretch();

      this.ctx.beginPath();
      this.ctx.moveTo(labelBegin[0], labelBegin[1]);

      const textAnchor = this.pointFromCircle(
        x, y, labelRadius + 1, midAngle
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

    return {
      offset: smallLabelOffset,
      angle: lastLabelAngle
    };
  }
  drawPieSection(x, y, r, angle1, angle2, color) {
    const pieDepth = PIE_DEPTH;

    this.stretch();

    this.ctx.beginPath();
    this.ctx.fillStyle = color;

    this.ctx.moveTo(x, y);

    // filled arcs
    this.ctx.arc(x, y, r, angle1, angle2, false);

    if (angle2 > 0 && (angle1 < Math.PI || angle2 <= Math.PI)) {
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.lineWidth = 2;

      const base1 = Math.max(0, angle1);
      const base2 = Math.min(Math.PI, angle2);

      const p = [
        [r * Math.cos(base1), r * Math.sin(base1)],
        [r * Math.cos(base2), r * Math.sin(base2) + pieDepth]
      ];

      this.ctx.moveTo(x + p[0][0], y + p[0][1]);
      this.ctx.arc(x, y, r, base1, base2, false);
      this.ctx.lineTo(x + p[1][0], y + p[1][1]);
      this.ctx.arc(x, y + pieDepth, r, base2, base1, true);
      this.ctx.lineTo(x + p[0][0], y + p[0][1]);
    }

    this.ctx.fill();
    this.ctx.closePath();

    this.unstretch();
  }
  draw() {
    if (!this.supported) {
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // set label colours
    this.setLabelColors();

    this.ctx.strokeStyle = COLOR_GRAPH_TITLE;
    this.ctx.font = FONT_AXIS_LABEL;

    let smallLabelOffset = PIE_SMALL_LABEL_OFFSET;

    let lastLabelAngle = 0;

    const centreX = 9 * this.width / 17;
    const centreY = 5 * this.height / 8;

    const radius = Math.min(this.width, this.height) / 4.5;

    const startAngle = -0.1 - pio2;
    let angle = startAngle;

    this.data.forEach(p => {
      const thisAngle = 2 * Math.PI * p[1] / this.total;
      const thisColor = this.labelColors[p[0]];

      const newAngle  = angle + thisAngle;

      // draw pie section
      this.drawPieSection(centreX, centreY, radius, angle, newAngle, thisColor);

      // draw label
      const label = this.drawLabel(
        p, centreX, centreY, angle, thisAngle, radius, smallLabelOffset, lastLabelAngle
      );

      smallLabelOffset = label.offset;
      lastLabelAngle = label.angle;

      angle = newAngle;
    });

    // stroke the entire pie
    this.stretch();
    this.ctx.beginPath();

    this.ctx.arc(centreX, centreY, radius, 0, Math.PI * 2, false);
    this.ctx.stroke();

    this.ctx.closePath();
    this.ctx.beginPath();

    this.ctx.moveTo(centreX + radius, centreY);
    this.ctx.lineTo(centreX + radius, centreY + PIE_DEPTH);
    this.ctx.arc(centreX, centreY + PIE_DEPTH, radius, 0, Math.PI, false);
    this.ctx.lineTo(centreX - radius, centreY);

    this.ctx.stroke();
    this.ctx.closePath();
    this.unstretch();

    // draw graph title
    this.ctx.fillStyle = "#000";
    this.ctx.font = FONT_GRAPH_TITLE_LARGE;
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";

    this.ctx.fillText(this.title, this.width - 10, 10);
  }
}

