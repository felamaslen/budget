import { rgba } from 'polished';
import React, { useState, useCallback } from 'react';

import * as Styled from './styles';
import { CrudList } from '~client/components/crud-list';
import {
  FormFieldText,
  FormFieldRange,
  FormFieldTickbox,
  FormFieldNumber,
} from '~client/components/form-field';
import { OnCreate, OnUpdate, OnDelete } from '~client/hooks';
import { Button, ButtonDelete, FlexColumn, InlineFlex } from '~client/styled/shared';
import { colors } from '~client/styled/variables';
import type { Create } from '~client/types';
import {
  NetWorthSubcategory as Subcategory,
  NetWorthSubcategoryInput,
  NetWorthCategory as Category,
  NetWorthSubcategory,
  NetWorthCategoryType,
} from '~client/types/gql';

const getCreditLimitDisabled = (parent: Pick<Category, 'type'>): boolean =>
  parent.type !== NetWorthCategoryType.Liability;

const getSAYEDisabled = (parent: Pick<Category, 'isOption'>): boolean => !parent.isOption;

const getIlliquidDisabled = (parent: Pick<Category, 'type' | 'isOption'>): boolean =>
  parent.type !== NetWorthCategoryType.Asset || !!parent.isOption;

type PropsForm = {
  buttonText: string;
  onChange: (subcategory: NetWorthSubcategoryInput) => void;
  onDelete?: () => void;
  parent: Pick<Category, 'type' | 'isOption'>;
  child: Pick<Subcategory, 'categoryId'> & Partial<Omit<Create<Subcategory>, 'categoryId'>>;
};

const defaultOpacity = 0.8;

const NetWorthSubcategoryItemForm: React.FC<PropsForm> = ({
  parent,
  child: {
    categoryId,
    subcategory = 'Some bank account',
    hasCreditLimit = null,
    appreciationRate = null,
    isSAYE = null,
    opacity,
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

  const illiquidDisabled = getIlliquidDisabled(parent);
  const initialAppreciationRate = illiquidDisabled ? null : appreciationRate;

  const [tempHasCreditLimit, setTempHasCreditLimit] = useState<boolean | null>(
    initialHasCreditLimit,
  );

  const [tempIsSAYE, setTempIsSAYE] = useState<boolean | null>(initialIsSAYE);

  const [tempAppreciationRate, setTempAppreciationRate] = useState<number | null>(
    initialAppreciationRate,
  );
  const toggleIlliquid = useCallback(
    (): void => setTempAppreciationRate((last) => (last === null ? 0 : null)),
    [],
  );

  const [tempOpacity, setTempOpacity] = useState<number>(opacity ?? defaultOpacity);

  const touched = !(
    onDelete &&
    tempSubcategory === subcategory &&
    tempHasCreditLimit === initialHasCreditLimit &&
    tempAppreciationRate === initialAppreciationRate &&
    tempIsSAYE === initialIsSAYE &&
    tempOpacity === opacity
  );

  const onChangeItem = useCallback(
    () =>
      onChange({
        categoryId,
        subcategory: tempSubcategory,
        hasCreditLimit: tempHasCreditLimit,
        appreciationRate: tempAppreciationRate,
        isSAYE: tempIsSAYE,
        opacity: tempOpacity,
      }),
    [
      onChange,
      categoryId,
      tempSubcategory,
      tempHasCreditLimit,
      tempAppreciationRate,
      tempIsSAYE,
      tempOpacity,
    ],
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
      {!illiquidDisabled && (
        <Styled.Illiquid>
          <FormFieldTickbox
            item="illiquid"
            value={tempAppreciationRate !== null}
            onChange={toggleIlliquid}
          />
          {tempAppreciationRate !== null && (
            <FlexColumn>
              <span>Appreciation:</span>
              <InlineFlex>
                <FormFieldNumber
                  value={tempAppreciationRate}
                  onChange={setTempAppreciationRate}
                  min={-99.9}
                  step={0.1}
                />
                %
              </InlineFlex>
            </FlexColumn>
          )}
        </Styled.Illiquid>
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
  onUpdate: OnUpdate<NetWorthSubcategoryInput>;
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
  onCreate: OnCreate<NetWorthSubcategoryInput>;
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
  onCreate: OnCreate<NetWorthSubcategoryInput>;
  onUpdate: OnUpdate<NetWorthSubcategoryInput>;
  onDelete: OnDelete;
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
      {!getIlliquidDisabled(parent) && <Styled.Illiquid>Illiquid</Styled.Illiquid>}
    </Styled.ListHead>
    <CrudList<NetWorthSubcategoryInput, NetWorthSubcategory, CrudProps>
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
