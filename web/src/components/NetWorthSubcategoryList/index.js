import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useInputText, useInputTickbox, useInputRange } from '~client/hooks/form';
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
    parent,
    onChange,
    buttonText
}) {
    const [
        tempSubcategory,
        InputSubcategory,
        touchedSubcategory
    ] = useInputText(subcategory, {
        className: 'input-subcategory'
    });

    const creditLimitDisabled = parent.type !== 'liability';

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

    const touched = touchedSubcategory ||
        touchedHasCreditLimit ||
        touchedOpacity;

    const className = classNames('net-worth-subcategory-item-form', {
        touched
    });

    const onChangeItem = useCallback(() => {
        onChange({
            categoryId,
            subcategory: tempSubcategory,
            hasCreditLimit: tempHasCreditLimit,
            opacity: tempOpacity
        });
    }, [onChange, categoryId, tempSubcategory, tempHasCreditLimit, tempOpacity]);

    return (
        <span className={className}>
            {InputSubcategory}
            {!creditLimitDisabled && InputHasCreditLimit}
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
    }).isRequired
};

NetWorthSubcategoryItemForm.defaultProps = {
    subcategory: 'Some bank account',
    opacity: 0.8
};

function NetWorthSubcategoryItem({
    id,
    categoryId,
    subcategory,
    hasCreditLimit,
    opacity,
    parent,
    onUpdate
}) {
    const onChange = useCallback(values => {
        onUpdate(id, {}, values);
    }, [onUpdate, id]);

    return (
        <NetWorthSubcategoryItemForm
            parent={parent}
            categoryId={categoryId}
            subcategory={subcategory}
            hasCreditLimit={hasCreditLimit}
            opacity={opacity}
            onChange={onChange}
            buttonText="Update"
        />
    );
}

NetWorthSubcategoryItem.propTypes = {
    id: PropTypes.number.isRequired,
    parent: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    ...subcategoryShape
};

function NetWorthSubcategoryCreateItem({ parent, onCreate }) {
    const onChange = useCallback(values => {
        onCreate(null, {}, values);
    }, [onCreate]);

    return (
        <NetWorthSubcategoryItemForm
            parent={parent}
            categoryId={parent.id}
            onChange={onChange}
            buttonText="Create"
        />
    );
}

NetWorthSubcategoryCreateItem.propTypes = {
    parent: PropTypes.object.isRequired,
    onCreate: PropTypes.func.isRequired
};

export default function NetWorthSubcategoryList({
    parent,
    subcategories,
    onCreate,
    onRead,
    onUpdate,
    onDelete
}) {
    const extraProps = {
        parent
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
                className="net-worth-subcategory"
                extraProps={extraProps}
            />
        </div>
    );
}

NetWorthSubcategoryList.propTypes = {
    subcategories: PropTypes.arrayOf(PropTypes.shape(subcategoryShape)).isRequired,
    parent: PropTypes.object.isRequired,
    ...crudListPropTypes
};
