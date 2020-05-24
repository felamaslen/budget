import { replaceAtIndex } from 'replace-array';

import { GRAPH_CURVINESS } from '~client/constants/graph';
import { timeSeriesTicks } from '~client/modules/date';
import { colors } from '~client/styled/variables';
import { Page } from '~client/types';
import {
  Dimensions,
  Padding,
  Calc,
  PixX,
  PixY,
  Pix,
  ValY,
  RangeX,
  Point,
  Data,
  PathProps,
  SVGPathProps,
  Tick,
  DynamicLineColor,
  ColorSwitcher,
} from '~client/types/graph';

type SVGNumber = number | string;
type SVGPoint = [SVGNumber, SVGNumber];

type LinePoint = {
  start: SVGPoint;
  type: 'L' | 'M' | 'Q' | 'C';
  args: SVGPoint[];
};

type LineDescription = LinePoint[];

export const defaultPadding: Padding = [0, 0, 0, 0];

export const genPixelCompute = (dimensions: Dimensions): Calc => {
  const {
    minX,
    maxX,
    minY,
    maxY,
    minY2 = minY,
    maxY2 = maxY,
    width,
    height,
    padding: [padTop, padRight, padBottom, padLeft] = defaultPadding,
  } = dimensions;

  return {
    pixX: (value: number): number =>
      padLeft + ((value - minX) / (maxX - minX)) * (width - padLeft - padRight),
    pixY1: (value: number): number =>
      height - padBottom - ((value - minY) / (maxY - minY)) * (height - padTop - padBottom),
    pixY2: (value: number): number =>
      height - padBottom - ((value - minY2) / (maxY2 - minY2)) * (height - padTop - padBottom),
    valX: (pix: number): number =>
      (pix - padLeft) * ((maxX - minX) / (width - padLeft - padRight)) + minX,
    valY1: (pix: number): number =>
      ((height - padBottom - pix) * (maxY - minY)) / (height - padTop - padBottom) + minY,
    valY2: (pix: number): number =>
      ((height - padBottom - pix) * (maxY2 - minY2)) / (height - padTop - padBottom) + minY2,
  };
};

export const getPixY = (calc: PixY, secondary = false): ((value: number) => number) =>
  secondary ? calc.pixY2 : calc.pixY1;

export const getValY = (calc: ValY, secondary = false): ((value: number) => number) =>
  secondary ? calc.valY2 : calc.valY1;

// divides the time axis (horizontal) into appropriate chunks
export const getTimeScale = ({ minX, maxX, pixX }: RangeX & PixX): ((offset: number) => Tick[]) => (
  offset = 0,
): Tick[] =>
  timeSeriesTicks(offset + minX, offset + maxX)
    .map(
      (tick): Tick => ({
        major: tick.major,
        pix: Math.floor(pixX(tick.time - offset)) + 0.5,
        text: tick.label,
      }),
    )
    .reduce((last: Tick[], tick: Tick): Tick[] => {
      const samePixIndex = last.findIndex(({ pix }) => pix === tick.pix);
      if (samePixIndex === -1) {
        return [...last, tick];
      }
      if (last[samePixIndex].major >= tick.major) {
        return last;
      }
      return replaceAtIndex(last, samePixIndex, tick);
    }, []);

type ControlPoint = [Point, Point];

function getControlPointsAtPoint([x0, y0]: Point, [x1, y1]: Point, [x2, y2]: Point): ControlPoint {
  const distLeft = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5;
  const distRight = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5;

  const controlFactor0 = GRAPH_CURVINESS * (distLeft / (distLeft + distRight));
  const controlFactor1 = GRAPH_CURVINESS - controlFactor0;

  const controlX0 = Math.round(x1 - controlFactor0 * (x2 - x0));
  const controlY0 = Math.round(y1 - controlFactor0 * (y2 - y0));

  const controlX1 = Math.round(x1 + controlFactor1 * (x2 - x0));
  const controlY1 = Math.round(y1 + controlFactor1 * (y2 - y0));

  return [
    [controlX0, controlY0],
    [controlX1, controlY1],
  ];
}

const nullControlPoint: ControlPoint = [
  [0, 0],
  [0, 0],
];

export function getControlPoints(data: Data): ControlPoint[] {
  return data.map((point, index) => {
    if (index === 0 || index === data.length - 1) {
      return nullControlPoint;
    }

    return getControlPointsAtPoint(data[index - 1], point, data[index + 1]);
  });
}

type LineProps = Pix & {
  width?: number;
  height?: number;
  data: Data;
  stack?: Data;
  secondary?: boolean;
  smooth?: boolean;
  fill?: boolean;
};

function getSmoothLinePart(pixels: Data, pixelsRounded: SVGPoint[]): LineDescription {
  const controlPoints = getControlPoints(pixels);

  return pixels.slice(0, pixels.length - 1).map((point: SVGPoint, index: number) => {
    if (index === 0) {
      return {
        start: point,
        type: 'Q',
        args: [controlPoints[index + 1][0], pixelsRounded[index + 1]],
      };
    }
    if (index === pixels.length - 2) {
      return {
        start: point,
        type: 'Q',
        args: [controlPoints[index][1], pixelsRounded[index + 1]],
      };
    }

    return {
      start: point,
      type: 'C',
      args: [controlPoints[index][1], controlPoints[index + 1][0], pixelsRounded[index + 1]],
    };
  });
}

type GetPixPoint = (point: Point) => Point;

function getLinePathPart(pixels: Data, smooth = false): LineDescription {
  const pixelsRounded = pixels.map(([x, y]: Point): SVGPoint => [x.toFixed(1), y.toFixed(1)]);

  if (smooth && pixels.length > 2) {
    return getSmoothLinePart(pixels, pixelsRounded);
  }

  return pixelsRounded.slice(1).map((point, index) => ({
    start: pixelsRounded[index],
    type: 'L',
    args: [point],
  }));
}

export function getLinePath({
  width = 0,
  height = 0,
  data,
  stack,
  secondary,
  smooth,
  fill,
  pixX,
  pixY1,
  pixY2,
}: LineProps): LineDescription {
  const pixY = getPixY({ pixY1, pixY2 }, secondary);
  const getPixPoint: GetPixPoint = ([xValue, yValue]: Point): Point => [pixX(xValue), pixY(yValue)];
  const dataStacked: Data = stack
    ? data.map(([xValue, yValue], index) => [xValue, yValue + stack[index][1]])
    : data;
  const pixels: Data = dataStacked.map(getPixPoint);
  const line = getLinePathPart(pixels, smooth);

  if (fill) {
    if (stack) {
      const pixelsStack: Data = stack.map(getPixPoint);
      const lineStack = getLinePathPart(pixelsStack.reverse(), smooth);

      return [
        ...line,
        {
          start: pixels[pixels.length - 1],
          type: 'L',
          args: [[pixelsStack[0][0].toFixed(1), pixelsStack[0][1].toFixed(1)]],
        },
        ...lineStack,
      ];
    }

    return [
      ...line,
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
    ];
  }

  return line;
}

export function joinLinePath(linePath: LineDescription): string {
  if (linePath.length < 1) {
    return '';
  }

  const parts = linePath.map(
    ({ type, args }) => `${type}${args.map((point) => point.join(',')).join(' ')}`,
  );

  const [{ start }] = linePath;

  return `M${start.join(',')} ${parts.join(' ')}`;
}

export const getSingleLinePath = (props: LineProps): string => joinLinePath(getLinePath(props));

export function getPathProps({ strokeWidth = 2, dashed = false }: PathProps): SVGPathProps {
  if (dashed) {
    return { strokeWidth, strokeDasharray: '3,5' };
  }

  return { strokeWidth };
}

type JoinedPath = {
  path: string;
  stroke: string;
}[];

export const joinChoppedPath = (
  linePath: LineDescription,
  ends: number[],
  color: (end: number, endIndex: number) => string,
): JoinedPath =>
  ends
    .slice(1)
    .concat([linePath.length])
    .map((end, endIndex) => ({
      path: joinLinePath(linePath.slice(ends[endIndex], end)),
      stroke: color(end, endIndex),
    }))
    .filter(({ path }) => path.length);

type DynamicLine<C = DynamicLineColor> = Pix & {
  data: Data;
  secondary?: boolean;
  color: C;
  smooth?: boolean;
};

export function getDynamicLinePathsStop({
  data,
  secondary,
  color,
  smooth,
  pixX,
  pixY1,
  pixY2,
}: DynamicLine<ColorSwitcher>): JoinedPath {
  const { changes, values } = color;

  const getColorIndex = (value: number): number =>
    changes.reduce((last: number, change: number, index: number): number => {
      if (value >= change) {
        return index + 1;
      }

      return last;
    }, 0);

  const [items, ends] = data.slice(1).reduce(
    ([lastItems, lastEnds, lastColorIndex], point, index) => {
      const colorIndex = getColorIndex(point[1]);

      if (colorIndex !== lastColorIndex) {
        // linearly interpolate to the cut off value between the two points
        const pointBetween: Point = [
          (point[0] + data[index][0]) / 2,
          changes[Math.min(colorIndex, lastColorIndex)],
        ];

        return [
          lastItems.concat([pointBetween, point]),
          lastEnds.concat([lastItems.length]),
          colorIndex,
        ];
      }

      return [lastItems.concat([point]), lastEnds, colorIndex];
    },
    [data.slice(0, 1), [0], getColorIndex(data[0][1])],
  );

  const linePath = getLinePath({
    data: items,
    secondary,
    smooth,
    pixX,
    pixY1,
    pixY2,
  });

  return joinChoppedPath(linePath, ends, (end) => values[getColorIndex(items[end - 1][1])]);
}

export function getDynamicLinePaths({
  data,
  secondary,
  color,
  smooth,
  pixX,
  pixY1,
  pixY2,
}: DynamicLine): JoinedPath {
  if (data.length < 2) {
    return [];
  }

  if (typeof color === 'object') {
    return getDynamicLinePathsStop({
      data,
      secondary,
      color,
      smooth,
      pixX,
      pixY1,
      pixY2,
    });
  }

  const linePath = getLinePath({
    data,
    secondary,
    smooth,
    pixX,
    pixY1,
    pixY2,
  });

  const dataColors = data.map((point, index) => color(point, index));
  const ends = dataColors.reduce<number[]>(
    (indexes, value, index) => {
      const next = index === dataColors.length - 1 || (index > 0 && colors[index - 1] !== value);

      if (next) {
        return [...indexes, index];
      }

      return indexes;
    },
    [0],
  );

  return joinChoppedPath(linePath, ends, (_, endIndex) => dataColors[ends[endIndex]]);
}

export const pointVisible = (valX: number, minX: number, maxX: number): boolean =>
  valX >= minX && valX <= maxX;

export const profitLossColor = ([, value]: Point): string =>
  value < 0 ? colors[Page.funds].loss : colors[Page.funds].profit;
