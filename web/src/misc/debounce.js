/**
 * An ES6 implementation of debounce, which runs
 * the callback immediately on the first run
 */

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

