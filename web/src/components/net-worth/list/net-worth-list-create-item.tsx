import React, { useCallback } from 'react';

import { NetWorthAddForm } from '../edit-form';
import * as Styled from './styles';
import { CREATE_ID } from '~client/constants/data';
import { OnCreate } from '~client/hooks';
import {
  Create,
  NetWorthCategory as Category,
  NetWorthEntryNative as Entry,
  NetWorthSubcategory as Subcategory,
  SetActiveId,
} from '~client/types';

type Props = {
  data: Entry[];
  categories: Category[];
  subcategories: Subcategory[];
  active: boolean;
  setActive: SetActiveId;
  noneActive: boolean;
  onCreate: OnCreate<Create<Entry>>;
};

export const NetWorthListCreateItem: React.FC<Props> = ({
  data,
  categories,
  subcategories,
  active,
  setActive,
  noneActive,
  onCreate,
}) => {
  const onActivate = useCallback(() => setActive(CREATE_ID), [setActive]);

  if (noneActive) {
    return (
      <Styled.ItemSummary add onClick={onActivate}>
        {'Add a new entry'}
      </Styled.ItemSummary>
    );
  }
  if (!active) {
    return null;
  }

  return (
    <NetWorthAddForm
      data={data}
      categories={categories}
      subcategories={subcategories}
      setActiveId={setActive}
      onCreate={onCreate}
    />
  );
};
