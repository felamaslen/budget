import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import shortid from 'shortid';

import { replaceAtIndex } from '~client/modules/data';
import { useInputSelect } from '~client/hooks/form';
import {
    currency,
    creditLimit as creditLimitShape,
    netWorthItem,
    netWorthValue
} from '~client/prop-types/net-worth/list';
import {
    category as categoryShape,
    subcategory as subcategoryShape
} from '~client/prop-types/net-worth/category';
import FormFieldNetWorthValue from '~client/components/FormField/net-worth-value';
import FormFieldCost from '~client/components/FormField/cost';
import FormContainer from '~client/components/NetWorthEditForm/form-container';

function CreditLimitEditor({ creditLimit, setCreditLimit }) {
    return (
        <div className="credit-limit-editor">
            <span className="label">{'Credit limit:'}</span>
            <FormFieldCost value={creditLimit || 0} onChange={setCreditLimit} />
        </div>
    );
}

CreditLimitEditor.propTypes = {
    creditLimit: PropTypes.number,
    setCreditLimit: PropTypes.func.isRequired
};

const SkipToggle = ({ skip, setSkip }) => (
    <div className="skip-toggle">
        <input type="checkbox" checked={Boolean(skip)} onChange={() => setSkip(!skip)} />
        <span className="label">{'Skip in calculations'}</span>
    </div>
);

SkipToggle.propTypes = {
    skip: PropTypes.bool,
    setSkip: PropTypes.func.isRequired
};

function EditByType({
    isLiability,
    subcategories,
    creditLimit: creditLimitList,
    currencies,
    value: {
        id,
        subcategory,
        skip,
        value
    },
    onChange,
    onRemove
}) {
    const {
        subcategory: subcategoryName,
        hasCreditLimit
    } = subcategories.find(({ id: subcategoryId }) => subcategoryId === subcategory);

    const { value: initialCreditLimit } = creditLimitList.find(({ subcategory: subcategoryId }) => subcategoryId === subcategory) || { value: null };

    const [newValue, setNewValue] = useState(value);
    const [creditLimit, setCreditLimit] = useState(initialCreditLimit);
    const [newSkip, setSkip] = useState(skip);

    useEffect(() => {
        if (!(value === newValue && initialCreditLimit === creditLimit && skip === newSkip)) {
            onChange(id, newValue, creditLimit, newSkip);
        }
    }, [value, newValue, initialCreditLimit, creditLimit, skip, newSkip, onChange, id]);

    const onRemoveCallback = useCallback(() => onRemove(id), [onRemove, id]);

    return (
        <div className="edit-by-category-value">
            <h6 className="subcategory">{subcategoryName}</h6>
            <FormFieldNetWorthValue
                value={value}
                onChange={setNewValue}
                currencies={currencies}
            />
            {hasCreditLimit && <CreditLimitEditor creditLimit={creditLimit} setCreditLimit={setCreditLimit} />}
            {isLiability && <SkipToggle skip={skip} setSkip={setSkip} />}
            <button
                onClick={onRemoveCallback}
                className="button-delete"
            >&minus;</button>
        </div>
    );
}

EditByType.propTypes = {
    isLiability: PropTypes.bool.isRequired,
    categories: PropTypes.arrayOf(categoryShape.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    creditLimit: PropTypes.arrayOf(creditLimitShape.isRequired).isRequired,
    currencies: PropTypes.arrayOf(currency.isRequired).isRequired,
    value: netWorthValue.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

function AddByType({
    isLiability,
    categories,
    subcategories,
    currencies,
    onAdd
}) {
    const categoryOptions = useMemo(() => categories.map(({ id, category }) => ({
        internal: String(id),
        external: category
    })), [categories]);

    const [category, InputCategory] = useInputSelect((categoryOptions[0] || {}).internal, categoryOptions);

    const subcategoryOptions = useMemo(
        () => subcategories
            .filter(({ categoryId }) => categoryId === category)
            .map(({ id, subcategory }) => ({
                internal: id,
                external: subcategory
            })),
        [category, subcategories]
    );

    const [subcategory, InputSubcategory] = useInputSelect((subcategoryOptions[0] || {}).internal, subcategoryOptions);

    const [value, setValue] = useState(0);
    const [skip, setSkip] = useState(null);

    const { hasCreditLimit } = useMemo(() => subcategories.find(({ id }) => id === subcategory) || {}, [subcategories, subcategory]);
    const initialCreditLimit = hasCreditLimit
        ? 0
        : null;
    const [creditLimit, setCreditLimit] = useState(initialCreditLimit);

    const onAddCallback = useCallback(() => {
        onAdd(value, creditLimit, subcategory, skip);
    }, [onAdd, subcategory, value, creditLimit, skip]);

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
            {hasCreditLimit && <CreditLimitEditor creditLimit={creditLimit} setCreditLimit={setCreditLimit} />}
            {isLiability && <SkipToggle skip={skip} setSkip={setSkip} />}
            <button onClick={onAddCallback} className="button-add">{'+'}</button>
        </div>
    );
}

AddByType.propTypes = {
    isLiability: PropTypes.bool.isRequired,
    categories: PropTypes.arrayOf(categoryShape.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    currencies: PropTypes.arrayOf(currency.isRequired).isRequired,
    onAdd: PropTypes.func.isRequired
};

function appendCreditLimit(item, subcategory, value) {
    const index = item.creditLimit.findIndex(({ subcategory: subcategoryId }) => subcategoryId === subcategory);
    const creditLimit = { subcategory, value };
    if (index === -1) {
        return item.creditLimit.concat([creditLimit]);
    }

    return replaceAtIndex(item.creditLimit, index, creditLimit);
}

function useAddValue(item, onEdit) {
    return useCallback((newValue, creditLimit, subcategory, skip = null) => {
        const itemWithValue = {
            ...item,
            values: item.values.concat([{
                id: shortid.generate(),
                subcategory,
                skip,
                value: newValue
            }])
        };

        if (creditLimit === null) {
            onEdit(itemWithValue);
        } else {
            onEdit({
                ...itemWithValue,
                creditLimit: appendCreditLimit(item, subcategory, creditLimit)
            });
        }
    }, [item, onEdit]);
}

function useChangeValue(item, onEdit) {
    return useCallback((id, newValue, creditLimit, skip = null) => {
        const index = item.values.findIndex(({ id: valueId }) => valueId === id);
        const itemWithValue = {
            ...item,
            values: replaceAtIndex(item.values, index, {
                ...item.values[index],
                skip,
                value: newValue
            })
        };

        if (creditLimit === null) {
            onEdit(itemWithValue);
        } else {
            const creditLimitIndex = item.creditLimit.findIndex(({ subcategory }) => subcategory === item.values[index].subcategory);

            onEdit({
                ...itemWithValue,
                creditLimit: replaceAtIndex(item.creditLimit, creditLimitIndex, {
                    ...item.creditLimit[creditLimitIndex],
                    value: creditLimit
                })
            });
        }
    }, [item, onEdit]);
}

function useRemoveValue(item, onEdit) {
    return useCallback(id => {
        const index = item.values.findIndex(({ id: valueId }) => valueId === id);
        const newItemValues = item.values.filter(({ id: valueId }) => valueId !== id);
        const creditLimit = item.creditLimit.filter(({ subcategory }) => subcategory !== item.values[index].subcategory);
        onEdit({ ...item, values: newItemValues, creditLimit });
    }, [item, onEdit]);
}

function CategoryGroup({ category: { category, color }, children }) {
    const [hidden, setHidden] = useState(false);
    const onToggleHidden = useCallback(() => setHidden(!hidden), [hidden]);

    const style = {
        backgroundColor: color
    };

    return (
        <div style={style} className={classNames('edit-by-category-group', { hidden })}>
            <h6 className="net-worth-edit-form-section-subtitle"
                onClick={onToggleHidden}
            >{category}</h6>
            {!hidden && children}
        </div>
    );
}

CategoryGroup.propTypes = {
    category: categoryShape.isRequired,
    children: PropTypes.arrayOf(PropTypes.node).isRequired
};

const toIdMap = items => items.reduce((last, item) => ({
    ...last,
    [item.id]: item
}), {});

function StepValues({
    typeFilter,
    name,
    containerProps,
    item,
    categories,
    subcategories,
    onEdit
}) {
    const isLiability = typeFilter === 'liability';
    const categoriesByType = useMemo(() => categories.filter(({ type }) => type === typeFilter), [categories, typeFilter]);

    const categoriesById = useMemo(() => toIdMap(categoriesByType), [categoriesByType]);
    const subcategoriesById = useMemo(() => toIdMap(subcategories), [subcategories]);

    const valuesByType = useMemo(
        () => item.values
            .map(({ subcategory, ...rest }) => {
                const { categoryId } = subcategoriesById[subcategory];
                const category = categoriesById[categoryId];

                return { subcategory, category, ...rest };
            })
            .filter(({ category }) => category)
            .reduce((last, value) => ({
                ...last,
                [value.category.id]: (last[value.category.id] || []).concat([value])
            }), {}),
        [categoriesById, subcategoriesById, item.values]
    );

    const valueKeys = useMemo(
        () => Object.keys(valuesByType).sort((idA, idB) => {
            if (categoriesById[idA].category < categoriesById[idB].category) {
                return -1;
            }
            if (categoriesById[idA].category < categoriesById[idB].category) {
                return 1;
            }

            return 0;
        }),
        [valuesByType, categoriesById]
    );

    const availableSubcategories = useMemo(() => subcategories.filter(({ id: subcategoryId, categoryId }) =>
        categoriesByType.some(({ id }) => id === categoryId) &&
        !Object.keys(valuesByType).some(key => valuesByType[key].some(({ subcategory }) => subcategory === subcategoryId))
    ), [subcategories, categoriesByType, valuesByType]);

    const availableCategories = useMemo(() => categoriesByType.filter(({ id }) =>
        availableSubcategories.some(({ categoryId }) => categoryId === id)
    ), [categoriesByType, availableSubcategories]);

    const onAddValue = useAddValue(item, onEdit);
    const onChangeValue = useChangeValue(item, onEdit);
    const onRemoveValue = useRemoveValue(item, onEdit);

    return (
        <FormContainer {...containerProps} className="step-values">
            <h5 className="net-worth-edit-form-section-title">
                <span className="type">{name}</span>
                <span className="date">{' - '}{item.date}</span>
            </h5>
            <div className="edit-by-category">
                {valueKeys.map(categoryId => (
                    <CategoryGroup key={categoryId}
                        category={categories.find(({ id: otherCategoryId }) => otherCategoryId === categoryId)}
                    >
                        {valuesByType[categoryId].map(value => (
                            <EditByType key={value.id}
                                isLiability={isLiability}
                                categories={categoriesByType}
                                subcategories={subcategories}
                                creditLimit={item.creditLimit}
                                currencies={item.currencies}
                                value={value}
                                onChange={onChangeValue}
                                onRemove={onRemoveValue}
                            />
                        ))}
                    </CategoryGroup>
                ))}
                {availableCategories.length && <AddByType key="add"
                    isLiability={isLiability}
                    categories={availableCategories}
                    subcategories={availableSubcategories}
                    currencies={item.currencies}
                    onAdd={onAddValue}
                /> || null}
            </div>
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
    onEdit: PropTypes.func.isRequired
};

export const StepAssets = props => (
    <StepValues {...props} typeFilter="asset" name="Assets" />
);

export const StepLiabilities = props => (
    <StepValues {...props} typeFilter="liability" name="Liabilities" />
);
