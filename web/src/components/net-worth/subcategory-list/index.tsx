import { rgba } from 'polished';
import React, { useState, useCallback } from 'react';

import * as Styled from './styles';
import { CrudList } from '~client/components/crud-list';
import { FormFieldText, FormFieldRange, FormFieldTickbox } from '~client/components/form-field';
import { OnCreate, OnUpdate, OnDelete } from '~client/hooks/crud';
import { Button, ButtonDelete } from '~client/styled/shared';
import { colors } from '~client/styled/variables';
import { Create, Subcategory, Category } from '~client/types';

const getCreditLimitDisabled = (parent: Pick<Category, 'type'>): boolean =>
  parent.type !== 'liability';

const getSAYEDisabled = (parent: Pick<Category, 'isOption'>): boolean => !parent.isOption;

type PropsForm = {
  buttonText: string;
  onChange: (subcategory: Create<Subcategory>) => void;
  onDelete?: () => void;
  parent: Pick<Category, 'type' | 'isOption'>;
  child: Pick<Subcategory, 'categoryId'> & Partial<Omit<Create<Subcategory>, 'categoryId'>>;
};

const NetWorthSubcategoryItemForm: React.FC<PropsForm> = ({
  parent,
  child: {
    categoryId,
    subcategory = 'Some bank account',
    hasCreditLimit = null,
    isSAYE = null,
    opacity = 0.8,
  },
  onChange,
  onDelete,
  buttonText,
}) => {
  const [tempSubcategory, setTempSubcategory] = useState<string>(subcategory);

  const creditLimitDisabled = getCreditLimitDisabled(parent);
  const initialHasCreditLimit = creditLimitDisabled ? null : !!hasCreditLimit;

  const isSAYEDisabled = getSAYEDisabled(parent);
  const initialIsSAYE = isSAYEDisabled ? null : !!isSAYE;

  const [tempHasCreditLimit, setTempHasCreditLimit] = useState<boolean | null>(
    initialHasCreditLimit,
  );

  const [tempIsSAYE, setTempIsSAYE] = useState<boolean | null>(initialIsSAYE);

  const [tempOpacity, setTempOpacity] = useState<number>(opacity);

  const touched = !(
    onDelete &&
    tempSubcategory === subcategory &&
    tempHasCreditLimit === initialHasCreditLimit &&
    tempIsSAYE === initialIsSAYE &&
    tempOpacity === opacity
  );

  const onChangeItem = useCallback(
    () =>
      onChange({
        categoryId,
        subcategory: tempSubcategory,
        hasCreditLimit: tempHasCreditLimit,
        isSAYE: tempIsSAYE,
        opacity: tempOpacity,
      }),
    [onChange, categoryId, tempSubcategory, tempHasCreditLimit, tempIsSAYE, tempOpacity],
  );

  return (
    <Styled.ItemForm
      data-testid={`subcategory-item-${subcategory}`}
      style={{
        backgroundColor: rgba(colors.white, tempOpacity),
      }}
    >
      <Styled.Name>
        <FormFieldText
          item="subcategory"
          value={tempSubcategory}
          onChange={setTempSubcategory}
          active
        />
      </Styled.Name>
      <Styled.Opacity>
        <FormFieldRange
          item="opacity"
          min={0}
          max={1}
          step={0.1}
          value={tempOpacity}
          onChange={setTempOpacity}
        />
      </Styled.Opacity>
      {!creditLimitDisabled && (
        <Styled.CreditLimit>
          <FormFieldTickbox
            item="credit-limit"
            value={!!tempHasCreditLimit}
            onChange={setTempHasCreditLimit}
          />
        </Styled.CreditLimit>
      )}
      {!isSAYEDisabled && (
        <Styled.IsSAYE>
          <FormFieldTickbox item="is-saye" value={!!tempIsSAYE} onChange={setTempIsSAYE} />
        </Styled.IsSAYE>
      )}
      <Styled.ButtonChange>
        <Button disabled={!touched} onClick={onChangeItem}>
          {buttonText}
        </Button>
      </Styled.ButtonChange>
      {onDelete && (
        <Styled.ButtonDeleteContainer>
          <ButtonDelete onClick={onDelete}>&minus;</ButtonDelete>
        </Styled.ButtonDeleteContainer>
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

const NetWorthSubcategoryItem: React.FC<PropsItem> = ({ item, parent, onUpdate, onDelete }) => {
  const onChange = useCallback(
    (values) => {
      onUpdate(item.id, values);
    },
    [onUpdate, item.id],
  );

  return (
    <NetWorthSubcategoryItemForm
      parent={parent}
      child={item}
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
    child={{ categoryId: parent.id }}
    onChange={onCreate}
    buttonText="Create"
  />
);

export type Props = {
  parent: Category;
  subcategories: Subcategory[];
  onCreate: OnCreate<Subcategory>;
  onUpdate: OnUpdate<Subcategory>;
  onDelete: OnDelete<Subcategory>;
};

type CrudProps = { parent: Category };

export const NetWorthSubcategoryList: React.FC<Props> = ({
  parent,
  subcategories,
  onCreate,
  onUpdate,
  onDelete,
}) => (
  <Styled.SubcategoryList data-testid="subcategory-form">
    <Styled.ListHead>
      <Styled.Name>{'Name'}</Styled.Name>
      <Styled.Opacity>Opacity</Styled.Opacity>
      {!getCreditLimitDisabled(parent) && <Styled.CreditLimit>Credit limit</Styled.CreditLimit>}
    </Styled.ListHead>
    <CrudList<Subcategory, CrudProps>
      items={subcategories}
      Item={NetWorthSubcategoryItem}
      CreateItem={NetWorthSubcategoryCreateItem}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      extraProps={{ parent }}
    />
  </Styled.SubcategoryList>
);
