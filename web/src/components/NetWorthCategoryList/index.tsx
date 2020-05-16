import React, { useState, useCallback, useMemo } from 'react';

import { Category, Subcategory } from '~client/types/net-worth';
import { OnCreate, OnUpdate, OnDelete } from '~client/hooks/crud';
import { Create } from '~client/types/crud';
import { InlineFlexCenter } from '~client/styled/shared/layout';
import { Button, ButtonDelete } from '~client/styled/shared/button';
import CrudList from '~client/components/CrudList';
import FormFieldText from '~client/components/FormField';
import FormFieldSelect, { Options } from '~client/components/FormField/select';
import FormFieldColor from '~client/components/FormField/color';
import NetWorthSubcategoryList from '~client/components/NetWorthSubcategoryList';
import { CREATE_ID } from '~client/constants/data';

import * as Styled from './styles';

const typeOptions: Options<Category['type'] | 'option'> = [
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
      <FormFieldSelect
        item="type"
        options={typeOptions}
        value={tempIsOption ? 'option' : tempType}
        onChange={onChangeType}
      />
      <FormFieldText item="category" value={tempCategory} onChange={setTempCategory} />
      <FormFieldColor value={tempColor} onChange={setTempColor} />
      <Button disabled={!touched} onClick={onChangeItem}>
        {buttonText}
      </Button>
    </Styled.CategoryItemForm>
  );
};

type PropsItem = {
  item: Category;
  style?: {};
  expanded: string | null;
  onExpandToggle: (id: string) => void;
  onUpdate: OnUpdate<Category>;
  onDelete: () => void;
  categories: Category[];
  subcategories: Subcategory[];
  onCreateSubcategory: OnCreate<Subcategory>;
  onUpdateSubcategory: OnUpdate<Subcategory>;
  onDeleteSubcategory: OnDelete;
};

const NetWorthCategoryItem: React.FC<PropsItem> = ({
  item,
  style = {},
  onUpdate,
  onDelete,
  categories,
  subcategories,
  expanded,
  onExpandToggle,
  onCreateSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
}) => {
  const onChange = useCallback(
    values => {
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

  const onExpand = useCallback(() => onExpandToggle(item.id), [onExpandToggle, item.id]);

  return (
    <Styled.CategoryItem data-testid={`category-item-${item.id}`} style={itemStyle}>
      <Styled.CategoryItemMain>
        <Styled.ToggleVisibility>
          <Button data-testid="handle" expanded={!!expanded} onClick={onExpand} />
        </Styled.ToggleVisibility>
        <NetWorthCategoryItemForm
          key="category-form"
          item={item}
          onChange={onChange}
          buttonText="Update"
        />
        <InlineFlexCenter>
          <ButtonDelete onClick={onDelete}>&minus;</ButtonDelete>
        </InlineFlexCenter>
      </Styled.CategoryItemMain>
      {expanded === item.id && parent && (
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
  onDeleteCategory: OnDelete;
  onCreateSubcategory: OnCreate<Subcategory>;
  onUpdateSubcategory: OnUpdate<Subcategory>;
  onDeleteSubcategory: OnDelete;
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
  const [expanded, setExpanded] = useState(null);
  const onExpandToggle = useCallback(
    id =>
      setExpanded(last => {
        if (last === id) {
          return null;
        }

        return id;
      }),
    [],
  );

  const extraProps = {
    categories,
    subcategories,
    expanded,
    onExpandToggle,
    onCreateSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory,
  };

  if (!(categories && subcategories)) {
    return null;
  }

  return (
    <Styled.CategoryList>
      <CrudList
        items={categories}
        real
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
