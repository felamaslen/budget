import format from 'date-fns/format';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { replaceAtIndex } from 'replace-array';

import { Step } from './constants';
import { FormContainer, Props as ContainerProps } from './form-container';
import * as Styled from './styles';
import {
  FormFieldCost,
  FormFieldNetWorthValue,
  FormFieldSelect,
  SelectOptions,
} from '~client/components/form-field';
import { useCTA } from '~client/hooks';
import { ButtonAdd, ButtonDelete } from '~client/styled/shared';
import type {
  Create,
  Id,
  NetWorthEntryNative as NetWorthEntry,
  NetWorthValueObjectRead,
} from '~client/types';
import { NetWorthCategoryType } from '~client/types/enum';
import type {
  CreditLimit,
  Currency,
  Maybe,
  NetWorthCategory,
  NetWorthSubcategory,
  NetWorthValueObject,
} from '~client/types/gql';

type PropsCreditLimitEditor = {
  creditLimit: number;
  setCreditLimit: (value?: number) => void;
};

const CreditLimitEditor: React.FC<PropsCreditLimitEditor> = ({ creditLimit, setCreditLimit }) => (
  <Styled.CreditLimitEditor>
    <span>{'Credit limit:'}</span>
    <FormFieldCost value={creditLimit || 0} onChange={setCreditLimit} small />
  </Styled.CreditLimitEditor>
);

type PropsSkipToggle = {
  skip?: NetWorthValueObject['skip'];
  setSkip: (value: boolean) => void;
};

const SkipToggle: React.FC<PropsSkipToggle> = ({ skip, setSkip }) => (
  <Styled.SkipToggle>
    <input type="checkbox" checked={!!skip} onChange={(): void => setSkip(!skip)} />
    <span>{'Skip in calculations'}</span>
  </Styled.SkipToggle>
);

type OnChangeValue = (
  subcategory: number,
  newValue: NetWorthValueObjectRead,
  creditLimit: number | null,
) => void;

type PropsEditByType = {
  isLiability: boolean;
  isOption: boolean;
  subcategories: NetWorthSubcategory[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
  value: NetWorthValueObjectRead;
  onChange: OnChangeValue;
  onRemove: (subcategory: number) => void;
};

const EditByType: React.FC<PropsEditByType> = ({
  isLiability,
  isOption,
  subcategories,
  creditLimit: creditLimitList,
  currencies,
  value,
  onChange,
  onRemove,
}) => {
  const subcategory = subcategories.find((compare) => compare.id === value.subcategory);
  if (!subcategory) {
    throw new Error("Can't find subcategory");
  }

  const initialCreditLimit =
    creditLimitList.find((compare) => compare.subcategory === subcategory.id)?.value ?? null;

  const [newValue, setNewValue] = useState(value);
  const [creditLimit, setCreditLimit] = useState<number | null | undefined>(initialCreditLimit);
  const isLoan = isLiability && typeof creditLimit !== 'number';

  const setSkip = useCallback((newSkip?: boolean | null): void => {
    setNewValue((last) => ({ ...last, skip: newSkip ?? null }));
  }, []);

  useEffect(() => {
    if (typeof value.skip === 'undefined') {
      setSkip(null);
    }
  }, [value.skip, setSkip]);

  useEffect(() => {
    if (!(value === newValue && initialCreditLimit === (creditLimit ?? null))) {
      onChange(subcategory.id, newValue, creditLimit ?? null);
    }
  }, [value, newValue, initialCreditLimit, creditLimit, onChange, subcategory.id]);

  const onRemoveCallback = useCallback(() => onRemove(subcategory.id), [onRemove, subcategory.id]);

  return (
    <Styled.EditByCategoryValue isLiability={isLiability} isOption={isOption}>
      <Styled.Subcategory>{subcategory.subcategory}</Styled.Subcategory>
      <Styled.EditValue>
        <FormFieldNetWorthValue
          value={value}
          isOption={isOption}
          isLoan={isLoan}
          onChange={setNewValue}
          currencies={currencies}
        />
      </Styled.EditValue>
      {subcategory.hasCreditLimit && (
        <CreditLimitEditor creditLimit={creditLimit ?? 0} setCreditLimit={setCreditLimit} />
      )}
      {isLiability && <SkipToggle skip={!!newValue.skip} setSkip={setSkip} />}
      <Styled.ValueDelete>
        <ButtonDelete onClick={onRemoveCallback}>&minus;</ButtonDelete>
      </Styled.ValueDelete>
    </Styled.EditByCategoryValue>
  );
};

const getFirstOption = (options: SelectOptions<number>): number => (options[0] ?? {}).internal;

type PropsAddByType = Pick<PropsEditByType, 'isLiability' | 'subcategories' | 'currencies'> & {
  categories: NetWorthCategory[];
  onAdd: (value: NetWorthValueObjectRead, creditLimit: number | null) => void;
};

const AddByType: React.FC<PropsAddByType> = ({
  isLiability,
  categories,
  subcategories,
  currencies,
  onAdd,
}) => {
  const categoryOptions = useMemo<SelectOptions<number>>(
    () =>
      categories.map(({ id, category }) => ({
        internal: id,
        external: category,
      })),
    [categories],
  );

  const [category, setCategory] = useState<number>(getFirstOption(categoryOptions));

  const subcategoryOptions = useMemo<SelectOptions<number>>(
    () =>
      subcategories
        .filter(({ categoryId }) => categoryId === category)
        .map(({ id, subcategory }) => ({
          internal: id,
          external: subcategory,
        })),
    [category, subcategories],
  );

  const [value, setValue] = useState<NetWorthValueObjectRead>({
    subcategory: getFirstOption(subcategoryOptions),
    skip: null,
    simple: 0,
  });

  const setSubcategory = useCallback(
    (subcategory: number) => setValue((last) => ({ ...last, subcategory })),
    [],
  );

  const setSkip = useCallback(
    (skip?: boolean | null) => setValue((last) => ({ ...last, skip })),
    [],
  );

  const hasCreditLimit = subcategories.find(({ id }) => id === value.subcategory)?.hasCreditLimit;
  const [creditLimit, setCreditLimit] = useState<Maybe<number> | undefined>(
    hasCreditLimit ? 0 : null,
  );

  const categoryItem = categories.find(({ id }) => id === category);

  const isOption = categoryItem?.isOption ?? false;
  const isLoan = categoryItem?.type === NetWorthCategoryType.Liability && !hasCreditLimit;

  const onAddCallback = useCallback(() => {
    onAdd(value, creditLimit || null);
  }, [onAdd, value, creditLimit]);

  return (
    <Styled.AddByCategoryValue isOption={isOption}>
      <Styled.AddCategory>
        <Styled.AddLabel>{'Category:'}</Styled.AddLabel>
        <FormFieldSelect
          item="category"
          options={categoryOptions}
          value={category}
          onChange={setCategory}
        />
      </Styled.AddCategory>
      <Styled.AddSubcategory isOption={isOption}>
        <Styled.AddLabel>{'Subcategory:'}</Styled.AddLabel>
        <FormFieldSelect
          item="subcategory"
          options={subcategoryOptions}
          value={value.subcategory}
          onChange={setSubcategory}
        />
      </Styled.AddSubcategory>
      <Styled.AddValue isOption={isOption}>
        <FormFieldNetWorthValue
          value={value}
          isOption={isOption}
          isLoan={isLoan}
          onChange={setValue}
          currencies={currencies}
        />
      </Styled.AddValue>
      {hasCreditLimit && (
        <CreditLimitEditor creditLimit={creditLimit ?? 0} setCreditLimit={setCreditLimit} />
      )}
      {isLiability && <SkipToggle skip={value.skip} setSkip={setSkip} />}
      <ButtonAdd onClick={onAddCallback}>{'+'}</ButtonAdd>
    </Styled.AddByCategoryValue>
  );
};

function appendOrDeleteCreditLimit(
  item: Create<NetWorthEntry>,
  subcategory: number,
  value: number | null | undefined,
): CreditLimit[] {
  if (typeof value === 'undefined') {
    return item.creditLimit;
  }
  if (value === null) {
    return item.creditLimit.filter((compare) => compare.subcategory !== subcategory);
  }
  const index = item.creditLimit.findIndex((compare) => compare.subcategory === subcategory);
  const creditLimit: CreditLimit = { subcategory, value };
  if (index === -1) {
    return [...item.creditLimit, creditLimit];
  }
  return replaceAtIndex(item.creditLimit, index, creditLimit);
}

type PropsStep = {
  typeFilter: NetWorthCategoryType;
  name: string;
  step: Step;
  containerProps: Omit<ContainerProps, 'step'>;
  item: Create<NetWorthEntry>;
  categories: NetWorthCategory[];
  subcategories: NetWorthSubcategory[];
  onEdit: (item: Create<NetWorthEntry>) => void;
};

type Props = Omit<PropsStep, 'step' | 'typeFilter' | 'name'>;

function useAddValue(
  item: Create<NetWorthEntry>,
  onEdit: Props['onEdit'],
): (value: NetWorthValueObjectRead, creditLimit: number | null) => void {
  return useCallback(
    (newValue, creditLimit) => {
      const itemWithValue: Create<NetWorthEntry> = {
        ...item,
        values: [...item.values, newValue],
        creditLimit: appendOrDeleteCreditLimit(item, newValue.subcategory, creditLimit),
      };

      onEdit(itemWithValue);
    },
    [item, onEdit],
  );
}

function useChangeValue(item: Create<NetWorthEntry>, onEdit: Props['onEdit']): OnChangeValue {
  return useCallback(
    (subcategory, newValue, creditLimit): void => {
      onEdit({
        ...item,
        values: replaceAtIndex(
          item.values,
          item.values.findIndex((compare) => compare.subcategory === subcategory),
          newValue,
        ),
        creditLimit: appendOrDeleteCreditLimit(item, subcategory, creditLimit),
      });
    },
    [item, onEdit],
  );
}

function useRemoveValue(item: Create<NetWorthEntry>, onEdit: Props['onEdit']): (id: Id) => void {
  return useCallback(
    (subcategory) => {
      const newItemValues = item.values.filter((compare) => compare.subcategory !== subcategory);
      const creditLimit = item.creditLimit.filter((compare) => compare.subcategory !== subcategory);
      onEdit({ ...item, values: newItemValues, creditLimit });
    },
    [item, onEdit],
  );
}

const CategoryGroup: React.FC<{
  category: NetWorthCategory;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<number | null>>;
}> = ({ category: { id, category, color }, expanded, setExpanded, children }) => {
  const onToggle = useCallback(() => {
    setExpanded((last) => (last === id ? null : id));
  }, [id, setExpanded]);

  const toggleEvents = useCTA(onToggle);

  return (
    <Styled.EditByCategoryGroup style={{ backgroundColor: color }}>
      <Styled.SectionSubtitle hidden={!expanded} {...toggleEvents}>
        {category}
      </Styled.SectionSubtitle>
      {expanded && children}
    </Styled.EditByCategoryGroup>
  );
};

const EditByCategory: React.FC<{
  item: Create<NetWorthEntry>;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<number | null>>;
  category: NetWorthCategory;
  subcategories: NetWorthSubcategory[];
  onEdit: Props['onEdit'];
  values: NetWorthValueObjectRead[];
  isLiability: boolean;
}> = ({ item, expanded, setExpanded, category, subcategories, onEdit, values, isLiability }) => {
  const onChangeValue = useChangeValue(item, onEdit);
  const onRemoveValue = useRemoveValue(item, onEdit);

  return (
    <CategoryGroup
      key={category.id}
      category={category}
      expanded={expanded}
      setExpanded={setExpanded}
    >
      {values.map((value) => (
        <EditByType
          key={value.subcategory}
          isLiability={isLiability}
          isOption={!!category.isOption}
          subcategories={subcategories}
          creditLimit={item.creditLimit}
          currencies={item.currencies}
          value={value}
          onChange={onChangeValue}
          onRemove={onRemoveValue}
        />
      ))}
    </CategoryGroup>
  );
};

type ValuesGroupedByCategory = {
  category: NetWorthCategory;
  values: NetWorthValueObjectRead[];
}[];

const StepValues: React.FC<PropsStep> = ({
  typeFilter,
  name,
  step,
  containerProps,
  item,
  categories,
  subcategories,
  onEdit,
}) => {
  const isLiability = typeFilter === 'liability';

  const valuesGroupedByCategory = useMemo<ValuesGroupedByCategory>(
    () =>
      categories
        .filter(({ type }) => type === typeFilter)
        .map((category) => ({
          category,
          values: item.values.filter(
            (value) =>
              subcategories.find(
                ({ categoryId, id }) => categoryId === category.id && id === value.subcategory,
              )?.categoryId === category.id,
          ),
        }))
        .filter(({ values }) => values.length),
    [typeFilter, categories, subcategories, item.values],
  );

  const [expanded, setExpanded] = useState<number | null>(null);

  const availableSubcategories = useMemo<NetWorthSubcategory[]>(
    () =>
      subcategories.filter(
        (subcategory) =>
          categories.some(
            (category) => category.id === subcategory.categoryId && category.type === typeFilter,
          ) && !item.values.some((value) => value.subcategory === subcategory.id),
      ),
    [typeFilter, categories, subcategories, item.values],
  );

  const availableCategories = useMemo<NetWorthCategory[]>(
    () =>
      categories.filter((category) =>
        availableSubcategories.some((subcategory) => subcategory.categoryId === category.id),
      ),
    [categories, availableSubcategories],
  );

  const onAddValue = useAddValue(item, onEdit);

  return (
    <FormContainer {...containerProps} step={step}>
      <Styled.SectionTitle>
        <span>{name}</span>
        <span>
          {' - '}
          {format(item.date, 'yyyy-MM-dd')}
        </span>
      </Styled.SectionTitle>
      <Styled.EditByCategory>
        {valuesGroupedByCategory.map(({ category, values }) => (
          <EditByCategory
            key={category.id}
            item={item}
            category={category}
            expanded={expanded === category.id}
            setExpanded={setExpanded}
            subcategories={subcategories}
            values={values}
            onEdit={onEdit}
            isLiability={isLiability}
          />
        ))}
        {availableCategories.length > 0 && (
          <AddByType
            key="add"
            isLiability={isLiability}
            categories={availableCategories}
            subcategories={availableSubcategories}
            currencies={item.currencies}
            onAdd={onAddValue}
          />
        )}
      </Styled.EditByCategory>
    </FormContainer>
  );
};

export const StepAssets: React.FC<Props> = (props) => (
  <StepValues {...props} typeFilter={NetWorthCategoryType.Asset} name="Assets" step={Step.Assets} />
);

export const StepLiabilities: React.FC<Props> = (props) => (
  <StepValues
    {...props}
    typeFilter={NetWorthCategoryType.Liability}
    name="Liabilities"
    step={Step.Liabilities}
  />
);
