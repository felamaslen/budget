/**
 * React component to display a line graph (e.g. time series)
 */

import { List as list } from 'immutable';
import Graph from './Graph';
import { timeSeriesTicks } from '../../misc/date';

export default class LineGraph extends Graph {
    constructor(props) {
        super(props);

        this.colorTransition = [null];
        this.setRange([0, 1, 0, 1]);
        this.tension = 0.5; // for cubic lines
    }
    pixX(xValue) {
        return this.padding[3] +
            (xValue - this.minX) / (this.maxX - this.minX) *
            (this.width - this.padding[3] - this.padding[1]);
    }
    valX(pix) {
        return (pix - this.padding[3]) * (this.maxX - this.minX) /
            (this.width - this.padding[3] - this.padding[1]) + this.minX;
    }
    pixY(yValue) {
        return this.height - this.padding[2] -
            (yValue - this.minY) / (this.maxY - this.minY) *
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

        if (ticks) {
            return ticks.map(tick => {
                return {
                    major: tick.major,
                    pix: Math.floor(this.pixX(tick.time - offset)) + 0.5,
                    text: tick.label || null
                };
            });
        }

        return [];
    }
    // Hermite functions
    static h00(value) {
        return (1 + 2 * value) * Math.pow(1 - value, 2);
    }
    static h10(value) {
        return value * Math.pow(1 - value, 2);
    }
    static h01(value) {
        return Math.pow(value, 2) * (3 - 2 * value);
    }
    static h11(value) {
        return Math.pow(value, 2) * (value - 1);
    }
    static hermite(x0, xA, yA, xB, yB, mA, mB) {
        const value = (x0 - xA) / (xB - xA);

        return LineGraph.h00(value) * yA +
            LineGraph.h10(value) * (xB - xA) * mA +
            LineGraph.h01(value) * yB +
            LineGraph.h11(value) * (xB - xA) * mB;
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

        let xPixel = null;
        let xPixelGoal = this.pixX(points.getIn([0, 0])); // next point's pixel value
        let xValue1 = points.getIn([0, 0]); // cumulative X value
        let xValue2 = points.getIn([0, 0]);

        const curve = secants.map((secant, key) => {
            xValue2 += points.getIn([key + 1, 0]) - points.getIn([key, 0]);
            xPixel = xPixelGoal; // previous goal is current start
            xPixelGoal = this.pixX(xValue2);

            // interpolate the curve between this point and the next
            const numPoints = Math.max(1, Math.floor(xPixelGoal - xPixel));
            if (!numPoints) {
                return list.of();
            }
            const curvePiece = list(new Array(numPoints).fill(0))
                .map((item, pieceKey) => {
                    const xValue = this.valX(xPixel + pieceKey);
                    const yValue1 = points.getIn([key, 1]);
                    const yValue2 = points.getIn([key + 1, 1]);
                    const yValue = LineGraph.hermite(
                        xValue, xValue1, yValue1, xValue2, yValue2, tangents.get(key), tangents.get(key + 1)
                    );

                    return list([xPixel + pieceKey, this.pixY(yValue)]);
                });

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
        let theColor = dynamicColor
            ? color(this.valY(curve.getIn([0, 0, 1])))
            : color[0];
        this.ctx.strokeStyle = theColor;

        curve.forEach((piece, key) => {
            if (key === this.colorTransition[colorTransitionKey]) {
                colorTransitionKey++;

                if (moved) {
                    this.ctx.lineTo(piece.getIn([0, 0]), piece.getIn([0, 1]));
                    this.ctx.stroke();
                    this.ctx.closePath();
                    this.ctx.beginPath();
                }

                this.ctx.strokeStyle = dynamicColor
                    ? color(this.valY(piece.getIn([0, 1])))
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

                if (moved) {
                    this.ctx.lineTo(point.first(), point.last());
                }
                else {
                    this.ctx.moveTo(point.first(), point.last());
                    moved = true;
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
        if (points.size < 2) {
            return;
        }
        const options = theOptions || { stroke: true };

        // the tension can be 0, which is falsey
        const tension = typeof options.tension === 'undefined'
            ? this.tension
            : options.tension;
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
    drawLine(points, color) {
        if (points.size < 2) {
            return;
        }
        const dynamicColor = typeof color === 'function';
        let theColor = dynamicColor
            ? color(points.getIn([0, 1]))
            : color;

        let newColor = null;
        let moved = false;
        this.ctx.beginPath();
        points.forEach(point => {
            const xPix = this.pixX(point.first());
            const yPix = this.pixY(point.last());

            if (moved) {
                this.ctx.lineTo(xPix, yPix);
                if (dynamicColor) {
                    newColor = color(point.last());
                    if (newColor !== theColor) {
                        this.ctx.strokeStyle = theColor;
                        this.ctx.stroke();
                        this.ctx.closePath();
                        this.ctx.beginPath();
                        this.ctx.moveTo(xPix, yPix);
                        theColor = newColor;
                    }
                }
            }
            else {
                this.ctx.moveTo(xPix, yPix);
                moved = true;
            }
        });

        this.ctx.strokeStyle = theColor;
        this.ctx.stroke();
        if (this.fill) {
            this.ctx.lineTo(this.pixX(points.last().first(), this.pixY(0)));
            this.ctx.lineTo(this.pixX(points.first().first(), this.pixY(0)));
            this.ctx.fillStyle = theColor;
            this.ctx.fill();
        }
        this.ctx.closePath();
    }
}

