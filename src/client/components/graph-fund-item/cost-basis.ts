import { colors } from '~client/styled';
import type { Line } from '~client/types';

export const costBasisLine = ({ data, key, name }: Pick<Line, 'data' | 'key' | 'name'>): Line => ({
  color: colors.loss.translucent,
  data: data.filter(([, y]) => y > 0),
  fill: true,
  key,
  name,
  smooth: false,
  strokeWidth: 1,
});
