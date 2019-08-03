export function replaceAtIndex(array, index, value, isFunction = false) {
    if (index === -1) {
        return array;
    }

    const nextValue = isFunction
        ? value(array[index])
        : value;

    return array
        .slice(0, index)
        .concat([nextValue])
        .concat(array.slice(index + 1));
}
