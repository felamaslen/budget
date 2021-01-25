import { colors } from '~client/styled/variables';
import type { ColorSwitcher, Data } from '~client/types';

export const graphColor = (points: Data): ColorSwitcher => ({
  changes: [points[0][1]],
  values: [colors.funds.loss, colors.funds.profit],
});
