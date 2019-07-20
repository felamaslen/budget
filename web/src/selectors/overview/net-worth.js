import { createSelector } from 'reselect';
import { DateTime } from 'luxon';
import compose from 'just-compose';

import {
    getCost,
    getSpendingColumn,
    getStartDate,
    getMonthDates
} from '~client/selectors/overview/common';

import { getMonthDatesList } from '~client/modules/date';
import { withoutDeleted } from '~client/modules/data';

const nullEntry = date => ({
    date,
    values: [],
    currencies: [],
    creditLimit: []
});

const FTI_START = DateTime.fromISO(process.env.BIRTH_DATE || '1990-01-01');

const getNonFilteredCategories = state => state.netWorth.categories;
const getNonFilteredSubcategories = state => state.netWorth.subcategories;
const getNonFilteredEntries = state => state.netWorth.entries;

export const getEntries = createSelector(getNonFilteredEntries, withoutDeleted);
export const getCategories = createSelector(getNonFilteredCategories, withoutDeleted);
export const getSubcategories = createSelector(getNonFilteredSubcategories, withoutDeleted);

const withoutSkipValues = entries => entries.map(({ values, ...rest }) => ({
    ...rest,
    values: values.filter(({ skip }) => !skip)
}));

const getSummaryEntries = createSelector(getEntries, withoutSkipValues);

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

const sumValues = (currencies, values) =>
    values.reduce((last, { value }) => last + getComplexValue(value, currencies), 0);

function getSumByCategory(categories, subcategories, entries, categoryName) {
    if (!(entries.length && categories.length && subcategories.length)) {
        return 0;
    }

    const category = categories.find(({ category: name }) => name === categoryName);
    if (!category) {
        return 0;
    }

    const { currencies, values } = entries[entries.length - 1];

    const valuesFiltered = values
        .filter(({ subcategory }) => subcategories.some(({ id, categoryId }) =>
            id === subcategory && categoryId === category.id));

    return sumValues(currencies, valuesFiltered);
}

const getAggregateNames = (state, names) => names;

export const getAggregates = createSelector([
    getAggregateNames,
    getCategories,
    getSubcategories,
    getEntries
], (categoryNames, categories, subcategories, entries) => Object.keys(categoryNames)
    .reduce((last, key) => ({
        ...last,
        [key]: getSumByCategory(categories, subcategories, entries, categoryNames[key])
    }), {})
);

const getEntryForMonth = entries => date => {
    const matchingEntries = entries
        .filter(({ date: entryDate }) => entryDate.hasSame(date, 'month'))
        .sort(({ date: dateA }, { date: dateB }) => dateB - dateA);

    if (!matchingEntries.length) {
        return nullEntry(date);
    }

    return matchingEntries[matchingEntries.length - 1];
};

const getNetWorthRows = createSelector(getMonthDates, getSummaryEntries, (monthDates, entries) =>
    monthDates.map(getEntryForMonth(entries)));

const getValues = ({ currencies, values }) => sumValues(currencies, values);

export const getNetWorthSummary = createSelector(getNetWorthRows, rows => rows.map(getValues));

export const getNetWorthSummaryOld = createSelector(getStartDate, getSummaryEntries, (startDate, entries) => {
    const startOfMonth = startDate.startOf('month');
    const oldEntries = entries.filter(({ date }) => date < startOfMonth);

    const maxDate = startOfMonth.plus({ days: -1 });

    const minDate = oldEntries.reduce((last, { date }) => {
        if (date < last) {
            return date;
        }

        return last;
    }, maxDate);

    return getMonthDatesList(minDate, maxDate)
        .map(getEntryForMonth(oldEntries))
        .map(getValues);
});

const sumByType = (categoryType, categories, subcategories, { currencies, values }) =>
    sumValues(currencies, values.filter(({ subcategory }) => subcategories.some(({ id, categoryId }) =>
        id === subcategory &&
        categories.some(({ id: compare, type }) => compare === categoryId && type === categoryType)
    )));

const withTypeSplit = (categories, subcategories) => rows => rows.map(entry => ({
    ...entry,
    assets: sumByType('asset', categories, subcategories, entry),
    liabilities: -sumByType('liability', categories, subcategories, entry)
}));

function getSpendingByDate(spending, dates, date) {
    const dateIndex = dates.findIndex(compare => compare.hasSame(date, 'month'));
    if (dateIndex === -1) {
        return 0;
    }

    return spending[dateIndex];
}

const withSpend = (dates, spending) => rows => rows.map(entry => ({
    ...entry,
    expenses: getSpendingByDate(spending, dates, entry.date)
}));

const withFTI = rows => rows.map((entry, index) => {
    const { years } = entry.date.diff(FTI_START, 'years').toObject();

    const pastYear = rows.slice(Math.max(0, index - 11), index + 1);
    const pastYearSpend = pastYear.reduce((sum, { expenses }) => sum + expenses, 0);
    const pastYearAverageSpend = pastYearSpend * 12 / pastYear.length;

    const fti = (entry.assets - entry.liabilities) * years / pastYearAverageSpend;

    return { ...entry, fti };
});

const withTableProps = rows => rows.map(({ id, date, assets, liabilities, expenses, fti }) => ({
    id,
    date,
    assets,
    liabilities,
    expenses,
    fti
}));

export const getNetWorthTable = createSelector([
    getCost,
    getMonthDates,
    getCategories,
    getSubcategories,
    getSummaryEntries
], (costMap, dates, categories, subcategories, entries) => compose(
    withTypeSplit(categories, subcategories),
    withSpend(dates, getSpendingColumn(dates)(costMap).spending),
    withFTI,
    withTableProps
)(entries));
