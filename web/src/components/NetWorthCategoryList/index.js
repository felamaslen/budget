import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { InlineFlexCenter } from '~client/styled/shared/layout';
import { Button, ButtonDelete } from '~client/styled/shared/button';
import CrudList from '~client/components/CrudList';
import FormFieldText from '~client/components/FormField';
import FormFieldSelect from '~client/components/FormField/select';
import FormFieldColor from '~client/components/FormField/color';
import NetWorthSubcategoryList from '~client/components/NetWorthSubcategoryList';
import {
    category as categoryShape,
    subcategory as subcategoryShape,
} from '~client/prop-types/net-worth/category';
import { CREATE_ID } from '~client/constants/data';

import * as Styled from './styles';

const typeOptions = [
    { internal: 'asset', external: 'Asset' },
    { internal: 'liability', external: 'Liability' },
];

function NetWorthCategoryItemForm({ item: { id, type, category, color }, onChange, buttonText }) {
    const [tempType, setTempType] = useState(type);
    const [tempCategory, setTempCategory] = useState(category);
    const [tempColor, setTempColor] = useState(color);

    const touched =
        id === CREATE_ID ||
        !(tempType === type && tempCategory === category && tempColor === color);

    const onChangeItem = useCallback(
        () =>
            onChange({
                type: tempType,
                category: tempCategory,
                color: tempColor,
            }),
        [onChange, tempType, tempCategory, tempColor],
    );

    return (
        <Styled.CategoryItemForm style={{ backgroundColor: tempColor }}>
            <FormFieldSelect
                item="type"
                options={typeOptions}
                value={tempType}
                onChange={setTempType}
            />
            <FormFieldText item="category" value={tempCategory} onChange={setTempCategory} />
            <FormFieldColor value={tempColor} onChange={setTempColor} />
            <Button disabled={!touched} onClick={onChangeItem}>
                {buttonText}
            </Button>
        </Styled.CategoryItemForm>
    );
}

NetWorthCategoryItemForm.propTypes = {
    item: categoryShape,
    buttonText: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

NetWorthCategoryItemForm.defaultProps = {
    item: {
        id: CREATE_ID,
        type: 'asset',
        category: 'Cash',
        color: '#ccffcc',
    },
};

function NetWorthCategoryItem({
    item,
    style,
    onUpdate,
    onDelete,
    categories,
    subcategories,
    expanded,
    onExpandToggle,
    onCreateSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory,
}) {
    const onChange = useCallback(
        values => {
            onUpdate(item.id, values);
        },
        [onUpdate, item.id],
    );

    const categorySubcategories = useMemo(
        () => subcategories.filter(({ categoryId }) => categoryId === item.id),
        [item.id, subcategories],
    );

    const parent = useMemo(() => categories.find(({ id: categoryId }) => categoryId === item.id), [
        item.id,
        categories,
    ]);

    const itemStyle = useMemo(() => ({ ...style, backgroundColor: item.color }), [
        style,
        item.color,
    ]);

    const onExpand = useCallback(() => onExpandToggle(item.id), [onExpandToggle, item.id]);

    return (
        <Styled.CategoryItem style={itemStyle}>
            <Styled.CategoryItemMain>
                <Styled.ToggleVisibility>
                    <Button expanded={expanded} onClick={onExpand} />
                </Styled.ToggleVisibility>
                <NetWorthCategoryItemForm
                    key="category-form"
                    item={item}
                    onChange={onChange}
                    buttonText="Update"
                />
                <InlineFlexCenter>
                    <ButtonDelete onClick={onDelete}>&minus;</ButtonDelete>
                </InlineFlexCenter>
            </Styled.CategoryItemMain>
            {expanded === item.id && (
                <NetWorthSubcategoryList
                    key="subcategory-list"
                    parent={parent}
                    subcategories={categorySubcategories}
                    onCreate={onCreateSubcategory}
                    onUpdate={onUpdateSubcategory}
                    onDelete={onDeleteSubcategory}
                />
            )}
        </Styled.CategoryItem>
    );
}

NetWorthCategoryItem.propTypes = {
    item: categoryShape.isRequired,
    style: PropTypes.object,
    expanded: PropTypes.string,
    onExpandToggle: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(categoryShape),
    subcategories: PropTypes.arrayOf(subcategoryShape),
    onCreateSubcategory: PropTypes.func.isRequired,
    onUpdateSubcategory: PropTypes.func.isRequired,
    onDeleteSubcategory: PropTypes.func.isRequired,
};

NetWorthCategoryItem.defaultProps = {
    style: {},
};

const NetWorthCategoryCreateItem = ({ onCreate }) => (
    <Styled.CategoryItem>
        <NetWorthCategoryItemForm onChange={onCreate} buttonText="Create" />
    </Styled.CategoryItem>
);

NetWorthCategoryCreateItem.propTypes = {
    onCreate: PropTypes.func.isRequired,
};

export default function NetWorthCategoryList({
    categories,
    subcategories,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory,
}) {
    const [expanded, setExpanded] = useState(null);
    const onExpandToggle = useCallback(
        id =>
            setExpanded(last => {
                if (last === id) {
                    return null;
                }

                return id;
            }),
        [],
    );

    const extraProps = {
        categories,
        subcategories,
        expanded,
        onExpandToggle,
        onCreateSubcategory,
        onUpdateSubcategory,
        onDeleteSubcategory,
    };

    if (!(categories && subcategories)) {
        return null;
    }

    return (
        <Styled.CategoryList>
            <CrudList
                items={categories}
                real
                Item={NetWorthCategoryItem}
                CreateItem={NetWorthCategoryCreateItem}
                onCreate={onCreateCategory}
                onUpdate={onUpdateCategory}
                onDelete={onDeleteCategory}
                extraProps={extraProps}
            />
        </Styled.CategoryList>
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
    onDeleteSubcategory: PropTypes.func.isRequired,
};
