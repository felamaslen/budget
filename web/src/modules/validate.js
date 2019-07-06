import { DateTime } from 'luxon';

function validateString(value) {
    if (!value.length) {
        throw new Error('Required');
    }
}
function validateDate(value) {
    if (!(value instanceof DateTime) || value.invalid) {
        throw new Error('Must be a valid date');
    }
}

export function validateField(item, value) {
    if (['item', 'category', 'holiday', 'social', 'shop'].includes(item)) {
        return validateString(value);
    }
    if (item === 'date') {
        return validateDate(value);
    }

    return null;
}
