import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useInputText, useInputSelect, useInputColor } from '~client/hooks/form';
import CrudList from '~client/components/CrudList';
import NetWorthSubcategoryList from '~client/components/NetWorthSubcategoryList';
import {
    category as categoryShape,
    subcategory as subcategoryShape
} from '~client/prop-types/net-worth/category';
import { CREATE_ID } from '~client/constants/data';

import './style.scss';

const typeOptions = [
    { internal: 'asset', external: 'Asset' },
    { internal: 'liability', external: 'Liability' }
];

function NetWorthCategoryItemForm({
    item: { type, category, color },
    onChange,
    buttonText
}) {
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
        <span className={className}>
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
    item: categoryShape,
    buttonText: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

NetWorthCategoryItemForm.defaultProps = {
    item: {
        id: CREATE_ID,
        type: 'asset',
        category: 'Cash',
        color: '#ccffcc'
    }
};

function NetWorthCategoryItem({
    item,
    active,
    onUpdate,
    categories,
    subcategories,
    onCreateSubcategory,
    onReadSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory
}) {
    const onChange = useCallback(values => {
        onUpdate(item.id, {}, values);
    }, [onUpdate, item.id]);

    const categorySubcategories = useMemo(() => subcategories.filter(
        ({ categoryId }) => categoryId === item.id
    ), [item.id, subcategories]);

    const parent = useMemo(() => categories.find(
        ({ id: categoryId }) => categoryId === item.id
    ), [item.id, categories]);

    return <>
        <NetWorthCategoryItemForm
            key="category-form"
            item={item}
            onChange={onChange}
            buttonText="Update"
        />
        {active && <NetWorthSubcategoryList
            key="subcategory-list"
            parent={parent}
            subcategories={categorySubcategories}
            onCreate={onCreateSubcategory}
            onRead={onReadSubcategory}
            onUpdate={onUpdateSubcategory}
            onDelete={onDeleteSubcategory}
        />}
    </>;
}

NetWorthCategoryItem.propTypes = {
    item: categoryShape.isRequired,
    active: PropTypes.bool.isRequired,
    onUpdate: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(categoryShape),
    subcategories: PropTypes.arrayOf(subcategoryShape),
    onCreateSubcategory: PropTypes.func.isRequired,
    onReadSubcategory: PropTypes.func.isRequired,
    onUpdateSubcategory: PropTypes.func.isRequired,
    onDeleteSubcategory: PropTypes.func.isRequired
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
    const extraProps = {
        categories,
        subcategories,
        onCreateSubcategory,
        onReadSubcategory,
        onUpdateSubcategory,
        onDeleteSubcategory
    };

    const itemProps = useCallback(({ color }) => ({
        style: {
            backgroundColor: color
        }
    }), []);

    if (!(categories && subcategories)) {
        return null;
    }

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
                className="net-worth-category"
                itemProps={itemProps}
                extraProps={extraProps}
            />
        </div>
    );
}

NetWorthCategoryList.propTypes = {
    categories: PropTypes.arrayOf(categoryShape),
    subcategories: PropTypes.arrayOf(subcategoryShape),
    onCreateCategory: PropTypes.func.isRequired,
    onReadCategory: PropTypes.func.isRequired,
    onUpdateCategory: PropTypes.func.isRequired,
    onDeleteCategory: PropTypes.func.isRequired,
    onCreateSubcategory: PropTypes.func.isRequired,
    onReadSubcategory: PropTypes.func.isRequired,
    onUpdateSubcategory: PropTypes.func.isRequired,
    onDeleteSubcategory: PropTypes.func.isRequired
};
