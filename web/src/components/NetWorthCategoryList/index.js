import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CrudList from '~client/components/CrudList';
import FormFieldText from '~client/components/FormField';
import FormFieldSelect from '~client/components/FormField/select';
import FormFieldColor from '~client/components/FormField/color';
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
    const [tempType, setTempType] = useState(type);
    const [tempCategory, setTempCategory] = useState(category);
    const [tempColor, setTempColor] = useState(color);

    const touched = !(tempType === type && tempCategory === category && tempColor === color);

    const onChangeItem = useCallback(() => onChange({
        type: tempType,
        category: tempCategory,
        color: tempColor
    }), [onChange, tempType, tempCategory, tempColor]);

    return (
        <span
            className={classNames('net-worth-category-item-form', {
                touched,
                asset: type === 'asset',
                liability: type === 'liability'
            })}
            style={{ backgroundColor: tempColor }}
        >
            <FormFieldSelect
                item="type"
                options={typeOptions}
                value={tempType}
                onChange={setTempType}
            />
            <FormFieldText
                item="category"
                value={tempCategory}
                onChange={setTempCategory}
            />
            <FormFieldColor
                value={tempColor}
                onChange={setTempColor}
            />
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
    onUpdateSubcategory,
    onDeleteSubcategory
}) {
    const onChange = useCallback(values => {
        onUpdate(item.id, values);
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
    onUpdateSubcategory: PropTypes.func.isRequired,
    onDeleteSubcategory: PropTypes.func.isRequired
};

const NetWorthCategoryCreateItem = ({ onCreate }) => (
    <NetWorthCategoryItemForm
        onChange={onCreate}
        buttonText="Create"
    />
);

NetWorthCategoryCreateItem.propTypes = {
    onCreate: PropTypes.func.isRequired
};

export default function NetWorthCategoryList({
    categories,
    subcategories,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory
}) {
    const extraProps = {
        categories,
        subcategories,
        onCreateSubcategory,
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
    onUpdateCategory: PropTypes.func.isRequired,
    onDeleteCategory: PropTypes.func.isRequired,
    onCreateSubcategory: PropTypes.func.isRequired,
    onUpdateSubcategory: PropTypes.func.isRequired,
    onDeleteSubcategory: PropTypes.func.isRequired
};
