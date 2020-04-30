import { replaceAtIndex } from 'replace-array';

import { Data } from '~client/types/graph';
import { Mode } from '~client/constants/graph';
import { formatCurrency } from '~client/modules/format';

export const separateLines = (line: Data): Data[] =>
  line.reduce(
    ([lines, newLine]: [Data[], boolean], [xValue, yValue]): [Data[], boolean] => {
      if (yValue === 0) {
        return [lines, true];
      }
      if (newLine) {
        return [lines.concat([[[xValue, yValue]]]), false];
      }

      return [
        replaceAtIndex<Data>(lines, lines.length - 1, part => part.concat([[xValue, yValue]])),
        false,
      ];
    },
    [[], true],
  )[0];

export const formatValue = (value: number, mode?: Mode): string => {
  if (mode === Mode.ROI) {
    return `${value.toFixed(2)}%`;
  }

  return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
};