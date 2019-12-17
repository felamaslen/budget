type ReplacerFunction<T> = (arg: T) => T;

function isReplacerFunction<T>(value: T | ReplacerFunction<T>): value is ReplacerFunction<T> {
  return typeof value === 'function';
}

export function replaceAtIndex<T>(array: T[], index: number, value: T | ReplacerFunction<T>): T[] {
  if (index === -1) {
    return array;
  }

  const nextValue = isReplacerFunction(value) ? value(array[index]) : value;

  return array
    .slice(0, index)
    .concat([nextValue])
    .concat(array.slice(index + 1));
}

export function removeAtIndex<T>(array: T[], index: number): T[] {
  return array.slice(0, index).concat(array.slice(index + 1));
}

export const AVERAGE_MEDIAN = 'AVERAGE_MEDIAN';
export const AVERAGE_EXP = 'AVERAGE_EXP';

export function average(values: number[], mode: string | null = null): number {
  if (!values.length) {
    return NaN;
  }
  if (mode === AVERAGE_MEDIAN) {
    const sorted = values.slice().sort((prev, next) => prev - next);

    const oddLength = sorted.length & 1;
    if (oddLength) {
      // odd: get the middle value
      return sorted[Math.floor((sorted.length - 1) / 2)];
    }

    // even: get the middle two values and find the average of them
    const low = sorted[Math.floor(sorted.length / 2) - 1];
    const high = sorted[Math.floor(sorted.length / 2)];

    return (low + high) / 2;
  }
  if (mode === AVERAGE_EXP) {
    const weights = new Array(values.length)
      .fill(0)
      .map((item, key) => 2 ** -(key + 1))
      .reverse();

    const weightSum = weights.reduce((sum, value) => sum + value, 0);

    return values.reduce((last, value, index) => last + value * weights[index], 0) / weightSum;
  }

  // mean
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sortKey<T>(key: keyof T, itemA: T, itemB: T): number {
  if (itemA[key] < itemB[key]) {
    return -1;
  }
  if (itemA[key] > itemB[key]) {
    return 1;
  }

  return 0;
}

export function sortByKey<T>(...keys: (keyof T)[]): (items: T[]) => T[] {
  return (items: T[]): T[] =>
    items.sort((itemA: T, itemB: T): number =>
      keys.reduce((last: number, key: keyof T) => last || sortKey<T>(key, itemA, itemB), 0),
    );
}

export function pad<T>(array: T[], length: number, padValue: T): T[] {
  if (array.length > length) {
    return array.slice(0, length);
  }

  const numPads = length - array.length;
  if (numPads > 0) {
    return array.concat(new Array(numPads).fill(padValue));
  }

  return array;
}
