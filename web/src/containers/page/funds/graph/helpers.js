import { List as list } from 'immutable';
import { GRAPH_FUNDS_MODE_ROI } from '../../../../misc/const';
import { formatCurrency } from '../../../../misc/format';

export function separateLines(line) {
    return line.reduce(({ lastLines, lastValue }, point) => {
        const value = point.get(1);

        if (value === 0) {
            return { lastLines, lastValue: 0 };
        }
        if (lastValue === 0) {
            return { lastLines: lastLines.concat([list.of(point)]), lastValue: value };
        }

        return {
            lastLines: lastLines.slice(0, lastLines.length - 1)
                .concat([lastLines[lastLines.length - 1].push(point)]),
            lastValue: value
        };

    }, { lastLines: [], lastValue: 0 })
        .lastLines;
}

export function formatValue(value, mode = null) {
    if (mode === GRAPH_FUNDS_MODE_ROI) {
        return `${value.toFixed(2)}%`;
    }

    return formatCurrency(value, { raw: true, abbreviate: true, precision: 1 });
}

