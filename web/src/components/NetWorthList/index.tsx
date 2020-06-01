import React from 'react';

import NetWorthListCreateItem from './net-worth-list-create-item';
import NetWorthListItem from './net-worth-list-item';
import * as Styled from './styles';
import CrudList from '~client/components/CrudList';
import { OnCreate, OnUpdate, OnDelete } from '~client/hooks';
import { Category, Subcategory, Entry } from '~client/types/net-worth';

type Props = {
  data: Entry[];
  categories: Category[];
  subcategories: Subcategory[];
  onCreate: OnCreate<Entry>;
  onUpdate: OnUpdate<Entry>;
  onDelete: OnDelete<Entry>;
};

const NetWorthList: React.FC<Props> = ({
  data,
  categories,
  subcategories,
  onCreate,
  onUpdate,
  onDelete,
}) => (
  <Styled.NetWorthList>
    <CrudList<Entry, Pick<Props, 'data' | 'categories' | 'subcategories'>>
      items={data}
      Item={NetWorthListItem}
      CreateItem={NetWorthListCreateItem}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      extraProps={{ data, categories, subcategories }}
    />
  </Styled.NetWorthList>
);

export default NetWorthList;
