import { rgb, mix } from 'polished';
import ColorHash from 'color-hash';

import { OVERVIEW_COLUMNS } from '~/constants/overview';
import { colors } from '~/styled/variables';

const scoreColor = (color: string, score: number): string => mix(1 - score, colors.white, color);

const colorHash = new ColorHash({
  lightness: 0.3,
  saturation: 1,
});

export function colorKey(value: string): string {
  const [red, green, blue]: [number, number, number] = colorHash.rgb(value);
  return rgb(red, green, blue);
}

function getOverviewCategoryKeyColor(key: string): string | [string, string] {
  if (colors[`${key}Key`]) {
    return colors[`${key}Key`];
  }
  if (colors[key]) {
    return colors[key];
  }
  if (key.startsWith('net')) {
    return [colors.spendingKey, colors.incomeKey];
  }

  throw new Error(`Unknown overview column: ${key}`);
}

export const getOverviewCategoryColor = (): { [key: string]: string | [string, string] } =>
  OVERVIEW_COLUMNS.reduce(
    (last, [key]) => ({
      ...last,
      [key]: getOverviewCategoryKeyColor(key),
    }),
    {},
  );

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
  {
    min,
    minNegative = 0,
    maxPositive = 0,
    max,
  }: {
    min: number;
    minNegative?: number;
    maxPositive?: number;
    max: number;
  },
  {
    negative = 0,
    positive = 0,
  }: {
    negative?: number;
    positive?: number;
  } = {},
  color: string | [string, string],
): string {
  if (!value || min === max) {
    return colors.white;
  }

  if (Array.isArray(color)) {
    if (value < 0) {
      return scoreColor(color[0], getScore(-value, -negative, -minNegative, -min));
    }

    return scoreColor(color[1], getScore(value, positive, maxPositive, max));
  }

  return scoreColor(color, getScore(value, positive, min, max));
}
