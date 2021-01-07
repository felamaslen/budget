import React from 'react';

import { NetWorthListCreateItem } from './net-worth-list-create-item';
import { NetWorthListItem } from './net-worth-list-item';
import * as Styled from './styles';
import { CrudList } from '~client/components/crud-list';
import { OnCreate, OnUpdate, OnDelete } from '~client/hooks';
import type { Create, NetWorthEntryNative as Entry } from '~client/types';
import type {
  NetWorthCategory as Category,
  NetWorthSubcategory as Subcategory,
} from '~client/types/gql';

type Props = {
  data: Entry[];
  categories: Category[];
  subcategories: Subcategory[];
  onCreate: OnCreate<Create<Entry>>;
  onUpdate: OnUpdate<Create<Entry>>;
  onDelete: OnDelete;
};

export const NetWorthList: React.FC<Props> = ({
  data,
  categories,
  subcategories,
  onCreate,
  onUpdate,
  onDelete,
}) => (
  <Styled.NetWorthList>
    <CrudList<Create<Entry>, Entry, Pick<Props, 'data' | 'categories' | 'subcategories'>>
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
