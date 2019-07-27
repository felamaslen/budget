import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { subcategory as subcategoryShape } from '~client/prop-types/net-worth/category';
import FormFieldText from '~client/components/FormField';
import FormFieldRange from '~client/components/FormField/range';
import FormFieldTickbox from '~client/components/FormField/tickbox';
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
    onDelete,
    buttonText
}) {
    const [tempSubcategory, setTempSubcategory] = useState(subcategory);

    const creditLimitDisabled = getCreditLimitDisabled(parent);
    const initialHasCreditLimit = creditLimitDisabled
        ? null
        : Boolean(hasCreditLimit);

    const [tempHasCreditLimit, setTempHasCreditLimit] = useState(initialHasCreditLimit);

    const [tempOpacity, setTempOpacity] = useState(opacity);

    const touched = !(onDelete &&
        tempSubcategory === subcategory &&
        tempHasCreditLimit === initialHasCreditLimit &&
        tempOpacity === opacity
    );

    const onChangeItem = useCallback(() => onChange({
        categoryId,
        subcategory: tempSubcategory,
        hasCreditLimit: tempHasCreditLimit,
        opacity: tempOpacity
    }), [
        onChange,
        categoryId,
        tempSubcategory,
        tempHasCreditLimit,
        tempOpacity
    ]);

    const style = {
        backgroundColor: `rgba(255, 255, 255, ${tempOpacity}`
    };

    return (
        <span
            className={classNames('net-worth-subcategory-item-form', {
                touched
            })}
            style={style}
        >
            <FormFieldText
                item="subcategory"
                value={tempSubcategory}
                onChange={setTempSubcategory}
                active
            />
            {!creditLimitDisabled && <FormFieldTickbox
                item="credit-limit"
                value={Boolean(tempHasCreditLimit)}
                onChange={setTempHasCreditLimit}
            />}
            <FormFieldRange
                item="opacity"
                min={0}
                max={1}
                step={0.1}
                value={tempOpacity}
                onChange={setTempOpacity}
            />
            <div className="button-change">
                <button
                    disabled={!touched}
                    className="button-change-button"
                    onClick={onChangeItem}
                >{buttonText}</button>
            </div>
            {onDelete && (
                <div className="button-delete">
                    <button
                        className="button-delete-button"
                        onClick={onDelete}
                    >&minus;</button>
                </div>
            )}
        </span>
    );
}

NetWorthSubcategoryItemForm.propTypes = {
    buttonText: PropTypes.string.isRequired,
    categoryId: PropTypes.string.isRequired,
    subcategory: PropTypes.string,
    hasCreditLimit: PropTypes.bool,
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
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
    onUpdate,
    onDelete
}) {
    const onChange = useCallback(values => {
        onUpdate(id, values);
    }, [onUpdate, id]);

    return (
        <NetWorthSubcategoryItemForm
            parent={parent}
            categoryId={categoryId}
            subcategory={subcategory}
            hasCreditLimit={hasCreditLimit}
            opacity={opacity}
            onChange={onChange}
            onDelete={onDelete}
            buttonText="Update"
        />
    );
}

NetWorthSubcategoryItem.propTypes = {
    parent: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    item: subcategoryShape.isRequired
};

const NetWorthSubcategoryCreateItem = ({ parent, onCreate }) => (
    <NetWorthSubcategoryItemForm
        parent={parent}
        categoryId={parent.id}
        onChange={onCreate}
        buttonText="Create"
    />
);

NetWorthSubcategoryCreateItem.propTypes = {
    parent: PropTypes.object.isRequired,
    onCreate: PropTypes.func.isRequired
};

export default function NetWorthSubcategoryList({
    parent,
    subcategories,
    onCreate,
    onUpdate,
    onDelete
}) {
    const extraProps = {
        parent
    };

    const creditLimitDisabled = getCreditLimitDisabled(parent);

    return (
        <div className="net-worth-subcategory-list">
            <div className="net-worth-subcategory-list-head">
                <span className="subcategory">{'Name'}</span>
                {!creditLimitDisabled && <span className="credit-limit">{'Credit limit'}</span>}
                <span className="opacity">{'Opacity'}</span>
            </div>
            <CrudList
                items={subcategories}
                real
                Item={NetWorthSubcategoryItem}
                CreateItem={NetWorthSubcategoryCreateItem}
                onCreate={onCreate}
                onUpdate={onUpdate}
                onDelete={onDelete}
                className="net-worth-subcategory-list-crud"
                extraProps={extraProps}
            />
        </div>
    );
}

NetWorthSubcategoryList.propTypes = {
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    parent: PropTypes.object.isRequired,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};
