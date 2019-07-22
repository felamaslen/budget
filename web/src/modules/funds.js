import { GRAPH_FUNDS_MODE_ROI } from '~client/constants/graph';
import { formatCurrency } from '~client/modules/format';
import { replaceAtIndex } from '~client/modules/data';

export function separateLines(line) {
    return line.reduce(([lines, newLine], [xValue, yValue]) => {
        if (yValue === 0) {
            return [lines, true];
        }
        if (newLine) {
            return [lines.concat([[[xValue, yValue]]]), false];
        }

        return [replaceAtIndex(lines, lines.length - 1, part => part.concat([[xValue, yValue]]), true), false];
    }, [[], true])[0];
}

export function formatValue(value, mode = null) {
    if (mode === GRAPH_FUNDS_MODE_ROI) {
        return `${value.toFixed(2)}%`;
    }

    return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
}
