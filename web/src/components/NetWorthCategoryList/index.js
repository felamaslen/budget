import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useInputText, useInputSelect, useInputColor } from '~client/hooks/form';
import CrudList from '~client/components/CrudList';
import NetWorthSubcategoryList, { subcategoryShape } from '~client/components/NetWorthSubcategoryList';

import './style.scss';

const categoryShape = {
    type: PropTypes.oneOf(['asset', 'liability']).isRequired,
    category: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
};

const typeOptions = [
    { internal: 'asset', external: 'Asset' },
    { internal: 'liability', external: 'Liability' }
];

function NetWorthCategoryItemForm({ type, category, color, onChange, buttonText }) {
    const [tempType, InputType, touchedType] = useInputSelect(type, typeOptions, {
        className: 'input-type'
    });
    const [tempCategory, InputCategory, touchedCategory] = useInputText(category, {
        className: 'input-category'
    });
    const [tempColor, InputColor, touchedColor] = useInputColor(color, {
        className: 'input-color'
    });

    const touched = touchedType || touchedCategory || touchedColor;

    const style = {
        backgroundColor: tempColor
    };

    const className = classNames('net-worth-category-item-form', {
        touched,
        asset: type === 'asset',
        liability: type === 'liability'
    });

    const onChangeItem = useCallback(() => {
        onChange({
            type: tempType,
            category: tempCategory,
            color: tempColor
        });
    }, [onChange, tempType, tempCategory, tempColor]);

    return (
        <span className={className} style={style}>
            {InputType}
            {InputCategory}
            {InputColor}
            <button
                disabled={!touched}
                className="button-change"
                onClick={onChangeItem}
            >{buttonText}</button>
        </span>
    );
}

NetWorthCategoryItemForm.propTypes = {
    buttonText: PropTypes.string.isRequired,
    ...categoryShape
};

NetWorthCategoryItemForm.defaultProps = {
    type: 'asset',
    category: 'Cash',
    color: '#ccffcc'
};

function NetWorthCategoryItem({
    id,
    type,
    category,
    color,
    onUpdate,
    categories,
    subcategories,
    categoryIdMap,
    onCreateSubcategory,
    onReadSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory
}) {
    const onChange = useCallback(values => {
        onUpdate(id, {}, values);
    }, [onUpdate, id]);

    const categorySubcategories = useMemo(() => subcategories.filter(
        ({ categoryId }) => categoryId === id
    ), [id, subcategories]);

    const parent = useMemo(() => categories.find(
        ({ id: categoryId }) => categoryId === id
    ), [id, categories]);

    return <>
        <NetWorthCategoryItemForm
            key="category-form"
            type={type}
            category={category}
            color={color}
            onChange={onChange}
            buttonText="Update"
        />
        <NetWorthSubcategoryList
            key="subcategory-list"
            parent={parent}
            categoryIdMap={categoryIdMap}
            subcategories={categorySubcategories}
            onCreate={onCreateSubcategory}
            onRead={onReadSubcategory}
            onUpdate={onUpdateSubcategory}
            onDelete={onDeleteSubcategory}
        />
    </>;
}

NetWorthCategoryItem.propTypes = {
    id: PropTypes.number.isRequired,
    onUpdate: PropTypes.func.isRequired,
    subcategories: PropTypes.arrayOf(PropTypes.shape(subcategoryShape)),
    categoryIdMap: PropTypes.array.isRequired,
    onCreateSubcategory: PropTypes.func.isRequired,
    onReadSubcategory: PropTypes.func.isRequired,
    onUpdateSubcategory: PropTypes.func.isRequired,
    onDeleteSubcategory: PropTypes.func.isRequired,
    ...categoryShape
};

function NetWorthCategoryCreateItem({ onCreate }) {
    const onChange = useCallback(values => {
        onCreate(null, {}, values);
    }, [onCreate]);

    return (
        <NetWorthCategoryItemForm
            onChange={onChange}
            buttonText="Create"
        />
    );
}

NetWorthCategoryCreateItem.propTypes = {
    onCreate: PropTypes.func.isRequired
};

export default function NetWorthCategoryList({
    categories,
    subcategories,
    onCreateCategory,
    onReadCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateSubcategory,
    onReadSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory
}) {
    const categoryIdMap = categories.map(({ id, type, category }) => ({
        categoryId: id,
        type,
        category
    }));

    const extraProps = {
        categories,
        subcategories,
        categoryIdMap,
        onCreateSubcategory,
        onReadSubcategory,
        onUpdateSubcategory,
        onDeleteSubcategory
    };

    return (
        <div className="net-worth-category-list">
            <h4 className="title">{'Categories'}</h4>
            <CrudList
                items={categories}
                Item={NetWorthCategoryItem}
                CreateItem={NetWorthCategoryCreateItem}
                onCreate={onCreateCategory}
                onRead={onReadCategory}
                onUpdate={onUpdateCategory}
                onDelete={onDeleteCategory}
                extraProps={extraProps}
            />
        </div>
    );
}

NetWorthCategoryList.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.shape(categoryShape)),
    subcategories: PropTypes.arrayOf(PropTypes.shape(subcategoryShape)),
    onCreateCategory: PropTypes.func.isRequired,
    onReadCategory: PropTypes.func.isRequired,
    onUpdateCategory: PropTypes.func.isRequired,
    onDeleteCategory: PropTypes.func.isRequired,
    onCreateSubcategory: PropTypes.func.isRequired,
    onReadSubcategory: PropTypes.func.isRequired,
    onUpdateSubcategory: PropTypes.func.isRequired,
    onDeleteSubcategory: PropTypes.func.isRequired
};
