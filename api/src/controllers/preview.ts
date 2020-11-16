import path from 'path';
import * as boom from '@hapi/boom';
import { createCanvas, registerFont } from 'canvas';
import {
  startOfDay,
  setYear,
  setMonth,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  getUnixTime,
  isSameDay,
  addDays,
  format,
} from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import { capitalise } from '~api/modules/capitalise';
import { getPreviewRows, PreviewRow } from '~api/queries';
import { ListCalcCategory } from '~api/types';

type Padding = [number, number, number, number];

type DataPoint = { x: number; y: number };

type Pix = {
  x: (value: number) => number;
  y: (value: number) => number;
};

export type Query = {
  width: number;
  height: number;
  scale: 1 | 2 | 3;
  year: number;
  month: number;
  category: ListCalcCategory;
};

type GraphProps = Query & {
  startDate: Date;
  endDate: Date;
  width: number;
  height: number;
  padding: Padding;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  line: DataPoint[];
  pix: Pix;
};

const PADDING: Padding = [0, 0, 40, 40];

const colors = {
  line: 'rgb(0, 0, 0)',
  title: 'rgb(0, 0, 0)',
  ticks: 'rgb(60, 60, 60)',
};

const roundPix = (pix: number): number => Math.ceil(pix) - 0.5;

const getPix = ({
  width,
  height,
  padding,
  minX,
  maxX,
  minY,
  maxY,
}: Omit<GraphProps, 'pix'>): Pix => ({
  x: (value: number): number =>
    padding[3] + ((width - padding[1] - padding[3]) * (value - minX)) / (maxX - minX),
  y: (value: number): number =>
    padding[0] + (height - padding[2] - padding[0]) * (1 - (value - minY) / (maxY - minY)),
});

function getChartRows(startDate: Date, numDays: number, rows: readonly PreviewRow[]): DataPoint[] {
  return Array(numDays)
    .fill(0)
    .map<Date>((_, index) => startOfDay(addDays(startDate, index)))
    .reduce<DataPoint[]>(
      (last, date) => [
        ...last,
        {
          x: getUnixTime(date),
          y:
            (last[last.length - 1]?.y ?? 0) +
            (rows.find((row) => isSameDay(new Date(row.date), date))?.value ?? 0),
        },
      ],
      [],
    );
}

function drawData(
  ctx: CanvasRenderingContext2D,
  { pix, line }: Pick<GraphProps, 'pix' | 'line'>,
): void {
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 2;

  ctx.beginPath();

  const pixPoints = line.map<DataPoint>(({ x, y }) => ({
    x: pix.x(x),
    y: pix.y(y),
  }));

  pixPoints.forEach(({ x, y }) => {
    ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function drawTitle(ctx: CanvasRenderingContext2D, graph: GraphProps): void {
  const title = `${format(graph.startDate, 'LLLL yyyy')} - ${capitalise(graph.category)}`;

  ctx.font = 'bold bold 10px OpenSans';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = colors.title;
  ctx.fillText(title, graph.width / 2, graph.height);
}

const fontAxis = 'normal normal 12px OpenSans';

function drawTimeAxis(ctx: CanvasRenderingContext2D, graph: GraphProps): void {
  ctx.font = fontAxis;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.title;
  ctx.strokeStyle = colors.ticks;
  ctx.lineWidth = 1;

  graph.line.forEach(({ x }, index) => {
    const pixX = roundPix(graph.pix.x(x));
    const majorTick = index === 0 || (index + 1) % 5 === 0;
    const tickSize = majorTick ? 7 : 3;

    ctx.beginPath();
    ctx.lineTo(pixX, graph.height - graph.padding[2]);
    ctx.lineTo(pixX, graph.height - graph.padding[2] + tickSize);
    ctx.stroke();

    if (majorTick) {
      const text = format(addDays(graph.startDate, index), 'd');
      ctx.fillText(text, pixX, graph.height - graph.padding[2] + tickSize + 1);
    }
  });

  const pixMinY = roundPix(graph.pix.y(graph.minY));

  ctx.beginPath();
  ctx.lineTo(graph.pix.x(graph.minX) - 0.5, pixMinY);
  ctx.lineTo(graph.pix.x(graph.maxX), pixMinY);
  ctx.stroke();
}

function getTickInterval(graph: Pick<GraphProps, 'minY' | 'maxY'>, numTicks = 10): number {
  const minTickSize = (graph.maxY - graph.minY) / numTicks;
  const magnitude = 10 ** Math.floor(Math.log10(minTickSize));
  const res = minTickSize / magnitude;
  if (res > 5) {
    return 10 * magnitude;
  }
  if (res > 2) {
    return 5 * magnitude;
  }
  if (res > 1) {
    return 2 * magnitude;
  }
  return magnitude;
}

function getCurrencyValueRaw(absValue: number, log: number): string {
  if (log > 0) {
    const measure = absValue / 10 ** (log * 3);
    return String((measure * 10) / 10);
  }
  return absValue.toFixed();
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value) / 100;
  const abbr = ['k', 'm', 'bn', 'tn'];
  const log = value !== 0 ? Math.min(Math.floor(Math.log10(absValue) / 3), abbr.length) : 0;
  const abbreviation = log > 0 ? abbr[log - 1] : '';
  const valueRaw = getCurrencyValueRaw(absValue, log);
  return value < 0 ? `(£${valueRaw}${abbreviation})` : `£${valueRaw}${abbreviation}`;
}

function drawValueAxis(ctx: CanvasRenderingContext2D, graph: GraphProps): void {
  ctx.font = fontAxis;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.title;
  ctx.strokeStyle = colors.ticks;
  ctx.lineWidth = 1;

  const tickInterval = getTickInterval(graph);
  const minTickY = Math.ceil(graph.minY / tickInterval) * tickInterval;
  const maxTickY = Math.floor(graph.maxY / tickInterval) * tickInterval;

  const numTicks = Math.floor((maxTickY - minTickY) / tickInterval) + 1;

  const tickSize = 7;

  Array(numTicks)
    .fill(0)
    .forEach((_, index) => {
      const valY = minTickY + index * tickInterval;
      const pixY = roundPix(graph.pix.y(valY));

      ctx.beginPath();
      ctx.lineTo(graph.padding[3] - tickSize, pixY);
      ctx.lineTo(graph.padding[3], pixY);
      ctx.stroke();

      const text = formatCurrency(valY);
      ctx.fillText(text, graph.padding[3] - tickSize - 1, pixY);
    });

  ctx.beginPath();
  ctx.lineTo(graph.padding[3] - 0.5, graph.pix.y(graph.minY));
  ctx.lineTo(graph.padding[3] - 0.5, graph.pix.y(graph.maxY));
  ctx.stroke();
}

function drawAxes(ctx: CanvasRenderingContext2D, graph: GraphProps): void {
  drawTimeAxis(ctx, graph);
  drawValueAxis(ctx, graph);
}

function prepareGraph(ctx: CanvasRenderingContext2D, graph: GraphProps): void {
  registerFont(path.resolve(__dirname, '../fonts/OpenSans-Regular.ttf'), {
    family: 'OpenSans',
    weight: 'normal',
  });
  registerFont(path.resolve(__dirname, '../fonts/OpenSans-Bold.ttf'), {
    family: 'OpenSans',
    weight: 'bold',
  });

  ctx.scale(graph.scale, graph.scale);

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, graph.width, graph.height);
}

function drawGraph(ctx: CanvasRenderingContext2D, graph: GraphProps): void {
  prepareGraph(ctx, graph);
  drawData(ctx, graph);
  drawTitle(ctx, graph);
  drawAxes(ctx, graph);
}

export async function generateChart(
  db: DatabaseTransactionConnectionType,
  uid: number,
  query: Query,
): Promise<NodeJS.ReadableStream> {
  const { width, height, scale, year, month, category } = query;
  const startDate = startOfMonth(setMonth(setYear(new Date(), year), month - 1));
  const endDate = startOfDay(endOfMonth(setMonth(setYear(new Date(), year), month - 1)));
  const numDays = differenceInDays(endDate, startDate) + 1;
  if (numDays <= 0) {
    throw boom.badRequest('Must set end date after start date');
  }

  const canvas = createCanvas(width * scale, height * scale);

  const rows = await getPreviewRows(db, uid, category, startDate, endDate);

  const line = getChartRows(startDate, numDays, rows);

  const minY = line.reduce<number>((last, { y }) => Math.min(last, y), 0);
  const maxY = line.reduce<number>((last, { y }) => Math.max(last, y), minY + 1);

  const baseProps: Omit<GraphProps, 'pix'> = {
    ...query,
    startDate,
    endDate,
    padding: PADDING,
    minX: getUnixTime(startDate),
    maxX: getUnixTime(endDate),
    minY,
    maxY,
    line,
  };

  const graphProps: GraphProps = {
    ...baseProps,
    pix: getPix(baseProps),
  };

  const ctx = canvas.getContext('2d');

  drawGraph(ctx, graphProps);

  return canvas.createPNGStream();
}
