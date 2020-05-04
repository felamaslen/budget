import React, { useState, useCallback } from 'react';

import { Create } from '~client/types/crud';
import { OnCreate, OnUpdate, OnDelete } from '~client/hooks/crud';
import { Subcategory, Category } from '~client/types/net-worth';
import { InlineFlexCenter } from '~client/styled/shared/layout';
import { Button, ButtonDelete } from '~client/styled/shared/button';
import FormFieldText from '~client/components/FormField';
import FormFieldRange from '~client/components/FormField/range';
import FormFieldTickbox from '~client/components/FormField/tickbox';
import CrudList from '~client/components/CrudList';

import * as Styled from './styles';

const getCreditLimitDisabled = (parent: Pick<Category, 'type'>): boolean =>
  parent.type !== 'liability';

type PropsForm = {
  buttonText: string;
  onChange: (subcategory: Create<Subcategory>) => void;
  onDelete?: () => void;
  parent: Pick<Category, 'type'>;
} & Partial<Omit<Create<Subcategory>, 'categoryId'>> &
  Pick<Subcategory, 'categoryId'>;

const NetWorthSubcategoryItemForm: React.FC<PropsForm> = ({
  categoryId,
  subcategory = 'Some bank account',
  hasCreditLimit = null,
  opacity = 0.8,
  parent,
  onChange,
  onDelete,
  buttonText,
}) => {
  const [tempSubcategory, setTempSubcategory] = useState<string>(subcategory);

  const creditLimitDisabled = getCreditLimitDisabled(parent);
  const initialHasCreditLimit = creditLimitDisabled ? null : !!hasCreditLimit;

  const [tempHasCreditLimit, setTempHasCreditLimit] = useState<boolean | null>(
    initialHasCreditLimit,
  );

  const [tempOpacity, setTempOpacity] = useState<number>(opacity);

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
      <Styled.ButtonChange>
        <Button disabled={!touched} onClick={onChangeItem}>
          {buttonText}
        </Button>
      </Styled.ButtonChange>
      {onDelete && (
        <InlineFlexCenter>
          <ButtonDelete onClick={onDelete}>&minus;</ButtonDelete>
        </InlineFlexCenter>
      )}
    </Styled.ItemForm>
  );
};

type PropsItem = {
  item: Subcategory;
  parent: Category;
  onUpdate: OnUpdate<Subcategory>;
  onDelete: () => void;
};

const NetWorthSubcategoryItem: React.FC<PropsItem> = ({
  item: { id, categoryId, subcategory, hasCreditLimit, opacity },
  parent,
  onUpdate,
  onDelete,
}) => {
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
};

type PropsCreateItem = {
  parent: Category;
  onCreate: OnCreate<Subcategory>;
};

const NetWorthSubcategoryCreateItem: React.FC<PropsCreateItem> = ({ parent, onCreate }) => (
  <NetWorthSubcategoryItemForm
    parent={parent}
    categoryId={parent.id}
    onChange={onCreate}
    buttonText="Create"
  />
);

type Props = {
  parent: Category;
  subcategories: Subcategory[];
  onCreate: OnCreate<Subcategory>;
  onUpdate: OnUpdate<Subcategory>;
  onDelete: OnDelete;
};

const NetWorthSubcategoryList: React.FC<Props> = ({
  parent,
  subcategories,
  onCreate,
  onUpdate,
  onDelete,
}) => (
  <Styled.SubcategoryList>
    <Styled.ListHead>
      <Styled.Name>{'Name'}</Styled.Name>
      {!getCreditLimitDisabled(parent) && <Styled.CreditLimit>{'Credit limit'}</Styled.CreditLimit>}
      <Styled.Opacity>{'Opacity'}</Styled.Opacity>
    </Styled.ListHead>
    <CrudList
      items={subcategories}
      real
      Item={NetWorthSubcategoryItem}
      CreateItem={NetWorthSubcategoryCreateItem}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      extraProps={{ parent }}
    />
  </Styled.SubcategoryList>
);

export default NetWorthSubcategoryList;
