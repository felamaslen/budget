import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { subcategory as subcategoryShape } from '~client/components/NetWorthCategoryList/prop-types';
import { useInputText, useInputTickbox, useInputRange } from '~client/hooks/form';
import CrudList from '~client/components/CrudList';

import './style.scss';

const getCreditLimitDisabled = parent => parent.type !== 'liability';

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

    const creditLimitDisabled = getCreditLimitDisabled(parent);

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
        className: 'input-opacity',
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
    item: {
        id,
        categoryId,
        subcategory,
        hasCreditLimit,
        opacity
    },
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
    parent: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    item: subcategoryShape.isRequired
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

    const creditLimitDisabled = getCreditLimitDisabled(parent);

    const itemProps = useCallback(({ opacity }) => ({
        style: {
            backgroundColor: `rgba(255, 255, 255, ${opacity}`
        }
    }), []);

    return (
        <div className="net-worth-subcategory-list">
            <div className="net-worth-subcategory-list-head">
                <span className="subcategory">{'Name'}</span>
                {!creditLimitDisabled && <span className="credit-limit">{'Credit limit'}</span>}
                <span className="opacity">{'Opacity'}</span>
            </div>
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
                itemProps={itemProps}
            />
        </div>
    );
}

NetWorthSubcategoryList.propTypes = {
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    parent: PropTypes.object.isRequired,
    onCreate: PropTypes.func.isRequired,
    onRead: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};
