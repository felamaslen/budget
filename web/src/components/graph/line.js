/**
 * React component to display a line graph (e.g. time series)
 */

import { List as list } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import Graph from '.';
import { timeSeriesTicks } from '../../misc/date';

/*
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
*/

/*
const getTimeScale = offset => {
    // divides the time axis (horizontal) into appropriate chunks
    const ticks = timeSeriesTicks(offset + this.props.minX, offset + this.props.maxX);

    if (ticks) {
        return ticks.map(tick => ({
            major: tick.major,
            pix: Math.floor(this.pixX(tick.time - offset)) + 0.5,
            text: tick.label || null
        }));
    }

    return [];
};

const getCubicCurve = pointsList => {
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
};

const drawCubicLineCurve = (curve, points, color) => {
    let colorKey = 0;
    let moved = false;
    let colorTransitionKey = 0;

    const dynamicColor = typeof color === 'function';
    let theColor = dynamicColor
        ? color(points.getIn([0, 1]))
        : color[0];

    this.state.ctx.beginPath();
    this.state.ctx.strokeStyle = theColor;

    curve.forEach((piece, pieceKey) => {
        if (pieceKey === this.props.colorTransition[colorTransitionKey]) {
            colorTransitionKey++;

            if (moved) {
                this.state.ctx.lineTo(piece[0][0], piece[0][1]);
                this.state.ctx.stroke();
                this.state.ctx.closePath();
                this.state.ctx.beginPath();
            }

            this.state.ctx.strokeStyle = dynamicColor
                ? color(this.valY(piece[0][1]))
                : color[++colorKey % color.length];

            moved = false;
        }

        piece.forEach((point, pointKey) => {
            if (dynamicColor) {
                const newColor = color(this.valY(point[1]));
                if (newColor !== theColor) {
                    if (moved) {
                        this.state.ctx.strokeStyle = theColor;
                        this.state.ctx.stroke();
                        this.state.ctx.closePath();
                        this.state.ctx.beginPath();

                        if (pointKey > 0) {
                            this.state.ctx.moveTo(piece[pointKey - 1][0], piece[pointKey - 1][1]);
                        }
                        else if (pieceKey > 0) {
                            const lastCurve = curve[pieceKey - 1];
                            const lastPoint = lastCurve[lastCurve.length - 1];

                            this.state.ctx.moveTo(lastPoint[0], lastPoint[1]);
                        }
                    }
                    theColor = newColor;
                }
            }

            if (moved) {
                this.state.ctx.lineTo(point[0], point[1]);
            }
            else {
                this.state.ctx.moveTo(point[0], point[1]);
                moved = true;
            }
        });
    });

    // complete the line to the last point
    this.state.ctx.lineTo(
        this.pixX(points.getIn([points.size - 1, 0])),
        this.pixY(points.getIn([points.size - 1, 1]))
    );

    if (dynamicColor) {
        this.state.ctx.strokeStyle = theColor;
    }

    this.state.ctx.stroke();
    this.state.ctx.closePath();
};

const drawCubicLine = (points, color, theOptions = {}) => {
    if (points.size < 2) {
        return;
    }
    const options = { stroke: true, ...theOptions };

    const curve = this.getCubicCurve(points);

    if (options.fill) {
        this.state.ctx.beginPath();
        this.state.ctx.fillStyle = color[0];
        this.state.ctx.moveTo(this.pixX(points.first().get(0)), this.pixY(points.first().get(1)));

        curve.forEach(piece => {
            piece.forEach(point => {
                this.state.ctx.lineTo(point[0], point[1]);
            });
        });

        // complete the filled graph
        this.state.ctx.lineTo(this.pixX(points.last().get(0)), this.pixY(points.last().get(1)));
        this.state.ctx.lineTo(this.pixX(points.last().get(0)), this.pixY(0));
        this.state.ctx.lineTo(this.pixX(points.first().get(0)), this.pixY(points.first().get(1)));

        this.state.ctx.fill();
        this.state.ctx.closePath();
    }

    if (options.stroke) {
        this.drawCubicLineCurve(curve, points, color);
    }
};

const drawLine = (points, color) => {
    if (points.size < 2) {
        return;
    }
    const dynamicColor = typeof color === 'function';
    let theColor = dynamicColor
        ? color(points.getIn([0, 1]))
        : color;

    let newColor = null;
    let moved = false;
    this.state.ctx.beginPath();
    points.forEach(point => {
        const xPix = this.pixX(point.first());
        const yPix = this.pixY(point.last());

        if (moved) {
            this.state.ctx.lineTo(xPix, yPix);
            if (dynamicColor) {
                newColor = color(point.last());
                if (newColor !== theColor) {
                    this.state.ctx.strokeStyle = theColor;
                    this.state.ctx.stroke();
                    this.state.ctx.closePath();
                    this.state.ctx.beginPath();
                    this.state.ctx.moveTo(xPix, yPix);
                    theColor = newColor;
                }
            }
        }
        else {
            this.state.ctx.moveTo(xPix, yPix);
            moved = true;
        }
    });

    this.state.ctx.strokeStyle = theColor;
    this.state.ctx.stroke();
    if (this.props.fill) {
        this.state.ctx.lineTo(this.pixX(points.last().first(), this.pixY(0)));
        this.state.ctx.lineTo(this.pixX(points.first().first(), this.pixY(0)));
        this.state.ctx.fillStyle = theColor;
        this.state.ctx.fill();
    }
    this.state.ctx.closePath();
};
*/

const genPixXY = (data, pixX, pixY) => index => ([
    Math.round(pixX(data.getIn([index, 0]))),
    Math.round(pixY(data.getIn([index, 1])))
].join(' '));

function getLinePath({ width, height, data, fill, pixX, pixY }) {
    const pixXY = genPixXY(data, pixX, pixY);

    const initial = `M${pixXY(0)}`;

    const line = data.slice(1)
        .reduce((components, point, index) => ([
            ...components, `L${pixXY(index + 1)}`
        ]), [initial]);

    if (fill) {
        return line.concat([`L${width} ${height}`])
            .join(' ');
    }

    return line.join(' ');
}

function getLinePathsDynamic({ data, color, pixX, pixY }) {
    const pixXY = genPixXY(data, pixX, pixY);

    if (data.size < 2) {
        return [{ color: color(data.get(0), 0), path: `L${pixXY(0)}` }];
    }

    return data.reduce(({ paths, currentPath, lastColor }, point, index) => {
        if (index === data.size - 1) {
            return [...paths, {
                stroke: lastColor,
                path: `${currentPath} L${pixXY(index)}`
            }];
        }

        const nextColor = color(point, index);

        if (index > 0 && nextColor === lastColor) {
            return {
                paths,
                currentPath: `${currentPath} L${pixXY(index)}`,
                lastColor
            };
        }

        const beginPath = index > 0
            ? `M${pixXY(index - 1)} L${pixXY(index)}`
            : `M${pixXY(index)}`;

        return {
            paths: [...paths, { stroke: lastColor, path: currentPath }],
            currentPath: beginPath,
            lastColor: nextColor
        };
    }, { paths: [] });
}

function RenderedLine({ data, color, fill, ...props }) {
    if (!data.size) {
        return null;
    }

    if (typeof color === 'function') {
        if (fill) {
            throw new Error('Dynamically coloured, filled graph not implemented');
        }

        const linePaths = getLinePathsDynamic({ data, color, ...props });

        const paths = linePaths.map(({ path, stroke }, key) => (
            <path key={key} d={path} stroke={stroke} strokeWidth={2} fill="none" />
        ));

        return <g>{paths}</g>;
    }

    const linePath = getLinePath({ data, fill, ...props });

    const fillStyle = fill
        ? color
        : 'none';

    const strokeStyle = fill
        ? 'none'
        : color;

    return <path d={linePath} stroke={strokeStyle} strokeWidth={2} fill={fillStyle} />;
}

RenderedLine.propTypes = {
    data: PropTypes.instanceOf(list).isRequired,
    color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]).isRequired,
    fill: PropTypes.bool,
    cubic: PropTypes.bool,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    valX: PropTypes.func.isRequired,
    valY: PropTypes.func.isRequired
};

export const genPixelCompute = props => {
    const {
        minX,
        maxX,
        minY,
        maxY,
        width,
        height,
        padding: [padTop, padRight, padBottom, padLeft]
    } = props;

    return {
        pixX: value =>
            padLeft + (value - minX) / (maxX - minX) * (width - padLeft - padRight),
        pixY: value =>
            height - padBottom - (value - minY) / (maxY - minY) * (height - padTop - padBottom),
        valX: pix =>
            (pix - padLeft) * (maxX - minX) / (width - padLeft - padRight) + minX,
        valY: pix =>
            (height - padBottom - pix) * (maxY - minY) / (height - padTop - padBottom) + minY
    };
};

export default function LineGraph({ lines, width, height, ...props }) {
    const pixelCompute = genPixelCompute({
        padding: [0, 0, 0, 0],
        width,
        height,
        ...props
    });

    const renderedLines = lines.map(({ key, ...line }) => (
        <RenderedLine
            key={key}
            width={width}
            height={height}
            {...line}
            {...pixelCompute}
        />
    ));

    return (
        <Graph width={width} height={height} {...props}>
            {renderedLines}
        </Graph>
    );
}

LineGraph.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    lines: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        data: PropTypes.instanceOf(list).isRequired,
        color: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func
        ]).isRequired,
        fill: PropTypes.bool,
        cubic: PropTypes.bool
    })).isRequired,
    minX: PropTypes.number,
    maxX: PropTypes.number,
    minY: PropTypes.number,
    maxY: PropTypes.number
};

