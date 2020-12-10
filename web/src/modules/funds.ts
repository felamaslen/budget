import { Mode } from '~client/constants/graph';
import { formatCurrency } from '~client/modules/format';

export const formatValue = (value: number, mode?: Mode): string => {
  if (mode === Mode.ROI) {
    return `${value.toFixed(2)}%`;
  }

  return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
};
