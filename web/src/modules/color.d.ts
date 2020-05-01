import { Color } from '~client/constants/colors';
import { TableValues, Range, Median } from '~client/types/overview';

export const rgba: (values: Color) => string;

export const colorKey: (color: string) => Color;

export const getOverviewScoreColor: (
  value: number,
  range: Range,
  median: Median,
  color: Color | [Color, Color],
) => Color;

export const getOverviewCategoryColor: () => TableValues<Color>;
