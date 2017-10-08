/**
 * React component to display a line graph (e.g. time series)
 */

import Graph from './Graph';
import { timeSeriesTicks } from '../../misc/date';

// Hermite functions
function h00(value) {
    return (1 + 2 * value) * Math.pow(1 - value, 2);
}
function h10(value) {
    return value * Math.pow(1 - value, 2);
}
function h01(value) {
    return Math.pow(value, 2) * (3 - 2 * value);
}
function h11(value) {
    return Math.pow(value, 2) * (value - 1);
}
function hermite(x0, xA, yA, xB, yB, mA, mB) {
    const value = (x0 - xA) / (xB - xA);

    return h00(value) * yA +
        h10(value) * (xB - xA) * mA +
        h01(value) * yB +
        h11(value) * (xB - xA) * mB;
}
function getTension(value) {
    const exp1 = Math.exp(value / 100 + 0.5);
    const exp2 = 1 / exp1;

    const tension = (exp1 - exp2) / (exp1 + exp2);

    if (isNaN(tension)) {
        return 0;
    }

    return tension;
}
function getInterpolatorHermite(points) {
    // secants
    const secants = points
        .slice(1)
        .map((point, key) => (point[1] - points[key][1]) / (point[0] - points[key][0]));

    // tangents
    const tangents = points.map((point, key) => {
        if (key === 0) {
            return secants[0];
        }
        if (key === secants.length) {
            return secants[key - 1];
        }

        const tension = getTension(Math.max(
            Math.abs(secants[key] / secants[key - 1]),
            key > 1
                ? Math.abs(secants[key - 1] / secants[key - 2])
                : 0
        ));

        return (1 - tension) * (secants[key - 1] + secants[key]);
    });

    return (key, pixel) => hermite(
        points[key][0] + pixel,
        points[key][0],
        points[key][1],
        points[key + 1][0],
        points[key + 1][1],
        tangents[key],
        tangents[key + 1]
    );
}

export default class LineGraph extends Graph {
    constructor(props) {
        super(props);

        this.colorTransition = [null];
        this.setRange([0, 1, 0, 1]);
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

    getCubicCurve(pointsList) {
        // Hermite spline
        const points = pointsList
            .toJS()
            .map(point => [this.pixX(point[0]), this.pixY(point[1])]);

        const interpolator = getInterpolatorHermite(points);

        return points
            .slice(1)
            .map((point, key) => new Array(Math.max(1, Math.floor(points[key + 1][0] - points[key][0])))
                .fill(0)
                .map((item, pixel) => [points[key][0] + pixel, interpolator(key, pixel)])
            );
    }

    drawCubicLineCurve(curve, points, color) {
        this.ctx.beginPath();

        let colorKey = 0;
        let moved = false;
        let colorTransitionKey = 0;

        const dynamicColor = typeof color === 'function';
        let theColor = dynamicColor
            ? color(points.getIn([0, 1]))
            : color[0];
        this.ctx.strokeStyle = theColor;

        curve.forEach((piece, pieceKey) => {
            if (pieceKey === this.colorTransition[colorTransitionKey]) {
                colorTransitionKey++;

                if (moved) {
                    this.ctx.lineTo(piece[0][0], piece[0][1]);
                    this.ctx.stroke();
                    this.ctx.closePath();
                    this.ctx.beginPath();
                }

                this.ctx.strokeStyle = dynamicColor
                    ? color(this.valY(piece[0][1]))
                    : color[++colorKey % color.length];

                moved = false;
            }

            piece.forEach((point, pointKey) => {
                if (dynamicColor) {
                    const newColor = color(this.valY(point[1]));
                    if (newColor !== theColor) {
                        if (moved) {
                            this.ctx.strokeStyle = theColor;
                            this.ctx.stroke();
                            this.ctx.closePath();
                            this.ctx.beginPath();

                            if (pointKey > 0) {
                                this.ctx.moveTo(piece[pointKey - 1][0], piece[pointKey - 1][1]);
                            }
                            else if (pieceKey > 0) {
                                const lastCurve = curve[pieceKey - 1];
                                const lastPoint = lastCurve[lastCurve.length - 1];

                                this.ctx.moveTo(lastPoint[0], lastPoint[1]);
                            }
                        }
                        theColor = newColor;
                    }
                }

                if (moved) {
                    this.ctx.lineTo(point[0], point[1]);
                }
                else {
                    this.ctx.moveTo(point[0], point[1]);
                    moved = true;
                }
            });
        });

        // complete the line to the last point
        this.ctx.lineTo(
            this.pixX(points.getIn([points.size - 1, 0])),
            this.pixY(points.getIn([points.size - 1, 1]))
        );

        if (dynamicColor) {
            this.ctx.strokeStyle = theColor;
        }

        this.ctx.stroke();
        this.ctx.closePath();
    }
    drawCubicLine(points, color, theOptions = {}) {
        if (points.size < 2) {
            return;
        }
        const options = { stroke: true, ...theOptions };

        const curve = this.getCubicCurve(points);

        if (options.fill) {
            this.ctx.beginPath();
            this.ctx.fillStyle = color[0];
            this.ctx.moveTo(this.pixX(points.first().get(0)), this.pixY(points.first().get(1)));

            curve.forEach(piece => {
                piece.forEach(point => {
                    this.ctx.lineTo(point[0], point[1]);
                });
            });

            // complete the filled graph
            this.ctx.lineTo(this.pixX(points.last().get(0)), this.pixY(points.last().get(1)));
            this.ctx.lineTo(this.pixX(points.last().get(0)), this.pixY(0));
            this.ctx.lineTo(this.pixX(points.first().get(0)), this.pixY(points.first().get(1)));

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

