import { GRAPH_CURVINESS } from '~client/constants/graph';
import { timeSeriesTicks } from '~client/modules/date';

export const genPixelCompute = (props) => {
    const {
        minX,
        maxX,
        minY,
        maxY,
        width,
        height,
        padding: [padTop, padRight, padBottom, padLeft],
    } = props;

    return {
        pixX: (value) => padLeft + ((value - minX) / (maxX - minX)) * (width - padLeft - padRight),
        pixY: (value) => height - padBottom - ((value - minY) / (maxY - minY)) * (height - padTop - padBottom),
        valX: (pix) => (pix - padLeft) * ((maxX - minX) / (width - padLeft - padRight)) + minX,
        valY: (pix) => (height - padBottom - pix) * ((maxY - minY) / (height - padTop - padBottom)) + minY,
    };
};

export const getTimeScale = ({ minX, maxX, pixX }) => (offset) => {
    // divides the time axis (horizontal) into appropriate chunks
    const ticks = timeSeriesTicks(offset + minX, offset + maxX);

    if (ticks) {
        return ticks.map((tick) => ({
            major: tick.major,
            pix: Math.floor(pixX(tick.time - offset)) + 0.5,
            text: tick.label || null,
        }));
    }

    return [];
};

function getControlPointsAtPoint([x0, y0], [x1, y1], [x2, y2]) {
    const distLeft = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5;
    const distRight = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5;

    const controlFactor0 = GRAPH_CURVINESS * (distLeft / (distLeft + distRight));
    const controlFactor1 = GRAPH_CURVINESS - controlFactor0;

    const controlX0 = Math.round(x1 - controlFactor0 * (x2 - x0));
    const controlY0 = Math.round(y1 - controlFactor0 * (y2 - y0));

    const controlX1 = Math.round(x1 + controlFactor1 * (x2 - x0));
    const controlY1 = Math.round(y1 + controlFactor1 * (y2 - y0));

    return [[controlX0, controlY0], [controlX1, controlY1]];
}

export function getControlPoints(data) {
    return data.map((point, index) => {
        if (index === 0 || index === data.length - 1) {
            return null;
        }

        return getControlPointsAtPoint(
            data[index - 1],
            point,
            data[index + 1],
        );
    });
}

export function getLinePath({
    width, height, data, smooth, fill, pixX, pixY,
}) {
    const getPixPoint = ([xValue, yValue]) => ([pixX(xValue), pixY(yValue)]);
    const pixelsNumeric = data.map(getPixPoint);
    const pixels = pixelsNumeric.map((point) => point.map((value) => value.toFixed(1)));

    let line = null;

    if (smooth && pixels.length > 2) {
        const controlPoints = getControlPoints(pixelsNumeric);

        line = pixels.slice(0, pixels.length - 1)
            .map((point, index) => {
                if (index === 0) {
                    return {
                        start: point,
                        type: 'Q',
                        args: [controlPoints[index + 1][0], pixels[index + 1]],
                    };
                }
                if (index === pixels.length - 2) {
                    return {
                        start: point,
                        type: 'Q',
                        args: [
                            controlPoints[index][1],
                            pixels[index + 1],
                        ],
                    };
                }

                return {
                    start: point,
                    type: 'C',
                    args: [
                        controlPoints[index][1],
                        controlPoints[index + 1][0],
                        pixels[index + 1],
                    ],
                };
            });
    } else {
        line = pixels.slice(1)
            .map((point, index) => ({
                start: pixels[index],
                type: 'L',
                args: [point],
            }));
    }
    if (fill) {
        return line.concat([
            {
                start: pixels[pixels.length - 1],
                type: 'L',
                args: [[width, height]],
            },
            {
                start: [width, height],
                type: 'L',
                args: [[pixels[0][0], height]],
            },
        ]);
    }

    return line;
}

export function getLinePathPart(linePath) {
    if (linePath.length < 1) {
        return '';
    }

    const parts = linePath.map(({ type, args }) => `${type}${args.map((point) => point.join(',')).join(' ')}`);

    const [{ start }] = linePath;

    return `M${start.join(',')} ${parts.join(' ')}`;
}

export const getSingleLinePath = (props) => getLinePathPart(getLinePath(props));

export function getPathProps({ strokeWidth = 2, dashed = false }) {
    if (dashed) {
        return { strokeWidth, strokeDasharray: '3,5' };
    }

    return { strokeWidth };
}

export const joinChoppedPath = (linePath, ends, color) => ends.slice(1)
    .concat([linePath.length])
    .map((end, endIndex) => ({
        path: getLinePathPart(linePath.slice(ends[endIndex], end)),
        stroke: color(end, endIndex),
    }))
    .filter(({ path }) => path.length);

export function getDynamicLinePathsStop({
    data, color, smooth, pixX, pixY,
}) {
    const { changes, values } = color;

    const getColorIndex = (value) => changes.reduce((last, change, index) => {
        if (value >= change) {
            return index + 1;
        }

        return last;
    }, 0);

    const [items, ends] = data.slice(1)
        .reduce(([lastItems, lastEnds, lastColorIndex], point, index) => {
            const colorIndex = getColorIndex(point[1]);

            if (colorIndex !== lastColorIndex) {
                // linearly interpolate to the cut off value between the two points
                const pointBetween = [
                    (point[0] + data[index][0]) / 2,
                    changes[Math.min(colorIndex, lastColorIndex)],
                ];

                return [
                    lastItems.concat([pointBetween, point]),
                    lastEnds.concat([lastItems.length]),
                    colorIndex,
                ];
            }

            return [
                lastItems.concat([point]),
                lastEnds,
                colorIndex,
            ];
        }, [
            data.slice(0, 1),
            [0],
            getColorIndex(data[0][1]),
        ]);

    const linePath = getLinePath({
        data: items, smooth, pixX, pixY,
    });

    return joinChoppedPath(linePath, ends, (end) => values[getColorIndex(items[end - 1][1])]);
}

export function getDynamicLinePaths({
    data, color, smooth, pixX, pixY,
}) {
    if (data.length < 2) {
        return null;
    }

    if (typeof color === 'object') {
        return getDynamicLinePathsStop({
            data, color, smooth, pixX, pixY,
        });
    }

    const linePath = getLinePath({
        data, smooth, pixX, pixY,
    });

    const colors = data.map((point, index) => color(point, index));
    const ends = colors.reduce((indexes, value, index) => {
        const next = index === colors.length - 1
            || (index > 0 && colors[index - 1] !== value);

        if (next) {
            return [...indexes, index];
        }

        return indexes;
    }, [0]);

    return joinChoppedPath(linePath, ends, (end, endIndex) => colors[ends[endIndex]]);
}

export const pointVisible = (valX, minX, maxX) => valX >= minX && valX <= maxX;
