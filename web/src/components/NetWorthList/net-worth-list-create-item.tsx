import React, { useCallback } from 'react';

import { OnCreate, SetActiveId } from '~client/hooks/crud';
import { Category, Subcategory, Entry } from '~client/types/net-worth';
import { CREATE_ID } from '~client/constants/data';
import { NetWorthAddForm } from '~client/components/NetWorthEditForm';
import * as Styled from './styles';

type Props = {
  data: Entry[];
  categories: Category[];
  subcategories: Subcategory[];
  active: boolean;
  setActive: SetActiveId;
  noneActive: boolean;
  onCreate: OnCreate<Entry>;
};

const NetWorthListCreateItem: React.FC<Props> = ({
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

export default NetWorthListCreateItem;
