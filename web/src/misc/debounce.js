/**
 * An ES6 implementation of debounce, which runs
 * the callback immediately on the first run
 */

export default function debounce(callback, delay, immediate, context = this) {
    let timer = null;
    let args = null;
    let runOnce = false;

    const later = () => callback.apply(context, args);

    return function delayed() {
        args = arguments;
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

