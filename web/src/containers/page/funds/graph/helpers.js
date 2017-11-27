import { List as list } from 'immutable';

export function separateLine(line) {
    return line
        .reduce(({ lastEnded, lines }, point) => {
            const validValue = point.get(1) !== 0;

            if (lastEnded) {
                if (validValue) {
                    return {
                        lines: lines.push(list.of(point)),
                        lastEnded: false
                    };
                }

                return { lines, lastEnded };
            }

            if (validValue) {
                return {
                    lines: lines.set(lines.size - 1, lines.last().push(point)),
                    lastEnded: false
                };
            }

            return { lines, lastEnded: true };

        }, {
            lines: list.of(list.of()),
            lastEnded: false
        })
        .lines;
}

