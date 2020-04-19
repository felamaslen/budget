import React, { useState, useCallback, useMemo, useEffect } from 'react';
import shortid from 'shortid';
import { replaceAtIndex } from 'replace-array';
import format from 'date-fns/format';

import { isLegacyDate, IdMap } from '~client/types';
import { CreateEdit } from '~client/types/crud';

import {
  Category,
  Subcategory,
  Currency,
  CreditLimit,
  Entry,
  Value,
  ValueObject,
} from '~client/types/net-worth';
import { ButtonAdd, ButtonDelete } from '~client/styled/shared/button';
import FormFieldNetWorthValue from '~client/components/FormField/net-worth-value';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldSelect, { Options } from '~client/components/FormField/select';
import FormContainer, {
  Props as ContainerProps,
} from '~client/components/NetWorthEditForm/form-container';
import { Step } from './constants';

import * as Styled from './styles';

type PropsCreditLimitEditor = {
  creditLimit: number;
  setCreditLimit: (value?: number) => void;
};

const CreditLimitEditor: React.FC<PropsCreditLimitEditor> = ({ creditLimit, setCreditLimit }) => (
  <div>
    <span>{'Credit limit:'}</span>
    <FormFieldCost value={creditLimit || 0} onChange={setCreditLimit} small />
  </div>
);

type PropsSkipToggle = {
  skip?: ValueObject['skip'];
  setSkip: (value: boolean) => void;
};

const SkipToggle: React.FC<PropsSkipToggle> = ({ skip, setSkip }) => (
  <div>
    <input type="checkbox" checked={!!skip} onChange={(): void => setSkip(!skip)} />
    <span>{'Skip in calculations'}</span>
  </div>
);

type PropsEditByType = {
  isLiability: boolean;
  categories: Category[];
  subcategories: Subcategory[];
  creditLimit: CreditLimit[];
  currencies: Currency[];
  value: ValueObject;
  onChange: (id: string, value: Value, creditLimit: number | null, skip: boolean | null) => void;
  onRemove: (id: string) => void;
};

const EditByType: React.FC<PropsEditByType> = ({
  isLiability,
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
    <Styled.EditByCategoryValue>
      <Styled.Subcategory>{subcategoryName}</Styled.Subcategory>
      <FormFieldNetWorthValue value={value} onChange={setNewValue} currencies={currencies} />
      {hasCreditLimit && (
        <CreditLimitEditor creditLimit={creditLimit ?? 0} setCreditLimit={setCreditLimit} />
      )}
      {isLiability && <SkipToggle skip={skip} setSkip={setSkip} />}
      <ButtonDelete onClick={onRemoveCallback}>&minus;</ButtonDelete>
    </Styled.EditByCategoryValue>
  );
};

const getFirstOption = (options: Options): string => (options[0] || {}).internal;

type PropsAddByType = Pick<
  PropsEditByType,
  'isLiability' | 'categories' | 'subcategories' | 'currencies'
> & {
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
  const categoryOptions = useMemo<Options>(
    () =>
      categories.map(({ id, category }: Category) => ({
        internal: id,
        external: category,
      })),
    [categories],
  );

  const [category, setCategory] = useState<string>(getFirstOption(categoryOptions));

  const subcategoryOptions = useMemo<Options>(
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

  const onAddCallback = useCallback(() => {
    onAdd(value, creditLimit || null, subcategory, skip);
  }, [onAdd, subcategory, value, creditLimit, skip]);

  return (
    <Styled.AddByCategoryValue>
      <Styled.AddCategory>
        <Styled.AddLabel>{'Category:'}</Styled.AddLabel>
        <FormFieldSelect
          item="category"
          options={categoryOptions}
          value={category}
          onChange={setCategory}
        />
      </Styled.AddCategory>
      <Styled.AddSubcategory>
        <Styled.AddLabel>{'Subcategory:'}</Styled.AddLabel>
        <FormFieldSelect
          item="subcategory"
          options={subcategoryOptions}
          value={subcategory}
          onChange={setSubcategory}
        />
      </Styled.AddSubcategory>
      <FormFieldNetWorthValue value={value} onChange={setValue} currencies={currencies} />
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
    id => {
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

const CategoryGroup: React.FC<{ category: Category }> = ({
  category: { category, color },
  children,
}) => {
  const [hidden, setHidden] = useState<boolean>(true);
  const onToggleHidden = useCallback(() => setHidden(!hidden), [hidden]);

  return (
    <Styled.EditByCategoryGroup style={{ backgroundColor: color }}>
      <Styled.SectionSubtitle hidden={hidden} onClick={onToggleHidden}>
        {category}
      </Styled.SectionSubtitle>
      {!hidden && children}
    </Styled.EditByCategoryGroup>
  );
};

const toIdMap = <V extends { id: string }>(items: V[]): IdMap<V> =>
  items.reduce(
    (last, item) => ({
      ...last,
      [item.id]: item,
    }),
    {},
  );

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

  const categoriesById = useMemo<IdMap<Category>>(() => toIdMap<Category>(categoriesByType), [
    categoriesByType,
  ]);
  const subcategoriesById = useMemo<IdMap<Subcategory>>(() => toIdMap<Subcategory>(subcategories), [
    subcategories,
  ]);

  const valuesByType = useMemo<IdMap<ValueWithCategory[]>>(
    () =>
      item.values
        .map(
          ({ subcategory, ...rest }): ValueWithCategory => {
            const { categoryId } = subcategoriesById[subcategory];
            const category = categoriesById[categoryId];

            return { subcategory, category, ...rest };
          },
        )
        .filter(({ category }) => category)
        .reduce(
          (
            last: IdMap<ValueWithCategory[]>,
            value: ValueWithCategory,
          ): IdMap<ValueWithCategory[]> => ({
            ...last,
            [value.category.id]: (last[value.category.id] || []).concat([value]),
          }),
          {},
        ),
    [categoriesById, subcategoriesById, item.values],
  );

  const valueKeys = useMemo<string[]>(
    () =>
      Object.keys(valuesByType).sort((idA, idB) => {
        if (categoriesById[idA].category < categoriesById[idB].category) {
          return -1;
        }
        if (categoriesById[idA].category < categoriesById[idB].category) {
          return 1;
        }

        return 0;
      }),
    [valuesByType, categoriesById],
  );

  const availableSubcategories = useMemo<Subcategory[]>(
    () =>
      subcategories.filter(
        ({ id: subcategoryId, categoryId }) =>
          categoriesByType.some(({ id }) => id === categoryId) &&
          !Object.keys(valuesByType).some(key =>
            valuesByType[key].some(({ subcategory }) => subcategory === subcategoryId),
          ),
      ),
    [subcategories, categoriesByType, valuesByType],
  );

  const availableCategories = useMemo<Category[]>(
    () =>
      categoriesByType.filter(({ id }) =>
        availableSubcategories.some(({ categoryId }) => categoryId === id),
      ),
    [categoriesByType, availableSubcategories],
  );

  const onAddValue = useAddValue(item, onEdit);
  const onChangeValue = useChangeValue(item, onEdit);
  const onRemoveValue = useRemoveValue(item, onEdit);

  return (
    <FormContainer {...containerProps} step={Step.Values}>
      <Styled.SectionTitle>
        <span>{name}</span>
        <span>
          {' - '}
          {format(isLegacyDate(item.date) ? item.date.toJSDate() : item.date, 'yyyy-MM-dd')}
        </span>
      </Styled.SectionTitle>
      <Styled.EditByCategory>
        {valueKeys.map(categoryId => (
          <CategoryGroup
            key={categoryId}
            category={
              categories.find(({ id: otherCategoryId }) => otherCategoryId === categoryId) ||
              ({} as Category)
            }
          >
            {valuesByType[categoryId].map(value => (
              <EditByType
                key={value.id}
                isLiability={isLiability}
                categories={categoriesByType}
                subcategories={subcategories}
                creditLimit={item.creditLimit}
                currencies={item.currencies}
                value={value}
                onChange={onChangeValue}
                onRemove={onRemoveValue}
              />
            ))}
          </CategoryGroup>
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

export const StepAssets: React.FC<Props> = props => (
  <StepValues {...props} typeFilter="asset" name="Assets" />
);

export const StepLiabilities: React.FC<Props> = props => (
  <StepValues {...props} typeFilter="liability" name="Liabilities" />
);
