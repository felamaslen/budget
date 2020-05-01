import ColorHash from 'color-hash';

import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { COLOR_CATEGORY, Color } from '~client/constants/colors';
import { arrayAverage } from '~client/modules/data';
import { TableValues, Range, Median } from '~client/types/overview';

const rgbaHelper = ([open]: TemplateStringsArray, ...args: number[]): string => {
  const rounded = args.map((value, index) =>
    index === 3 ? value.toFixed(1) : Math.max(0, Math.min(255, Math.round(value))),
  );
  return `${open}${rounded.join(',')})`;
};

export const rgba = ([red, green, blue, alpha]: Color): string =>
  typeof alpha === 'undefined'
    ? rgbaHelper`rgb(${red}, ${green}, ${blue})`
    : rgbaHelper`rgba(${red}, ${green}, ${blue}, ${alpha}`;

function getOverviewCategoryKeyColor(key: string): Color | [Color, Color] {
  if (COLOR_CATEGORY[key]) {
    return COLOR_CATEGORY[key];
  }
  if (key.startsWith('net')) {
    return [COLOR_CATEGORY.spending, COLOR_CATEGORY.income];
  }

  throw new Error(`Unknown overview column: ${key}`);
}

export const getOverviewCategoryColor = (): Partial<TableValues<Color>> =>
  OVERVIEW_COLUMNS.slice(1).reduce(
    (last, [key]) => ({
      ...last,
      [key]: getOverviewCategoryKeyColor(key),
    }),
    {},
  );

const blank: Color = [255, 255, 255]; // white

const scoreComponent = (score: number, value: number): number =>
  Math.round(255 - (255 - value) * score);

const scoreColor = ([r, g, b]: Color, score: number): Color => [
  scoreComponent(score, r),
  scoreComponent(score, g),
  scoreComponent(score, b),
];

function getScore(value: number, median: number, min: number, max: number): number {
  if (min / max > 0 && value / min < 1) {
    return 0;
  }
  if (value / max > 1) {
    return 1;
  }
  if ((value - min) / (median - min) < 1) {
    return 0.5 * ((value - min) / (median - min));
  }

  return 0.5 * (1 + (value - median) / (max - median));
}

export function getOverviewScoreColor(
  value: number,
  { min, maxNegative = 0, minPositive = 0, max }: Range,
  { negative = 0, positive = 0 }: Partial<Median> = {},
  color: Color | [Color, Color] = blank,
): Color {
  if (!value || min === max) {
    return blank;
  }

  if (color.length === 2) {
    if (value < 0) {
      return scoreColor(color[0], getScore(-value, -negative, -maxNegative, -min));
    }

    return scoreColor(color[1], getScore(value, positive, minPositive, max));
  }

  return scoreColor(color, getScore(value, positive, min, max));
}

const colorHash = new ColorHash({
  lightness: 0.3,
  saturation: 1,
});

export const colorKey = (color: string): Color => colorHash.rgb(color);

export function averageColor(colors: Color[]): Color {
  if (!colors.length) {
    return [255, 255, 255, 0];
  }

  return [
    arrayAverage(colors.map(([red]) => red)),
    arrayAverage(colors.map(([, green]) => green)),
    arrayAverage(colors.map(([, , blue]) => blue)),
  ];
}
