export const CANCELLED = 'CANCELLED';
export const VALUE_SET = 'VALUE_SET';

export const isShift = (event) => event.shiftKey;

export const isCtrl = (event) => event.ctrlKey;

export const isEnter = (event) => event.key === 'Enter';

export const isEscape = (event) => event.key === 'Escape';

export const isTab = (event) => event.key === 'Tab';

const arrows = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];

export function getNavDirection(event, requireArrowModifier = false) {
    if (isTab(event)) {
        if (isShift(event)) {
            return { dx: -1, dy: 0 };
        }

        return { dx: 1, dy: 0 };
    }

    const arrowIndex = arrows.indexOf(event.key);
    if (arrowIndex > -1 && (!requireArrowModifier || isCtrl(event))) {
        return {
            dx: ((arrowIndex % 4) - 1) % 2,
            dy: (((arrowIndex - 1) % 4) - 1) % 2,
        };
    }

    return { dx: 0, dy: 0 };
}
