import React, { useContext, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { subcategory as subcategoryShape } from '~client/prop-types/net-worth/category';
import { NetWorthSubcategoryContext } from '~client/context';
import { Button } from '~client/styled/shared/button';
import FormFieldText from '~client/components/FormField';
import FormFieldRange from '~client/components/FormField/range';
import FormFieldTickbox from '~client/components/FormField/tickbox';
import CrudList from '~client/components/CrudList';

import * as Styled from './styles';

const getCreditLimitDisabled = parent => parent.type !== 'liability';

function NetWorthSubcategoryItemForm({
    categoryId,
    subcategory,
    hasCreditLimit,
    opacity,
    parent,
    onChange,
    onDelete,
    buttonText,
}) {
    const [tempSubcategory, setTempSubcategory] = useState(subcategory);

    const creditLimitDisabled = getCreditLimitDisabled(parent);
    const initialHasCreditLimit = creditLimitDisabled ? null : Boolean(hasCreditLimit);

    const [tempHasCreditLimit, setTempHasCreditLimit] = useState(initialHasCreditLimit);

    const [tempOpacity, setTempOpacity] = useState(opacity);

    const touched = !(
        onDelete &&
        tempSubcategory === subcategory &&
        tempHasCreditLimit === initialHasCreditLimit &&
        tempOpacity === opacity
    );

    const onChangeItem = useCallback(
        () =>
            onChange({
                categoryId,
                subcategory: tempSubcategory,
                hasCreditLimit: tempHasCreditLimit,
                opacity: tempOpacity,
            }),
        [onChange, categoryId, tempSubcategory, tempHasCreditLimit, tempOpacity],
    );

    return (
        <Styled.ItemForm
            className={classNames('net-worth-subcategory-item-form', {
                touched,
            })}
            style={{
                backgroundColor: `rgba(255, 255, 255, ${tempOpacity}`,
            }}
        >
            <FormFieldText
                item="subcategory"
                value={tempSubcategory}
                onChange={setTempSubcategory}
                active
            />
            {!creditLimitDisabled && (
                <FormFieldTickbox
                    item="credit-limit"
                    value={Boolean(tempHasCreditLimit)}
                    onChange={setTempHasCreditLimit}
                />
            )}
            <FormFieldRange
                item="opacity"
                min={0}
                max={1}
                step={0.1}
                value={tempOpacity}
                onChange={setTempOpacity}
            />
            <Styled.ButtonChange className="button-change">
                <Button disabled={!touched} className="button-change-button" onClick={onChangeItem}>
                    {buttonText}
                </Button>
            </Styled.ButtonChange>
            {onDelete && (
                <div className="button-delete">
                    <Button className="button-delete-button" onClick={onDelete}>
                        &minus;
                    </Button>
                </div>
            )}
        </Styled.ItemForm>
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
        type: PropTypes.oneOf(['asset', 'liability']).isRequired,
    }).isRequired,
};

NetWorthSubcategoryItemForm.defaultProps = {
    subcategory: 'Some bank account',
    opacity: 0.8,
};

function NetWorthSubcategoryItem({
    item: { id, categoryId, subcategory, hasCreditLimit, opacity },
    onUpdate,
    onDelete,
}) {
    const { parent } = useContext(NetWorthSubcategoryContext);
    const onChange = useCallback(
        values => {
            onUpdate(id, values);
        },
        [onUpdate, id],
    );

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
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    item: subcategoryShape.isRequired,
};

const NetWorthSubcategoryCreateItem = ({ onCreate }) => {
    const { parent } = useContext(NetWorthSubcategoryContext);

    return (
        <NetWorthSubcategoryItemForm
            parent={parent}
            categoryId={parent.id}
            onChange={onCreate}
            buttonText="Create"
        />
    );
};

NetWorthSubcategoryCreateItem.propTypes = {
    onCreate: PropTypes.func.isRequired,
};

export default function NetWorthSubcategoryList({
    parent,
    subcategories,
    onCreate,
    onUpdate,
    onDelete,
}) {
    const netWorthSubcategoryContext = useMemo(() => ({ parent }), [parent]);

    const creditLimitDisabled = getCreditLimitDisabled(parent);

    return (
        <NetWorthSubcategoryContext.Provider value={netWorthSubcategoryContext}>
            <Styled.SubcategoryList className="net-worth-subcategory-list">
                <Styled.ListHead className="net-worth-subcategory-list-head">
                    <Styled.Name className="subcategory">{'Name'}</Styled.Name>
                    {!creditLimitDisabled && (
                        <Styled.CreditLimit className="credit-limit">
                            {'Credit limit'}
                        </Styled.CreditLimit>
                    )}
                    <Styled.Opacity className="opacity">{'Opacity'}</Styled.Opacity>
                </Styled.ListHead>
                <CrudList
                    items={subcategories}
                    real
                    Item={NetWorthSubcategoryItem}
                    CreateItem={NetWorthSubcategoryCreateItem}
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    className="net-worth-subcategory-list-crud"
                />
            </Styled.SubcategoryList>
        </NetWorthSubcategoryContext.Provider>
    );
}

NetWorthSubcategoryList.propTypes = {
    subcategories: PropTypes.arrayOf(subcategoryShape.isRequired).isRequired,
    parent: PropTypes.object.isRequired,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};
