import format from 'date-fns/format';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { replaceAtIndex } from 'replace-array';
import shortid from 'shortid';

import { Step } from './constants';
import * as Styled from './styles';
import {
  FormFieldCost,
  FormFieldNetWorthValue,
  FormFieldSelect,
  SelectOptions,
} from '~client/components/FormField';
import FormContainer, {
  Props as ContainerProps,
} from '~client/components/NetWorthEditForm/form-container';
import { CREATE_ID } from '~client/constants/data';
import { useCTA } from '~client/hooks';
import { toIdMap } from '~client/modules/data';
import { ButtonAdd, ButtonDelete } from '~client/styled/shared';
import {
  IdMap,
  CreateEdit,
  Category,
  Subcategory,
  Currency,
  CreditLimit,
  Entry,
  Value,
  ValueObject,
} from '~client/types';

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
  skip?: ValueObject['skip'];
  setSkip: (value: boolean) => void;
};

const SkipToggle: React.FC<PropsSkipToggle> = ({ skip, setSkip }) => (
  <Styled.SkipToggle>
    <input type="checkbox" checked={!!skip} onChange={(): void => setSkip(!skip)} />
    <span>{'Skip in calculations'}</span>
  </Styled.SkipToggle>
);

type PropsEditByType = {
  isLiability: boolean;
  isOption: boolean;
  subcategories: Subcategory[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
  value: ValueObject;
  onChange: (id: string, value: Value, creditLimit: number | null, skip: boolean | null) => void;
  onRemove: (id: string) => void;
};

const EditByType: React.FC<PropsEditByType> = ({
  isLiability,
  isOption,
  subcategories,
  creditLimit: creditLimitList,
  currencies,
  value: { id, subcategory, skip, value },
  onChange,
  onRemove,
}) => {
  const subcategoryMatch = subcategories.find(
    ({ id: subcategoryId }) => subcategoryId === subcategory,
  );
  if (!subcategoryMatch) {
    throw new Error("Can't find subcategory");
  }

  const { subcategory: subcategoryName, hasCreditLimit } = subcategoryMatch;

  const { value: initialCreditLimit } = creditLimitList.find(
    ({ subcategory: subcategoryId }) => subcategoryId === subcategory,
  ) || { value: null };

  const [newValue, setNewValue] = useState<Value>(value);
  const [creditLimit, setCreditLimit] = useState<number | null | undefined>(initialCreditLimit);
  const [newSkip, setSkip] = useState<boolean | null>(skip ?? null);

  useEffect(() => {
    if (!(value === newValue && initialCreditLimit === creditLimit && skip === newSkip)) {
      onChange(id, newValue, creditLimit || null, newSkip);
    }
  }, [value, newValue, initialCreditLimit, creditLimit, skip, newSkip, onChange, id]);

  const onRemoveCallback = useCallback(() => onRemove(id), [onRemove, id]);

  return (
    <Styled.EditByCategoryValue isLiability={isLiability} isOption={isOption}>
      <Styled.Subcategory>{subcategoryName}</Styled.Subcategory>
      <Styled.EditValue>
        <FormFieldNetWorthValue
          id={subcategory}
          value={value}
          isOption={isOption}
          onChange={setNewValue}
          currencies={currencies}
        />
      </Styled.EditValue>
      {hasCreditLimit && (
        <CreditLimitEditor creditLimit={creditLimit ?? 0} setCreditLimit={setCreditLimit} />
      )}
      {isLiability && <SkipToggle skip={skip} setSkip={setSkip} />}
      <Styled.ValueDelete>
        <ButtonDelete onClick={onRemoveCallback}>&minus;</ButtonDelete>
      </Styled.ValueDelete>
    </Styled.EditByCategoryValue>
  );
};

const getFirstOption = (options: SelectOptions): string => (options[0] || {}).internal;

type PropsAddByType = Pick<PropsEditByType, 'isLiability' | 'subcategories' | 'currencies'> & {
  categories: Category[];
  onAdd: (
    value: Value,
    creditLimit: number | null,
    subcategory: string,
    skip?: boolean | null,
  ) => void;
};

const AddByType: React.FC<PropsAddByType> = ({
  isLiability,
  categories,
  subcategories,
  currencies,
  onAdd,
}) => {
  const categoryOptions = useMemo<SelectOptions>(
    () =>
      categories.map(({ id, category }: Category) => ({
        internal: id,
        external: category,
      })),
    [categories],
  );

  const [category, setCategory] = useState<string>(getFirstOption(categoryOptions));

  const subcategoryOptions = useMemo<SelectOptions>(
    () =>
      subcategories
        .filter(({ categoryId }) => categoryId === category)
        .map(({ id, subcategory }) => ({
          internal: id,
          external: subcategory,
        })),
    [category, subcategories],
  );

  const [subcategory, setSubcategory] = useState<string>(getFirstOption(subcategoryOptions));

  const [value, setValue] = useState<Value>(0);
  const [skip, setSkip] = useState<boolean | null>(null);

  const { hasCreditLimit } = useMemo<Partial<Subcategory>>(
    () => subcategories.find(({ id }: Subcategory) => id === subcategory) || {},
    [subcategories, subcategory],
  );
  const initialCreditLimit = hasCreditLimit ? 0 : null;
  const [creditLimit, setCreditLimit] = useState<number | null | undefined>(initialCreditLimit);

  const isOption = categories.find(({ id }) => id === category)?.isOption ?? false;

  const onAddCallback = useCallback(() => {
    onAdd(value, creditLimit || null, subcategory, skip);
  }, [onAdd, subcategory, value, creditLimit, skip]);

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
          value={subcategory}
          onChange={setSubcategory}
        />
      </Styled.AddSubcategory>
      <Styled.AddValue isOption={isOption}>
        <FormFieldNetWorthValue
          id={`value-${CREATE_ID}`}
          value={value}
          isOption={isOption}
          onChange={setValue}
          currencies={currencies}
        />
      </Styled.AddValue>
      {hasCreditLimit && (
        <CreditLimitEditor creditLimit={creditLimit ?? 0} setCreditLimit={setCreditLimit} />
      )}
      {isLiability && <SkipToggle skip={skip} setSkip={setSkip} />}
      <ButtonAdd onClick={onAddCallback}>{'+'}</ButtonAdd>
    </Styled.AddByCategoryValue>
  );
};

function appendCreditLimit(
  item: CreateEdit<Entry>,
  subcategory: string,
  value: number,
): CreditLimit[] {
  const index = item.creditLimit.findIndex(
    ({ subcategory: subcategoryId }) => subcategoryId === subcategory,
  );
  const creditLimit: CreditLimit = { subcategory, value };
  if (index === -1) {
    return item.creditLimit.concat([creditLimit]);
  }

  return replaceAtIndex<CreditLimit>(item.creditLimit, index, creditLimit);
}

type PropsStep = {
  typeFilter: Category['type'];
  name: string;
  containerProps: ContainerProps;
  item: CreateEdit<Entry>;
  categories: Category[];
  subcategories: Subcategory[];
  onEdit: (item: CreateEdit<Entry>) => void;
};

type Props = Omit<PropsStep, 'typeFilter' | 'name'>;

function useAddValue(
  item: CreateEdit<Entry>,
  onEdit: Props['onEdit'],
): (value: Value, creditLimit: number | null, subcategory: string, skip?: boolean | null) => void {
  return useCallback(
    (newValue, creditLimit, subcategory, skip = null) => {
      const itemWithValue = {
        ...item,
        values: item.values.concat([
          {
            id: shortid.generate(),
            subcategory,
            skip,
            value: newValue,
          },
        ]),
      };

      if (creditLimit === null) {
        onEdit(itemWithValue);
      } else {
        onEdit({
          ...itemWithValue,
          creditLimit: appendCreditLimit(item, subcategory, creditLimit),
        });
      }
    },
    [item, onEdit],
  );
}

function useChangeValue(
  item: CreateEdit<Entry>,
  onEdit: Props['onEdit'],
): (id: string, value: Value, creditLimit?: number | null, skip?: boolean | null) => void {
  return useCallback(
    (id, newValue, creditLimit, skip = null) => {
      const index = item.values.findIndex(({ id: valueId }) => valueId === id);
      const itemWithValue = {
        ...item,
        values: replaceAtIndex(item.values, index, {
          ...item.values[index],
          skip,
          value: newValue,
        }),
      };

      if (creditLimit === null) {
        onEdit(itemWithValue);
      } else {
        const creditLimitIndex = item.creditLimit.findIndex(
          ({ subcategory }) => subcategory === item.values[index].subcategory,
        );

        onEdit({
          ...itemWithValue,
          creditLimit: replaceAtIndex(item.creditLimit, creditLimitIndex, {
            ...item.creditLimit[creditLimitIndex],
            value: creditLimit ?? 0,
          }),
        });
      }
    },
    [item, onEdit],
  );
}

type ValueWithCategory = ValueObject & { category: Category };

function useRemoveValue(item: CreateEdit<Entry>, onEdit: Props['onEdit']): (id: string) => void {
  return useCallback(
    (id) => {
      const index = item.values.findIndex(({ id: valueId }) => valueId === id);
      const newItemValues = item.values.filter(({ id: valueId }) => valueId !== id);
      const creditLimit = item.creditLimit.filter(
        ({ subcategory }) => subcategory !== item.values[index].subcategory,
      );
      onEdit({ ...item, values: newItemValues, creditLimit });
    },
    [item, onEdit],
  );
}

const CategoryGroup: React.FC<{
  category: Category;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ category: { id, category, color }, expanded, setExpanded, children }) => {
  const onToggle = useCallback(() => setExpanded((last) => (last === id ? null : id)), [
    id,
    setExpanded,
  ]);

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
  item: CreateEdit<Entry>;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<string | null>>;
  category: Category;
  subcategories: Subcategory[];
  onEdit: Props['onEdit'];
  values: ValueWithCategory[];
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
          key={value.id}
          isLiability={isLiability}
          isOption={category.isOption}
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

const StepValues: React.FC<PropsStep> = ({
  typeFilter,
  name,
  containerProps,
  item,
  categories,
  subcategories,
  onEdit,
}) => {
  const isLiability = typeFilter === 'liability';
  const categoriesByType = useMemo<Category[]>(
    () => categories.filter(({ type }) => type === typeFilter),
    [categories, typeFilter],
  );

  const [expanded, setExpanded] = useState<string | null>(null);

  const categoriesById = useMemo<IdMap<Category>>(() => toIdMap<Category>(categoriesByType), [
    categoriesByType,
  ]);
  const subcategoriesById = useMemo<IdMap<Subcategory>>(() => toIdMap<Subcategory>(subcategories), [
    subcategories,
  ]);

  const groupedValues = useMemo<IdMap<ValueWithCategory[]>>(
    () =>
      item.values
        .map<ValueWithCategory>(({ subcategory, ...rest }) => {
          const { categoryId } = subcategoriesById[subcategory];
          const category = categoriesById[categoryId];

          return { subcategory, category, ...rest };
        })
        .filter(({ category }) => category)
        .sort((a, b) => {
          if (a.category.category < b.category.category) {
            return -1;
          }
          if (a.category.category > b.category.category) {
            return 1;
          }
          return 0;
        })
        .reduce<IdMap<ValueWithCategory[]>>(
          (last, value) => ({
            ...last,
            [value.category.id]: [...(last[value.category.id] ?? []), value],
          }),
          {},
        ),
    [categoriesById, subcategoriesById, item.values],
  );

  const availableSubcategories = useMemo<Subcategory[]>(
    () =>
      subcategories.filter(
        ({ id: subcategoryId, categoryId }) =>
          categoriesByType.some(({ id }) => id === categoryId) &&
          !Object.keys(groupedValues).some((key) =>
            groupedValues[key].some(({ subcategory }) => subcategory === subcategoryId),
          ),
      ),
    [subcategories, categoriesByType, groupedValues],
  );

  const availableCategories = useMemo<Category[]>(
    () =>
      categoriesByType.filter(({ id }) =>
        availableSubcategories.some(({ categoryId }) => categoryId === id),
      ),
    [categoriesByType, availableSubcategories],
  );

  const onAddValue = useAddValue(item, onEdit);

  return (
    <FormContainer {...containerProps} step={Step.Values}>
      <Styled.SectionTitle>
        <span>{name}</span>
        <span>
          {' - '}
          {format(item.date, 'yyyy-MM-dd')}
        </span>
      </Styled.SectionTitle>
      <Styled.EditByCategory>
        {Object.entries(groupedValues).map(([categoryId, values]) => (
          <EditByCategory
            key={categoryId}
            item={item}
            category={values[0].category}
            expanded={expanded === categoryId}
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
  <StepValues {...props} typeFilter="asset" name="Assets" />
);

export const StepLiabilities: React.FC<Props> = (props) => (
  <StepValues {...props} typeFilter="liability" name="Liabilities" />
);
