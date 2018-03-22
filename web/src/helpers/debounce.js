/**
 * An ES6 implementation of debounce, which runs
 * the callback immediately on the first run
 */

export function buffer(callback, delay, context = null) {
    let runInLastBuffer = false;

    const later = args => Reflect.apply(callback, context, args);

    return function buffered(...args) {
        if (runInLastBuffer) {
            return;
        }

        setTimeout(() => {
            runInLastBuffer = false;
        }, delay);

        runInLastBuffer = true;
        later(args);
    };
}

export default function debounce(callback, delay, immediate, context = null) {
    let timer = null;
    let args = [];
    let runOnce = false;

    const later = () => Reflect.apply(callback, context, args);

    return function delayed(...delayedArgs) {
        args = delayedArgs;

        if (immediate && !runOnce) {
            later();
            runOnce = true;
        }
        else {
            clearTimeout(timer);
            timer = setTimeout(later, delay);
        }
    };
}

