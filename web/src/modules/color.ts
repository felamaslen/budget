import { compose } from '@typed/compose';
import ColorHash from 'color-hash';
import moize from 'moize';
import { parseToRgb, rgb, setLightness, setSaturation } from 'polished';

import { OVERVIEW_COLUMNS, isPage } from '~client/constants/data';
import { arrayAverage } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import { TableValues, SplitRange, Median } from '~client/types';

type OverviewColorRange = { negative: string; positive: string };
type OverviewBaseColor = string | OverviewColorRange;

const isColorRange = (color: OverviewBaseColor): color is OverviewColorRange =>
  typeof color !== 'string';

function getOverviewCategoryKeyColor(key: string): OverviewBaseColor {
  if (Reflect.has(colors.overview, key)) {
    return colors.overview[key];
  }
  if (isPage(key)) {
    return colors[key].main;
  }
  if (key.startsWith('net')) {
    return {
      negative: colors.overview.spending,
      positive: colors.overview.income,
    };
  }

  throw new Error(`Unknown overview column: ${key}`);
}

export const overviewCategoryColor: Partial<TableValues<string>> = OVERVIEW_COLUMNS.reduce<
  Partial<TableValues<string>>
>(
  (last, [key]) => ({
    ...last,
    [key]: getOverviewCategoryKeyColor(key),
  }),
  {},
);

const scoreComponent = (score: number, value: number): number =>
  Math.round(255 - (255 - value) * score);

export function scoreColor(color: string, score: number): string {
  const { red, green, blue } = parseToRgb(color);
  return rgb(
    scoreComponent(score, red ?? 0),
    scoreComponent(score, green ?? 0),
    scoreComponent(score, blue ?? 0),
  );
}

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
  { min, maxNegative = 0, minPositive = 0, max }: SplitRange,
  { negative = 0, positive = 0 }: Partial<Median> = {},
  color: OverviewBaseColor = colors.white,
): string {
  if (!value || min === max) {
    return colors.white;
  }
  if (isColorRange(color)) {
    if (value < 0) {
      return scoreColor(color.negative, getScore(-value, -negative, -maxNegative, -min));
    }

    return scoreColor(color.positive, getScore(value, positive, minPositive, max));
  }

  return scoreColor(color, getScore(value, positive, min, max));
}

export const pageColor = moize((color: string): string =>
  compose(setLightness(0.9), setSaturation(0.8))(color),
);

const colorHash = new ColorHash({
  lightness: 0.3,
  saturation: 1,
});

export const colorKey = moize((item: string): string => {
  const [red, green, blue] = colorHash.rgb(item);
  return rgb(red, green, blue);
});

export function averageColor(values: string[]): string {
  if (!values.length) {
    return colors.transparent;
  }

  const parsed = values.map(parseToRgb);
  return rgb(
    arrayAverage(parsed.map(({ red }) => red)),
    arrayAverage(parsed.map(({ green }) => green)),
    arrayAverage(parsed.map(({ blue }) => blue)),
  );
}
