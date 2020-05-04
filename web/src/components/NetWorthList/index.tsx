import React from 'react';

import { OnCreate, OnUpdate, OnDelete } from '~client/hooks/crud';
import { Category, Subcategory, Entry } from '~client/types/net-worth';
import CrudList from '~client/components/CrudList';
import NetWorthListItem from './net-worth-list-item';
import NetWorthListCreateItem from './net-worth-list-create-item';

import * as Styled from './styles';

type Props = {
  data: Entry[];
  categories: Category[];
  subcategories: Subcategory[];
  onCreate: OnCreate<Entry>;
  onUpdate: OnUpdate<Entry>;
  onDelete: OnDelete;
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
    <CrudList
      items={data}
      real
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
