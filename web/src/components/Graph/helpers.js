import { List as list } from 'immutable';
import { GRAPH_CURVINESS } from '../../constants/graph';
import { timeSeriesTicks } from '../../helpers/date';

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
        minX,
        maxX,
        minY,
        maxY,
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

export function getControlPoints(data) {
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

export function getLinePath({ width, height, data, smooth, fill, pixX, pixY }) {
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
        return line
            .push({
                start: pixels.last(),
                type: 'L',
                args: [list.of(width, height)]
            })
            .push({
                start: list.of(width, height),
                type: 'L',
                args: [pixels.first().set(1, height)]
            });
    }

    return line;
}

export function getLinePathPart(linePath) {
    if (linePath.size < 1) {
        return '';
    }

    const parts = linePath.map(({ type, args }) =>
        `${type}${args.map(point => point.join(',')).join(' ')}`);

    const start = linePath.get(0).start;

    return `M${start.join(',')} ${parts.join(' ')}`;
}

export function getSingleLinePath(props) {
    return getLinePathPart(getLinePath(props));
}

export function getPathProps(line) {
    const common = {
        strokeWidth: line.get('strokeWidth') || 2
    };

    if (line.get('dashed')) {
        return { ...common, strokeDasharray: '3,5' };
    }

    return common;
}

export function joinChoppedPath(linePath, ends, color) {
    return [...ends.slice(1), linePath.size].map((end, endIndex) => ({
        path: getLinePathPart(linePath.slice(ends[endIndex], end)),
        stroke: color(end, endIndex)
    }))
        .filter(({ path }) => path.length);
}

export function getDynamicLinePathsStop({ data, color, smooth, pixX, pixY }) {
    const { changes, values } = color;

    const getColorIndex = value => changes.reduce((last, change, index) => {
        if (value >= change) {
            return index + 1;
        }

        return last;
    }, 0);

    const stops = data.slice(1)
        .reduce(({ items, ends, colorIndexA }, point, index) => {
            const colorIndexB = getColorIndex(point.get(1));

            if (colorIndexB !== colorIndexA) {
                // linearly interpolate to the cut off value between the two points
                const pointBetween = list.of(
                    (point.get(0) + data.getIn([index, 0])) / 2,
                    changes[Math.min(colorIndexA, colorIndexB)]
                );

                return {
                    items: items.concat(list.of(pointBetween, point)),
                    ends: [...ends, items.size],
                    colorIndexA: colorIndexB
                };
            }

            return {
                items: items.push(point),
                ends,
                colorIndexA: colorIndexB
            };

        }, {
            items: data.slice(0, 1),
            ends: [0],
            colorIndexA: getColorIndex(data.getIn([0, 1]))
        });

    const { items, ends } = stops;

    const linePath = getLinePath({ data: items, smooth, pixX, pixY });

    return joinChoppedPath(linePath, ends,
        end => values[getColorIndex(items.getIn([end - 1, 1]))]);
}

export function getDynamicLinePaths({ data, color, smooth, pixX, pixY }) {
    if (data.size < 2) {
        return null;
    }

    if (typeof color === 'object') {
        return getDynamicLinePathsStop({ data, color, smooth, pixX, pixY });
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

    return joinChoppedPath(linePath, ends, (end, endIndex) => colors.get(ends[endIndex]));
}

