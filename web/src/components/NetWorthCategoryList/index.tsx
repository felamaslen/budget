import React, { useState, useCallback, useMemo } from 'react';

import * as Styled from './styles';
import { CrudList } from '~client/components/CrudList';
import {
  FormFieldColor,
  FormFieldSelect,
  SelectOptions,
  FormFieldText,
} from '~client/components/FormField';
import NetWorthSubcategoryList from '~client/components/NetWorthSubcategoryList';
import { CREATE_ID } from '~client/constants/data';
import { OnCreate, OnUpdate, OnDelete } from '~client/hooks/crud';
import { Button, ButtonDelete } from '~client/styled/shared';
import { Create, Category, Subcategory } from '~client/types';

const typeOptions: SelectOptions<Category['type'] | 'option'> = [
  { internal: 'asset', external: 'Asset' },
  { internal: 'liability', external: 'Liability' },
  { internal: 'option', external: 'Option' },
];

type PropsForm = {
  item?: Category;
  onChange: (category: Create<Category>) => void;
  buttonText: string;
};

const NetWorthCategoryItemForm: React.FC<PropsForm> = ({
  item: { id, type, category, color, isOption } = {
    id: CREATE_ID,
    type: 'asset',
    category: 'Cash',
    color: '#ccffcc',
    isOption: false,
  },
  onChange,
  buttonText,
}) => {
  const [tempType, setTempType] = useState<Category['type']>(type);
  const [tempIsOption, setTempIsOption] = useState<Category['isOption']>(isOption);
  const [tempCategory, setTempCategory] = useState<string>(category);
  const [tempColor, setTempColor] = useState<string>(color);

  const touched =
    id === CREATE_ID ||
    !(
      tempType === type &&
      tempIsOption === isOption &&
      tempCategory === category &&
      tempColor === color
    );

  const onChangeItem = useCallback(
    () =>
      onChange({
        type: tempType,
        category: tempCategory,
        color: tempColor,
        isOption: tempIsOption,
      }),
    [onChange, tempType, tempIsOption, tempCategory, tempColor],
  );

  const onChangeType = useCallback((value: Category['type'] | 'option') => {
    setTempIsOption(value === 'option');
    setTempType(value === 'option' ? 'asset' : value);
  }, []);

  return (
    <Styled.CategoryItemForm style={{ backgroundColor: tempColor }}>
      <Styled.CategoryType>
        <FormFieldSelect
          item="type"
          options={typeOptions}
          value={tempIsOption ? 'option' : tempType}
          onChange={onChangeType}
        />
      </Styled.CategoryType>
      <Styled.CategoryInput>
        <FormFieldText item="category" value={tempCategory} onChange={setTempCategory} />
      </Styled.CategoryInput>
      <Styled.CategoryColor>
        <FormFieldColor value={tempColor} onChange={setTempColor} />
      </Styled.CategoryColor>
      <Styled.CategoryButton>
        <Button disabled={!touched} onClick={onChangeItem}>
          {buttonText}
        </Button>
      </Styled.CategoryButton>
    </Styled.CategoryItemForm>
  );
};

type PropsItem = {
  item: Category;
  style?: object;
  expanded: string | null;
  onExpand: React.Dispatch<React.SetStateAction<string | null>>;
  onUpdate: OnUpdate<Category>;
  onDelete: () => void;
  categories: Category[];
  subcategories: Subcategory[];
  onCreateSubcategory: OnCreate<Subcategory>;
  onUpdateSubcategory: OnUpdate<Subcategory>;
  onDeleteSubcategory: OnDelete<Subcategory>;
};

const NetWorthCategoryItem: React.FC<PropsItem> = ({
  item,
  style = {},
  onUpdate,
  onDelete,
  categories,
  subcategories,
  expanded,
  onExpand,
  onCreateSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
}) => {
  const onChange = useCallback(
    (values) => {
      onUpdate(item.id, values);
    },
    [onUpdate, item.id],
  );

  const categorySubcategories = useMemo(
    () => subcategories.filter(({ categoryId }) => categoryId === item.id),
    [item.id, subcategories],
  );

  const parent = useMemo<Category | undefined>(
    () => categories.find(({ id: categoryId }) => categoryId === item.id),
    [item.id, categories],
  );

  const itemStyle = useMemo(() => ({ ...style, backgroundColor: item.color }), [style, item.color]);

  const itemExpanded = expanded === item.id;
  const setExpanded = useCallback(() => onExpand(item.id), [onExpand, item.id]);
  const toggleExpand = useCallback(() => onExpand((last) => (last === item.id ? null : item.id)), [
    onExpand,
    item.id,
  ]);

  return (
    <Styled.CategoryItem
      data-testid={`category-item-${item.id}`}
      style={itemStyle}
      onFocus={setExpanded}
    >
      <Styled.CategoryItemMain>
        <Styled.ToggleVisibility>
          <Button data-testid="handle" expanded={itemExpanded} onClick={toggleExpand} />
        </Styled.ToggleVisibility>
        <NetWorthCategoryItemForm
          key="category-form"
          item={item}
          onChange={onChange}
          buttonText="Update"
        />
        <Styled.ButtonDeleteContainer>
          <ButtonDelete onClick={onDelete}>&minus;</ButtonDelete>
        </Styled.ButtonDeleteContainer>
      </Styled.CategoryItemMain>
      {itemExpanded && parent && (
        <NetWorthSubcategoryList
          key="subcategory-list"
          parent={parent}
          subcategories={categorySubcategories}
          onCreate={onCreateSubcategory}
          onUpdate={onUpdateSubcategory}
          onDelete={onDeleteSubcategory}
        />
      )}
    </Styled.CategoryItem>
  );
};

type PropsCreate = {
  onCreate: OnCreate<Category>;
};

const NetWorthCategoryCreateItem: React.FC<PropsCreate> = ({ onCreate }) => (
  <Styled.CategoryItem data-testid="category-item-create">
    <NetWorthCategoryItemForm onChange={onCreate} buttonText="Create" />
  </Styled.CategoryItem>
);

export type Props = {
  categories: Category[];
  subcategories: Subcategory[];
  onCreateCategory: OnCreate<Category>;
  onUpdateCategory: OnUpdate<Category>;
  onDeleteCategory: OnDelete<Category>;
  onCreateSubcategory: OnCreate<Subcategory>;
  onUpdateSubcategory: OnUpdate<Subcategory>;
  onDeleteSubcategory: OnDelete<Subcategory>;
};

type CrudProps = Pick<
  Props,
  | 'categories'
  | 'subcategories'
  | 'onCreateSubcategory'
  | 'onUpdateSubcategory'
  | 'onDeleteSubcategory'
> & {
  expanded: string | null;
  onExpand: PropsItem['onExpand'];
};

const NetWorthCategoryList: React.FC<Props> = ({
  categories,
  subcategories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
}) => {
  const [expanded, onExpand] = useState<string | null>(null);

  const extraProps = {
    categories,
    subcategories,
    expanded,
    onExpand,
    onCreateSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory,
  };

  if (!(categories && subcategories)) {
    return null;
  }

  return (
    <Styled.CategoryList>
      <CrudList<Category, CrudProps>
        items={categories}
        Item={NetWorthCategoryItem}
        CreateItem={NetWorthCategoryCreateItem}
        onCreate={onCreateCategory}
        onUpdate={onUpdateCategory}
        onDelete={onDeleteCategory}
        extraProps={extraProps}
      />
    </Styled.CategoryList>
  );
};

export default NetWorthCategoryList;
