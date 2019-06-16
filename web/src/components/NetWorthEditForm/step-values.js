import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { replaceAtIndex } from '~client/modules/data';
import { useInputSelect } from '~client/hooks/form';
import {
    currency,
    netWorthItem,
    netWorthValue
} from '~client/components/NetWorthList/prop-types';
import {
    category as categoryShape,
    subcategory as subcategoryShape
} from '~client/components/NetWorthCategoryList/prop-types';
import FormFieldNetWorthValue from '~client/components/FormField/net-worth-value';
import FormContainer from '~client/components/NetWorthEditForm/form-container';
import NextButton from '~client/components/NetWorthEditForm/next-button';

function EditByType({
    categories,
    subcategories,
    currencies,
    value: {
        id,
        subcategory,
        value
    },
    onChange,
    onRemove
}) {
    const {
        subcategory: subcategoryName,
        categoryId
    } = subcategories.find(({ id: subcategoryId }) => subcategoryId === subcategory);

    const { category } = categories.find(({ id: otherCategoryId }) => otherCategoryId === categoryId);

    const onChangeCallback = useCallback(newValue => onChange(id, {
        ...newValue,
        category: Number(newValue.category),
        subcategory: Number(newValue.subcategory)
    }), [onChange, id]);
    const onRemoveCallback = useCallback(() => onRemove(id), [onRemove, id]);

    return (
        <div className="edit-by-category-value">
            <h5 className="category">{category}</h5>
            <h6 className="subcategory">{subcategoryName}</h6>
            <FormFieldNetWorthValue
                value={value}
                onChange={onChangeCallback}
                currencies={currencies}
            />
            <button
                onClick={onRemoveCallback}
                className="button-delete"
            >{'Remove this value'}</button>
        </div>
    );
}

EditByType.propTypes = {
    categories: PropTypes.arrayOf(categoryShape.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    currencies: PropTypes.arrayOf(currency.isRequired).isRequired,
    value: netWorthValue.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

function AddByType({
    categories,
    subcategories,
    currencies,
    onAdd
}) {
    const categoryOptions = useMemo(() => categories.map(({ id, category }) => ({
        internal: String(id),
        external: category
    })), [categories]);

    const [category, InputCategory] = useInputSelect(categoryOptions[0].internal, categoryOptions);

    const subcategoryOptions = useMemo(
        () => subcategories
            .filter(({ categoryId }) => categoryId === Number(category))
            .map(({ id, subcategory }) => ({
                internal: String(id),
                external: subcategory
            })),
        [category, subcategories]
    );

    const [subcategory, InputSubcategory] = useInputSelect(subcategoryOptions[0].internal, subcategoryOptions);

    const [value, setValue] = useState(0);

    const onAddCallback = useCallback(() => {
        onAdd(value, Number(subcategory));
    }, [onAdd, subcategory, value]);

    return (
        <div className="add-by-category-value">
            <span className="category">
                <span className="label">{'Category:'}</span>
                {InputCategory}
            </span>
            <span className="subcategory">
                <span className="label">{'Subcategory:'}</span>
                {InputSubcategory}
            </span>
            <FormFieldNetWorthValue
                value={value}
                onChange={setValue}
                currencies={currencies}
            />
            <button onClick={onAddCallback} className="button-add">{'Add'}</button>
        </div>
    );
}

AddByType.propTypes = {
    categories: PropTypes.arrayOf(categoryShape.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    currencies: PropTypes.arrayOf(currency.isRequired).isRequired,
    onAdd: PropTypes.func.isRequired
};

function StepValues({
    typeFilter,
    name,
    containerProps,
    item,
    categories,
    subcategories,
    onEdit,
    onNextStep,
    onLastStep
}) {
    const categoriesByType = useMemo(() => categories.filter(({ type }) => type === typeFilter), [categories, typeFilter]);

    const valuesByType = useMemo(() => item.values.filter(({ subcategory }) => {
        const { categoryId } = subcategories.find(({ id }) => id === subcategory);

        return categoriesByType.some(({ id }) => id === categoryId);
    }), [categoriesByType, subcategories, item.values]);

    const availableSubcategories = useMemo(() => subcategories.filter(({ id: subcategoryId, categoryId }) =>
        categoriesByType.some(({ id }) => id === categoryId) &&
        !valuesByType.some(({ subcategory }) => subcategory === subcategoryId)
    ), [subcategories, categoriesByType, valuesByType]);

    const availableCategories = useMemo(() => categoriesByType.filter(({ id }) =>
        availableSubcategories.some(({ categoryId }) => categoryId === id)
    ), [categoriesByType, availableSubcategories]);

    const [numNew, setNumNew] = useState(0);

    const onAddValue = useCallback((newValue, subcategory) => {
        const newItemValues = item.values.concat([{
            id: -numNew,
            subcategory,
            value: newValue
        }]);
        setNumNew(numNew + 1);
        onEdit({ ...item, values: newItemValues });
    }, [onEdit, numNew, item]);

    const onChangeValue = useCallback((id, newValue) => {
        const index = item.values.findIndex(({ id: valueId }) => valueId === id);
        const newItemValues = replaceAtIndex(item.values, index, {
            ...item.values[index],
            value: newValue
        });
        onEdit({ ...item, values: newItemValues });
    }, [onEdit, item]);

    const onRemoveValue = useCallback(id => {
        const newItemValues = item.values.filter(({ id: valueId }) => valueId !== id);
        onEdit({ ...item, values: newItemValues });
    }, [onEdit, item]);

    return (
        <FormContainer {...containerProps}>
            <h4 className="step-values-title">
                <span className="type">{name}</span>
                <span className="date">{' - '}{item.date}</span>
            </h4>
            <div className="edit-by-category">
                {valuesByType.map(value => (
                    <EditByType key={value.id}
                        categories={categoriesByType}
                        subcategories={subcategories}
                        currencies={item.currencies}
                        value={value}
                        onChange={onChangeValue}
                        onRemove={onRemoveValue}
                    />
                ))}
                {availableCategories.length && <AddByType key="add"
                    categories={availableCategories}
                    subcategories={availableSubcategories}
                    currencies={item.currencies}
                    onAdd={onAddValue}
                /> || null}
            </div>
            <NextButton onNextStep={onNextStep} onLastStep={onLastStep} />
        </FormContainer>
    );
}

StepValues.propTypes = {
    typeFilter: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    containerProps: PropTypes.object.isRequired,
    item: netWorthItem.isRequired,
    categories: PropTypes.arrayOf(categoryShape.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    onEdit: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onLastStep: PropTypes.bool.isRequired
};

export const StepAssets = props => (
    <StepValues {...props} typeFilter="asset" name="Assets" />
);

export const StepLiabilities = props => (
    <StepValues {...props} typeFilter="liability" name="Liabilities" />
);
