import { List as list } from 'immutable';

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

