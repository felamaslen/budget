import { GRAPH_FUNDS_MODE_ROI } from '~client/constants/graph';
import { formatCurrency } from './format';

export function separateLines(line) {
    return line.reduce(([lines, newLine], [xValue, yValue]) => {
        if (yValue === 0) {
            return [lines, true];
        }
        if (newLine) {
            return [lines.concat([[[xValue, yValue]]]), false];
        }

        return [
            lines
                .slice(0, lines.length - 1)
                .concat([lines[lines.length - 1].concat([[xValue, yValue]])]),
            false
        ];
    }, [[], true])[0];
}

export function formatValue(value, mode = null) {
    if (mode === GRAPH_FUNDS_MODE_ROI) {
        return `${value.toFixed(2)}%`;
    }

    return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
}
