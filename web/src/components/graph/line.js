/**
 * React component to display a line graph (e.g. time series)
 */

import { List as list } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import Graph from '.';
import ArrowLine from './arrows';
import { timeSeriesTicks } from '../../helpers/date';
import { listAverage } from '../../helpers/data';
import { rgba } from '../../helpers/color';
import { GRAPH_CURVINESS } from '../../constants/graph';
import { COLOR_LIGHT_GREY } from '../../constants/colors';

export const getTimeScale = ({ minX, maxX, pixX }) => offset => {
    // divides the time axis (horizontal) into appropriate chunks
    const ticks = timeSeriesTicks(offset + minX, offset + maxX);

    if (ticks) {
        return ticks.map(tick => ({
            major: tick.major,
            pix: Math.floor(pixX(tick.time - offset)) + 0.5,
            text: tick.label || null
        }));
    }

    return [];
};

function getControlPointsAtPoint([x0, y0], [x1, y1], [x2, y2]) {
    const distLeft = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5;
    const distRight = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5;

    const controlFactor0 = GRAPH_CURVINESS * distLeft / (distLeft + distRight);
    const controlFactor1 = GRAPH_CURVINESS - controlFactor0;

    const controlX0 = Math.round(x1 - controlFactor0 * (x2 - x0));
    const controlY0 = Math.round(y1 - controlFactor0 * (y2 - y0));

    const controlX1 = Math.round(x1 + controlFactor1 * (x2 - x0));
    const controlY1 = Math.round(y1 + controlFactor1 * (y2 - y0));

    return list.of(list.of(controlX0, controlY0), list.of(controlX1, controlY1));
}

function getControlPoints(data) {
    return data.map((point, index) => {
        if (index === 0 || index === data.size - 1) {
            return null;
        }

        return getControlPointsAtPoint(
            data.get(index - 1),
            point,
            data.get(index + 1)
        );
    });
}

function getLinePath({ width, height, data, smooth, fill, pixX, pixY }) {
    const getPixPoint = point => list.of(pixX(point.get(0)), pixY(point.get(1)));

    const pixelsNumeric = data.map(point => getPixPoint(point));
    const pixels = pixelsNumeric.map(point => point.map(value => value.toFixed(1)));

    let line = null;

    if (smooth && pixels.size > 2) {
        const controlPoints = getControlPoints(pixelsNumeric);

        line = pixels.slice(0, pixels.size - 1)
            .map((point, index) => {
                if (index === 0) {
                    return {
                        start: point,
                        type: 'Q',
                        args: [controlPoints.getIn([index + 1, 0]), pixels.get(index + 1)]
                    };
                }
                if (index === pixels.size - 2) {
                    return {
                        start: point,
                        type: 'Q',
                        args: [
                            controlPoints.getIn([index, 1]),
                            pixels.get(index + 1)
                        ]
                    };
                }

                return {
                    start: point,
                    type: 'C',
                    args: [
                        controlPoints.getIn([index, 1]),
                        controlPoints.getIn([index + 1, 0]),
                        pixels.get(index + 1)
                    ]
                };

            });
    }
    else {
        line = pixels.slice(1)
            .map((point, index) => ({
                start: pixels.get(index),
                type: 'L',
                args: [point]
            }));
    }

    if (fill) {
        return line.concat({
            start: pixels.last(),
            type: 'L',
            args: [list.of(width, height)]
        });
    }

    return line;
}

function getLinePathPart(linePath) {
    if (linePath.size < 1) {
        return '';
    }

    const parts = linePath.map(({ type, args }) =>
        `${type}${args.map(point => point.join(',')).join(' ')}`);

    const start = linePath.get(0).start;

    return `M${start.join(',')} ${parts.join(' ')}`;
}

function getSingleLinePath(props) {
    return getLinePathPart(getLinePath(props));
}

function getDynamicLinePaths({ data, color, smooth, pixX, pixY }) {
    if (data.size < 2) {
        return null;
    }

    const linePath = getLinePath({ data, smooth, pixX, pixY });

    const colors = data.map((point, index) => color(point, index));
    const ends = colors.reduce((indexes, value, index) => {
        const next = index === colors.size - 1 ||
            (index > 0 && colors.get(index - 1) !== value);

        if (next) {
            return [...indexes, index];
        }

        return indexes;

    }, [0]);

    return ends.slice(1)
        .map((end, endIndex) => ({
            path: getLinePathPart(linePath.slice(ends[endIndex], end)),
            stroke: colors.get(ends[endIndex])
        }))
        .filter(({ path }) => path.length);
}

function RenderedLine({ data, smooth, arrows, color, fill, movingAverage, ...props }) {
    if (!data.size) {
        return null;
    }

    if (arrows) {
        return <ArrowLine data={data} color={color} {...props} />;
    }

    let averageLine = null;
    if (movingAverage) {
        const averageData = data.reduce(({ last, points }, point) => {
            const nextLast = last.slice(1 - movingAverage).push(point.get(1));
            const average = listAverage(nextLast);

            return { last: nextLast, points: points.push(point.set(1, average)) };

        }, { last: list.of(), points: list.of() })
            .points;

        const averageLinePath = getSingleLinePath({
            ...props, data: averageData, smooth: true, fill: false
        });

        averageLine = (
            <path d={averageLinePath}
                stroke={rgba(COLOR_LIGHT_GREY)}
                strokeDasharray="3,5"
                strokeWidth={1}
                fill="none"
            />
        );
    }

    if (typeof color === 'function') {
        if (fill) {
            throw new Error('Dynamically coloured, filled graph not implemented');
        }

        const linePaths = getDynamicLinePaths({ data, smooth, color, ...props });

        const paths = linePaths.map(({ path, stroke }, key) => (
            <path key={key} d={path} stroke={stroke} strokeWidth={props.strokeWidth || 2} fill="none" />
        ));

        return <g className="lines">{averageLine}{paths}</g>;
    }

    const linePath = getSingleLinePath({ data, smooth, fill, ...props });

    const fillStyle = fill
        ? color
        : 'none';

    const strokeStyle = fill
        ? 'none'
        : color;

    return <g className="line">
        <path d={linePath} stroke={strokeStyle} strokeWidth={props.strokeWidth || 2} fill={fillStyle} />
        {averageLine}
    </g>;
}

RenderedLine.propTypes = {
    data: PropTypes.instanceOf(list).isRequired,
    color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]).isRequired,
    strokeWidth: PropTypes.number,
    fill: PropTypes.bool,
    smooth: PropTypes.bool,
    movingAverage: PropTypes.number,
    arrows: PropTypes.bool,
    pixX: PropTypes.func.isRequired,
    pixY: PropTypes.func.isRequired,
    valX: PropTypes.func.isRequired,
    valY: PropTypes.func.isRequired
};

const genPixelCompute = props => {
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

export default function LineGraph({ lines, width, height, beforeLines, afterLines, ...props }) {
    const pixelCompute = genPixelCompute({
        padding: [0, 0, 0, 0],
        width,
        height,
        ...props
    });

    const subProps = {
        width,
        height,
        ...props,
        ...pixelCompute
    };

    const renderedLines = lines.map(({ key, ...line }) => (
        <RenderedLine
            key={key}
            width={width}
            height={height}
            {...line}
            {...pixelCompute}
            {...props}
        />
    ));

    return (
        <Graph width={width} height={height} {...props} {...pixelCompute}>
            {beforeLines && beforeLines(subProps)}
            {renderedLines}
            {afterLines && afterLines(subProps)}
        </Graph>
    );
}

LineGraph.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    beforeLines: PropTypes.func,
    afterLines: PropTypes.func,
    before: PropTypes.object,
    after: PropTypes.object,
    lines: PropTypes.array.isRequired,
    minX: PropTypes.number,
    maxX: PropTypes.number,
    minY: PropTypes.number,
    maxY: PropTypes.number,
    children: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ])
};

