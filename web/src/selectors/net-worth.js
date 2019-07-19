import { createSelector } from 'reselect';
import { DateTime } from 'luxon';

import {
    getStartDate,
    getMonthDates
} from '~client/selectors/common';

import { getMonthDatesList } from '~client/modules/date';

const getEntries = state => state.netWorth.entries;

const getSummaryEntries = createSelector(getEntries, entries =>
    entries.map(({ values, ...rest }) => ({
        ...rest,
        values: values.filter(({ skip }) => !skip)
    })));

const getCategories = state => state.netWorth.categories;
const getSubcategories = state => state.netWorth.subcategories;

function getComplexValue(value, currencies) {
    if (typeof value === 'number') {
        return value;
    }

    return value.reduce((last, part) => {
        if (typeof part === 'number') {
            return last + part;
        }

        const { value: numberValue, currency } = part;

        const currencyMatch = currencies.find(({ currency: name }) => name === currency);
        if (!currencyMatch) {
            return last;
        }

        // converting from currency to GBX, but rate is against GBP
        return last + currencyMatch.rate * numberValue * 100;
    }, 0);
}

function valueByCategory(subcategories, categoryId) {
    return ({ subcategory: subcategoryId }) => {
        const subcategory = subcategories.find(({ id }) => id === subcategoryId);

        return subcategory && subcategory.categoryId === categoryId;
    };
}

function valueByType(categoryType, categories, subcategories) {
    return ({ subcategory }) => {
        const { categoryId } = subcategories.find(({ id }) => id === subcategory) || {};
        if (!categoryId) {
            return false;
        }

        return categories.some(({ id, type }) => id === categoryId && type === categoryType);
    };
}

function sumByCategory(categoryName, { rows, categories, subcategories }) {
    if (!(rows.length && categories.length && subcategories.length)) {
        return 0;
    }

    const category = categories.find(({ category: name }) => name === categoryName);
    if (!category) {
        return 0;
    }

    const { currencies, values } = rows[rows.length - 1];

    return values
        .filter(valueByCategory(subcategories, category.id))
        .reduce((last, { value }) => last + getComplexValue(value, currencies), 0);
}

function sumByType(categoryType, entry, categories, subcategories) {
    if (!(entry && categories.length && subcategories.length)) {
        return 0;
    }

    const { currencies, values } = entry;

    return values
        .filter(valueByType(categoryType, categories, subcategories))
        .reduce((last, { value }) => last + getComplexValue(value, currencies), 0);
}

const getAssets = (entry, categories, subcategories) =>
    sumByType('asset', entry, categories, subcategories);

const getLiabilities = (entry, categories, subcategories) =>
    sumByType('liability', entry, categories, subcategories);

const getEntryValueForMonth = entries => date => {
    const matchingEntries = entries
        .filter(({ date: entryDate }) => entryDate.hasSame(date, 'month'))
        .sort(({ date: dateA }, { date: dateB }) => dateB - dateA);

    if (!matchingEntries.length) {
        return 0;
    }

    const { currencies, values } = matchingEntries[matchingEntries.length - 1];

    return values.reduce((last, { value }) =>
        last + getComplexValue(value, currencies), 0);
};

export const getNetWorthSummary = createSelector([
    getMonthDates,
    getSummaryEntries
], (monthDates, entries) => monthDates.map(getEntryValueForMonth(entries)));

export const getNetWorthSummaryOld = createSelector([
    getStartDate,
    getSummaryEntries
], (startDate, entries) => {
    const startOfMonth = startDate.startOf('month');
    const oldEntries = entries.filter(({ date }) => date < startOfMonth);

    const maxDate = startOfMonth.plus({ days: -1 });

    const minDate = oldEntries.reduce((last, { date }) => {
        if (date < last) {
            return date;
        }

        return last;
    }, maxDate);

    const monthDates = getMonthDatesList(minDate, maxDate);

    return monthDates.map(getEntryValueForMonth(oldEntries));
});
