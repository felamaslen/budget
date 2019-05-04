import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useInputText, useInputSelect, useInputTickbox, useInputRange } from '~client/hooks/form';
import CrudList, { crudListPropTypes } from '~client/components/CrudList';

import './style.scss';

export const subcategoryShape = {
    categoryId: PropTypes.number.isRequired,
    subcategory: PropTypes.string.isRequired,
    hasCreditLimit: PropTypes.bool,
    opacity: PropTypes.number.isRequired
};

function NetWorthSubcategoryItemForm({
    categoryId,
    subcategory,
    hasCreditLimit,
    opacity,
    categoryIdMap,
    onChange,
    buttonText
}) {
    const categoryIdOptions = useMemo(() => categoryIdMap.map(
        ({ categoryId: internal, category: external }) => ({ internal, external })
    ), [categoryIdMap]);

    const [
        tempCategoryIdString,
        InputCategoryId,
        touchedCategoryId
    ] = useInputSelect(String(categoryId), categoryIdOptions, {
        className: 'input-category-id'
    });

    const tempCategoryId = Number(tempCategoryIdString);

    const [
        tempSubcategory,
        InputSubcategory,
        touchedSubcategory
    ] = useInputText(subcategory, {
        className: 'input-subcategory'
    });

    const tempParent = categoryIdMap.find(({ categoryId: id }) => id === tempCategoryId);

    const creditLimitDisabled = tempParent.type !== 'liability';

    const initialHasCreditLimit = creditLimitDisabled
        ? null
        : hasCreditLimit;

    const hasCreditLimitProps = {
        className: 'input-has-credit-limit',
        disabled: creditLimitDisabled
    };

    const [
        tempHasCreditLimit,
        InputHasCreditLimit,
        touchedHasCreditLimit
    ] = useInputTickbox(initialHasCreditLimit, hasCreditLimitProps);

    const [
        tempOpacity,
        InputOpacity,
        touchedOpacity
    ] = useInputRange(opacity, {
        min: 0,
        max: 1,
        step: 0.1
    });

    const touched = touchedCategoryId ||
        touchedSubcategory ||
        touchedHasCreditLimit ||
        touchedOpacity;

    const className = classNames('net-worth-subcategory-item-form', {
        touched
    });

    const onChangeItem = useCallback(() => {
        onChange({
            categoryId: tempCategoryId,
            subcategory: tempSubcategory,
            hasCreditLimit: tempHasCreditLimit,
            opacity: tempOpacity
        });
    }, [onChange, tempCategoryId, tempSubcategory, tempHasCreditLimit, tempOpacity]);

    return (
        <span className={className}>
            {InputCategoryId}
            {InputSubcategory}
            {InputHasCreditLimit}
            {InputOpacity}
            <button
                disabled={!touched}
                className="button-change"
                onClick={onChangeItem}
            >{buttonText}</button>
        </span>
    );
}

NetWorthSubcategoryItemForm.propTypes = {
    buttonText: PropTypes.string.isRequired,
    categoryId: PropTypes.number.isRequired,
    subcategory: PropTypes.string,
    hasCreditLimit: PropTypes.bool,
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    parent: PropTypes.shape({
        type: PropTypes.oneOf(['asset', 'liability']).isRequired
    }).isRequired,
    categoryIdMap: PropTypes.arrayOf(PropTypes.shape({
        categoryId: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['asset', 'liability']).isRequired,
        category: PropTypes.string.isRequired
    })).isRequired
};

NetWorthSubcategoryItemForm.defaultProps = {
    subcategory: 'Some bank account',
    opacity: 0.8
};

function NetWorthSubcategoryItem({
    id,
    categoryId,
    subcategory,
    opacity,
    parent,
    categoryIdMap,
    onUpdate
}) {
    const onChange = useCallback(values => {
        onUpdate(id, {}, values);
    }, [onUpdate, id]);

    return (
        <NetWorthSubcategoryItemForm
            parent={parent}
            categoryIdMap={categoryIdMap}
            categoryId={categoryId}
            subcategory={subcategory}
            opacity={opacity}
            onChange={onChange}
            buttonText="Update"
        />
    );
}

NetWorthSubcategoryItem.propTypes = {
    id: PropTypes.number.isRequired,
    parent: PropTypes.object.isRequired,
    categoryIdMap: PropTypes.array.isRequired,
    onUpdate: PropTypes.func.isRequired,
    ...subcategoryShape
};

function NetWorthSubcategoryCreateItem({ parent, categoryIdMap, onCreate }) {
    const onChange = useCallback(values => {
        onCreate(null, {}, values);
    }, [onCreate]);

    return (
        <NetWorthSubcategoryItemForm
            parent={parent}
            categoryIdMap={categoryIdMap}
            categoryId={parent.id}
            onChange={onChange}
            buttonText="Create"
        />
    );
}

NetWorthSubcategoryCreateItem.propTypes = {
    parent: PropTypes.object.isRequired,
    categoryIdMap: PropTypes.array.isRequired,
    onCreate: PropTypes.func.isRequired
};

export default function NetWorthSubcategoryList({
    parent,
    categoryIdMap,
    subcategories,
    onCreate,
    onRead,
    onUpdate,
    onDelete
}) {
    const extraProps = {
        parent,
        categoryIdMap
    };

    return (
        <div className="net-worth-subcategory-list">
            <h5 className="subtitle">{'Subcategories'}</h5>
            <CrudList
                items={subcategories}
                Item={NetWorthSubcategoryItem}
                CreateItem={NetWorthSubcategoryCreateItem}
                onCreate={onCreate}
                onRead={onRead}
                onUpdate={onUpdate}
                onDelete={onDelete}
                extraProps={extraProps}
            />
        </div>
    );
}

NetWorthSubcategoryList.propTypes = {
    subcategories: PropTypes.arrayOf(PropTypes.shape(subcategoryShape)).isRequired,
    categoryIdMap: PropTypes.array.isRequired,
    parent: PropTypes.object.isRequired,
    ...crudListPropTypes
};
