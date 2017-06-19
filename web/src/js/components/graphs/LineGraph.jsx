/**
 * React component to display a line graph (e.g. time series)
 */

import { List as list } from 'immutable';
import { Graph } from './Graph.jsx';
import { timeSeriesTicks } from '../../misc/date';

// Hermite abbreviated functions
const h00 = t => (1 + 2 * t) * Math.pow(1 - t, 2);
const h10 = t => t * Math.pow(1 - t, 2);
const h01 = t => Math.pow(t, 2) * (3 - 2 * t);
const h11 = t => Math.pow(t, 2) * (t - 1);
const hermiteF = (x, xk1, yk1, xk2, yk2, mk1, mk2) => {
  const t = (x - xk1) / (xk2 - xk1);

  return  h00(t) * yk1 +
          h10(t) * (xk2 - xk1) * mk1 +
          h01(t) * yk2 +
          h11(t) * (xk2 - xk1) * mk2;
};

export class LineGraph extends Graph {
  constructor(props) {
    super(props);
    this.colorTransition = [null];
    this.setRange([0, 1, 0, 1]);
    this.tension = 0.5; // for cubic lines
  }
  pixX(x) {
    return this.padding[3] + (x - this.minX) / (this.maxX - this.minX)
      * (this.width - this.padding[3] - this.padding[1]);
  }
  valX(pix) {
    return (pix - this.padding[3]) * (this.maxX - this.minX) /
      (this.width - this.padding[3] - this.padding[1]) + this.minX;
  }
  pixY(y) {
    return this.height - this.padding[2] -
      (y - this.minY) / (this.maxY - this.minY) *
      (this.height - this.padding[0] - this.padding[2]);
  }
  valY(pix) {
    return (this.height - this.padding[2] - pix) * (this.maxY - this.minY) /
      (this.height - this.padding[0] - this.padding[2]) + this.minY;
  }
  setRange(range) {
    this.minX = range[0];
    this.maxX = range[1];
    this.minY = range[2];
    this.maxY = range[3];
  }
  getTimeScale(offset) {
    // divides the time axis (horizontal) into appropriate chunks
    const ticks = timeSeriesTicks(
      offset + this.minX, offset + this.maxX
    );
    return ticks ? ticks.map(tick => {
      return {
        major: tick.major,
        pix: Math.floor(this.pixX(tick.t - offset)) + 0.5,
        text: tick.label || null
      };
    }) : [];
  }
  getCubicSpline(points, tension) {
    // Hermite spline (cardinal spline)

    // secants
    const secants = points.slice(0, -1).map((point, key) => {
      return (points.getIn([key + 1, 1]) - points.getIn([key, 1])) /
        (points.getIn([key + 1, 0]) - points.getIn([key, 0]));
    });

    // tangents
    const tangents = points.map((point, key) => {
      if (key === 0) {
        return secants.first();
      }
      if (key === secants.size) {
        return secants.last();
      }
      return (1 - tension) * (secants.get(key - 1) + secants.get(key));
    });

    let xPixel;
    let xPixelGoal = this.pixX(points.getIn([0, 0])); // next point's pixel value
    let xValue1 = points.getIn([0, 0]); // cumulative X value
    let xValue2 = points.getIn([0, 0]);

    const curve = secants.map((secant, key) => {
      xValue2 += points.getIn([key + 1, 0]) - points.getIn([key, 0]);
      xPixel = xPixelGoal; // previous goal is current start
      xPixelGoal = this.pixX(xValue2);

      // interpolate the curve between this point and the next
      const numPoints = Math.max(1, Math.floor(xPixelGoal - xPixel));
      const curvePiece = list(Array.apply(null, new Array(numPoints)).map((_, pieceKey) => {
        const xValue = this.valX(xPixel + pieceKey);
        const yValue1 = points.getIn([key, 1]);
        const yValue2 = points.getIn([key + 1, 1]);
        const yValue = hermiteF(
          xValue, xValue1, yValue1, xValue2, yValue2, tangents.get(key), tangents.get(key + 1)
        );

        return list([xPixel + pieceKey, this.pixY(yValue)]);
      }));

      xValue1 = xValue2;
      return curvePiece;
    });

    // add the last point
    return curve.set(curve.size - 1, curve.last().push(list([
      this.pixX(points.getIn([secants.size, 0])),
      this.pixY(points.getIn([secants.size, 1]))
    ])));
  }
  drawCubicLineCurve(curve, points, color) {
    this.ctx.beginPath();

    let colorKey = 0;
    let moved = false;
    let colorTransitionKey = 0;

    const dynamicColor = typeof color === 'function';
    let last = list([null, null]);
    let theColor = dynamicColor ? color(this.valY(curve.getIn([0, 0, 1]))) : color[0];
    this.ctx.strokeStyle = theColor;

    curve.forEach((piece, i) => {
      if (i === this.colorTransition[colorTransitionKey]) {
        colorTransitionKey++;

        if (moved) {
          this.ctx.lineTo(piece.getIn([0, 0]), piece.getIn([0, 1]));
          this.ctx.stroke();
          this.ctx.closePath();
          this.ctx.beginPath();
        }

        this.ctx.strokeStyle = dynamicColor ? color(this.valY(piece.getIn([0, 1])))
          : color[++colorKey % color.length];
        moved = false;
      }

      piece.forEach(point => {
        if (dynamicColor) {
          const newColor = color(this.valY(point.last()));
          if (newColor !== theColor) {
            if (moved) {
              this.ctx.strokeStyle = theColor;
              this.ctx.stroke();
              this.ctx.closePath();
              this.ctx.beginPath();
              this.ctx.moveTo(last.first(), last.last());
            }
            theColor = newColor;
          }
          last = point;
        }

        if (!moved) {
          this.ctx.moveTo(point.first(), point.last());
          moved = true;
        }
        else {
          this.ctx.lineTo(point.first(), point.last());
        }
      });
    });

    // complete the line to the last point
    this.ctx.lineTo(this.pixX(points.last().first()), this.pixY(points.last().last()));

    if (dynamicColor) {
      this.ctx.strokeStyle = theColor;
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }
  drawCubicLine(points, color, theOptions) {
    if (points.length < 2) {
      return;
    }
    const options = theOptions || { stroke: true };

    const tension = typeof options.tension === 'undefined' ? this.tension : options.tension;
    const curve = this.getCubicSpline(points, tension);

    if (options.fill) {
      this.ctx.beginPath();
      this.ctx.fillStyle = color[0];
      this.ctx.moveTo(this.pixX(points.getIn([0, 0])), this.pixY(points.getIn([0, 1])));

      curve.forEach(piece => {
        piece.forEach(point => {
          this.ctx.lineTo(point.first(), point.last());
        });
      });

      // complete the filled graph
      this.ctx.lineTo(
        this.pixX(points.last().first()), this.pixY(points.last().last()));
      this.ctx.lineTo(
        this.pixX(points.last().first()), this.pixY(0));
      this.ctx.lineTo(
        this.pixX(points.first().first()), this.pixY(0));

      this.ctx.fill();
      this.ctx.closePath();
    }

    if (options.stroke) {
      this.drawCubicLineCurve(curve, points, color);
    }
  }
}
