import type { ProfitPoint } from './process-data';

import { colors } from '~client/styled/variables';
import type { DynamicLineColor } from '~client/types';

export function graphColor(points: ProfitPoint[]): DynamicLineColor {
  return (_, index): string => {
    if (points[index].profit === null) {
      return colors.dark.mediumDark;
    }
    return points[index].profit ? colors.funds.profit : colors.funds.loss;
  };
}
