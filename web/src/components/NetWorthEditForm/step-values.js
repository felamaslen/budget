import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

import { replaceAtIndex } from '~client/modules/data';
import {
    currency,
    creditLimit as creditLimitShape,
    netWorthItem,
    netWorthValue,
} from '~client/prop-types/net-worth/list';
import {
    category as categoryShape,
    subcategory as subcategoryShape,
} from '~client/prop-types/net-worth/category';
import { ButtonAdd, ButtonDelete } from '~client/styled/shared/button';
import FormFieldNetWorthValue from '~client/components/FormField/net-worth-value';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldSelect from '~client/components/FormField/select';
import FormContainer from '~client/components/NetWorthEditForm/form-container';
import { STEP_VALUES } from './constants';

import * as Styled from './styles';

function CreditLimitEditor({ creditLimit, setCreditLimit }) {
    return (
        <div>
            <span>{'Credit limit:'}</span>
            <FormFieldCost value={creditLimit || 0} onChange={setCreditLimit} small />
        </div>
    );
}

CreditLimitEditor.propTypes = {
    creditLimit: PropTypes.number,
    setCreditLimit: PropTypes.func.isRequired,
};

const SkipToggle = ({ skip, setSkip }) => (
    <div>
        <input type="checkbox" checked={Boolean(skip)} onChange={() => setSkip(!skip)} />
        <span>{'Skip in calculations'}</span>
    </div>
);

SkipToggle.propTypes = {
    skip: PropTypes.bool,
    setSkip: PropTypes.func.isRequired,
};

function EditByType({
    isLiability,
    subcategories,
    creditLimit: creditLimitList,
    currencies,
    value: { id, subcategory, skip, value },
    onChange,
    onRemove,
}) {
    const { subcategory: subcategoryName, hasCreditLimit } = subcategories.find(
        ({ id: subcategoryId }) => subcategoryId === subcategory,
    );

    const { value: initialCreditLimit } = creditLimitList.find(
        ({ subcategory: subcategoryId }) => subcategoryId === subcategory,
    ) || { value: null };

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
        <Styled.EditByCategoryValue>
            <Styled.Subcategory>{subcategoryName}</Styled.Subcategory>
            <FormFieldNetWorthValue value={value} onChange={setNewValue} currencies={currencies} />
            {hasCreditLimit && (
                <CreditLimitEditor creditLimit={creditLimit} setCreditLimit={setCreditLimit} />
            )}
            {isLiability && <SkipToggle skip={skip} setSkip={setSkip} />}
            <ButtonDelete onClick={onRemoveCallback}>&minus;</ButtonDelete>
        </Styled.EditByCategoryValue>
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
    onRemove: PropTypes.func.isRequired,
};

const getFirstOption = options => (options[0] || {}).internal;

function AddByType({ isLiability, categories, subcategories, currencies, onAdd }) {
    const categoryOptions = useMemo(
        () =>
            categories.map(({ id, category }) => ({
                internal: String(id),
                external: category,
            })),
        [categories],
    );

    const [category, setCategory] = useState(getFirstOption(categoryOptions));

    const subcategoryOptions = useMemo(
        () =>
            subcategories
                .filter(({ categoryId }) => categoryId === category)
                .map(({ id, subcategory }) => ({
                    internal: id,
                    external: subcategory,
                })),
        [category, subcategories],
    );

    const [subcategory, setSubcategory] = useState(getFirstOption(subcategoryOptions));

    const [value, setValue] = useState(0);
    const [skip, setSkip] = useState(null);

    const { hasCreditLimit } = useMemo(
        () => subcategories.find(({ id }) => id === subcategory) || {},
        [subcategories, subcategory],
    );
    const initialCreditLimit = hasCreditLimit ? 0 : null;
    const [creditLimit, setCreditLimit] = useState(initialCreditLimit);

    const onAddCallback = useCallback(() => {
        onAdd(value, creditLimit, subcategory, skip);
    }, [onAdd, subcategory, value, creditLimit, skip]);

    return (
        <Styled.AddByCategoryValue>
            <Styled.AddCategory>
                <Styled.AddLabel>{'Category:'}</Styled.AddLabel>
                <FormFieldSelect
                    item="category"
                    options={categoryOptions}
                    value={category}
                    onChange={setCategory}
                />
            </Styled.AddCategory>
            <Styled.AddSubcategory>
                <Styled.AddLabel>{'Subcategory:'}</Styled.AddLabel>
                <FormFieldSelect
                    item="subcategory"
                    options={subcategoryOptions}
                    value={subcategory}
                    onChange={setSubcategory}
                />
            </Styled.AddSubcategory>
            <FormFieldNetWorthValue value={value} onChange={setValue} currencies={currencies} />
            {hasCreditLimit && (
                <CreditLimitEditor creditLimit={creditLimit} setCreditLimit={setCreditLimit} />
            )}
            {isLiability && <SkipToggle skip={skip} setSkip={setSkip} />}
            <ButtonAdd onClick={onAddCallback}>{'+'}</ButtonAdd>
        </Styled.AddByCategoryValue>
    );
}

AddByType.propTypes = {
    isLiability: PropTypes.bool.isRequired,
    categories: PropTypes.arrayOf(categoryShape.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    currencies: PropTypes.arrayOf(currency.isRequired).isRequired,
    onAdd: PropTypes.func.isRequired,
};

function appendCreditLimit(item, subcategory, value) {
    const index = item.creditLimit.findIndex(
        ({ subcategory: subcategoryId }) => subcategoryId === subcategory,
    );
    const creditLimit = { subcategory, value };
    if (index === -1) {
        return item.creditLimit.concat([creditLimit]);
    }

    return replaceAtIndex(item.creditLimit, index, creditLimit);
}

function useAddValue(item, onEdit) {
    return useCallback(
        (newValue, creditLimit, subcategory, skip = null) => {
            const itemWithValue = {
                ...item,
                values: item.values.concat([
                    {
                        id: shortid.generate(),
                        subcategory,
                        skip,
                        value: newValue,
                    },
                ]),
            };

            if (creditLimit === null) {
                onEdit(itemWithValue);
            } else {
                onEdit({
                    ...itemWithValue,
                    creditLimit: appendCreditLimit(item, subcategory, creditLimit),
                });
            }
        },
        [item, onEdit],
    );
}

function useChangeValue(item, onEdit) {
    return useCallback(
        (id, newValue, creditLimit, skip = null) => {
            const index = item.values.findIndex(({ id: valueId }) => valueId === id);
            const itemWithValue = {
                ...item,
                values: replaceAtIndex(item.values, index, {
                    ...item.values[index],
                    skip,
                    value: newValue,
                }),
            };

            if (creditLimit === null) {
                onEdit(itemWithValue);
            } else {
                const creditLimitIndex = item.creditLimit.findIndex(
                    ({ subcategory }) => subcategory === item.values[index].subcategory,
                );

                onEdit({
                    ...itemWithValue,
                    creditLimit: replaceAtIndex(item.creditLimit, creditLimitIndex, {
                        ...item.creditLimit[creditLimitIndex],
                        value: creditLimit,
                    }),
                });
            }
        },
        [item, onEdit],
    );
}

function useRemoveValue(item, onEdit) {
    return useCallback(
        id => {
            const index = item.values.findIndex(({ id: valueId }) => valueId === id);
            const newItemValues = item.values.filter(({ id: valueId }) => valueId !== id);
            const creditLimit = item.creditLimit.filter(
                ({ subcategory }) => subcategory !== item.values[index].subcategory,
            );
            onEdit({ ...item, values: newItemValues, creditLimit });
        },
        [item, onEdit],
    );
}

function CategoryGroup({ category: { category, color }, children }) {
    const [hidden, setHidden] = useState(true);
    const onToggleHidden = useCallback(() => setHidden(!hidden), [hidden]);

    return (
        <Styled.EditByCategoryGroup style={{ backgroundColor: color }}>
            <Styled.SectionSubtitle hidden={hidden} onClick={onToggleHidden}>
                {category}
            </Styled.SectionSubtitle>
            {!hidden && children}
        </Styled.EditByCategoryGroup>
    );
}

CategoryGroup.propTypes = {
    category: categoryShape.isRequired,
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

const toIdMap = items =>
    items.reduce(
        (last, item) => ({
            ...last,
            [item.id]: item,
        }),
        {},
    );

function StepValues({ typeFilter, name, containerProps, item, categories, subcategories, onEdit }) {
    const isLiability = typeFilter === 'liability';
    const categoriesByType = useMemo(() => categories.filter(({ type }) => type === typeFilter), [
        categories,
        typeFilter,
    ]);

    const categoriesById = useMemo(() => toIdMap(categoriesByType), [categoriesByType]);
    const subcategoriesById = useMemo(() => toIdMap(subcategories), [subcategories]);

    const valuesByType = useMemo(
        () =>
            item.values
                .map(({ subcategory, ...rest }) => {
                    const { categoryId } = subcategoriesById[subcategory];
                    const category = categoriesById[categoryId];

                    return { subcategory, category, ...rest };
                })
                .filter(({ category }) => category)
                .reduce(
                    (last, value) => ({
                        ...last,
                        [value.category.id]: (last[value.category.id] || []).concat([value]),
                    }),
                    {},
                ),
        [categoriesById, subcategoriesById, item.values],
    );

    const valueKeys = useMemo(
        () =>
            Object.keys(valuesByType).sort((idA, idB) => {
                if (categoriesById[idA].category < categoriesById[idB].category) {
                    return -1;
                }
                if (categoriesById[idA].category < categoriesById[idB].category) {
                    return 1;
                }

                return 0;
            }),
        [valuesByType, categoriesById],
    );

    const availableSubcategories = useMemo(
        () =>
            subcategories.filter(
                ({ id: subcategoryId, categoryId }) =>
                    categoriesByType.some(({ id }) => id === categoryId) &&
                    !Object.keys(valuesByType).some(key =>
                        valuesByType[key].some(({ subcategory }) => subcategory === subcategoryId),
                    ),
            ),
        [subcategories, categoriesByType, valuesByType],
    );

    const availableCategories = useMemo(
        () =>
            categoriesByType.filter(({ id }) =>
                availableSubcategories.some(({ categoryId }) => categoryId === id),
            ),
        [categoriesByType, availableSubcategories],
    );

    const onAddValue = useAddValue(item, onEdit);
    const onChangeValue = useChangeValue(item, onEdit);
    const onRemoveValue = useRemoveValue(item, onEdit);

    return (
        <FormContainer {...containerProps} step={STEP_VALUES}>
            <Styled.SectionTitle>
                <span>{name}</span>
                <span>
                    {' - '}
                    {item.date.toISODate()}
                </span>
            </Styled.SectionTitle>
            <Styled.EditByCategory>
                {valueKeys.map(categoryId => (
                    <CategoryGroup
                        key={categoryId}
                        category={categories.find(
                            ({ id: otherCategoryId }) => otherCategoryId === categoryId,
                        )}
                    >
                        {valuesByType[categoryId].map(value => (
                            <EditByType
                                key={value.id}
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
                {availableCategories.length > 0 && (
                    <AddByType
                        key="add"
                        isLiability={isLiability}
                        categories={availableCategories}
                        subcategories={availableSubcategories}
                        currencies={item.currencies}
                        onAdd={onAddValue}
                    />
                )}
            </Styled.EditByCategory>
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
};

export const StepAssets = props => <StepValues {...props} typeFilter="asset" name="Assets" />;

export const StepLiabilities = props => (
    <StepValues {...props} typeFilter="liability" name="Liabilities" />
);
