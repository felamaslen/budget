function getComplexValue(value, currencies) {
    if (typeof value === 'number') {
        return value;
    }

    return value.reduce((last, { value: numberValue, currency }) => {
        const currencyMatch = currencies.find(({ currency: name }) => name === currency);
        if (!currencyMatch) {
            return last;
        }

        // converting from currency to GBX, but rate is against GBP
        return last + currencyMatch.rate * numberValue * 100;
    }, 0);
}

const valueByCategory = (subcategories, categoryId) =>
    ({ subcategory: subcategoryId }) => {
        const subcategory = subcategories.find(({ id }) => id === subcategoryId);

        return subcategory && subcategory.categoryId === categoryId;
    };

export function sumByCategory(categoryName, { rows, categories, subcategories }) {
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

const valueByType = (categoryType, categories, subcategories) =>
    ({ subcategory }) => {
        const { categoryId } = subcategories.find(({ id }) => id === subcategory) || {};
        if (!categoryId) {
            return false;
        }

        return categories.some(({ id, type }) => id === categoryId && type === categoryType);
    };

export function sumByType(categoryType, { row, categories, subcategories }) {
    if (!(row && categories.length && subcategories.length)) {
        return 0;
    }

    const { currencies, values } = row;

    return values
        .filter(valueByType(categoryType, categories, subcategories))
        .reduce((last, { value }) => last + getComplexValue(value, currencies), 0);
}
