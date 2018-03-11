import React from 'react';
import { DateTime } from 'luxon';
import { formatCurrency } from '../../misc/format';
import { LOCALE } from '../../misc/config';
import { dateInput } from '../../misc/date';

export function getEditValue(item, value, edited) {
    if (item === 'date') {
        const validInput = dateInput(edited);

        return validInput || value;
    }

    if (item === 'cost') {
        const editedNumber = Number(edited);
        if (!isNaN(editedNumber)) {
            return editedNumber * 100;
        }

        return 0;
    }

    if (item === 'transactions') {
        return null;
    }

    return String(edited);
}

export function formatValue(item, value) {
    if (item === 'date') {
        if (value) {
            return value.setLocale(LOCALE)
                .toLocaleString(DateTime.DATE_SHORT);
        }

        return '';
    }

    if (item === 'cost') {
        return formatCurrency(value);
    }

    if (item === 'transactions') {
        const numTransactions = value && value.size
            ? value.size
            : 0;

        return <span className="num-transactions">{numTransactions}</span>;
    }

    return String(value);
}

export function getDefaultValue(item, value) {
    if (item === 'cost') {
        if (value) {
            return String(Number(value) / 100);
        }

        return '';
    }

    if (item === 'date') {
        return value.setLocale(LOCALE)
            .toLocaleString(DateTime.DATE_SHORT);
    }

    return String(value);
}

