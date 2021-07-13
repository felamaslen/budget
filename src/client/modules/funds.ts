import { formatCurrency, formatPercent } from '~client/modules/format';
import { FundMode } from '~client/types/enum';

export const formatValue = (value: number, mode?: FundMode): string => {
  switch (mode) {
    case FundMode.Roi:
      return `${value.toFixed(2)}%`;
    case FundMode.Allocation:
      return formatPercent(value, { precision: 2 });
    case FundMode.PriceNormalised:
      return `${(value - 100).toFixed(2)}%`;
    default:
      return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
  }
};
