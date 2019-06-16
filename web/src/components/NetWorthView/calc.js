function getComplexValue(value, currencies) {
    if (typeof value === 'number') {
        return value;
    }

    return value.reduce((last, { value: numberValue, currency }) => {
        const currencyMatch = currencies.find(({ currency: name }) => name === currency);
        if (!currencyMatch) {
            return last;
        }

        return last + currencyMatch.rate * numberValue;
    }, 0);
}

const valueByCategory = (subcategories, categoryId) => {
    return ({ subcategory: subcategoryId }) => {
        const subcategory = subcategories.find(({ id }) => {
            return id === subcategoryId;
        });

        return subcategory && subcategory.categoryId === categoryId;
    };
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
