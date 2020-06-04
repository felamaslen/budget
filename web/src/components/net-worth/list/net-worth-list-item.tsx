import format from 'date-fns/format';
import React, { memo, useCallback } from 'react';

import { NetWorthEditForm } from '../edit-form';
import * as Styled from './styles';
import { OnUpdate, SetActiveId } from '~client/hooks/crud';
import { ButtonDelete } from '~client/styled/shared';
import { Category, Subcategory, Entry } from '~client/types';

type Props = {
  item: Entry;
  categories: Category[];
  subcategories: Subcategory[];
  active: boolean;
  setActive: SetActiveId;
  noneActive: boolean;
  onUpdate: OnUpdate<Entry>;
  onDelete: () => void;
};

const NetWorthListItem: React.FC<Props> = ({
  item,
  categories,
  subcategories,
  active,
  noneActive,
  setActive,
  onUpdate,
  onDelete,
}) => {
  const onActivate = useCallback(() => setActive(item.id), [item.id, setActive]);

  if (noneActive) {
    return (
      <Styled.ItemSummary onClick={onActivate}>
        <span>{format(item.date, 'dd MMM yy')}</span>
        <Styled.ButtonDelete>
          <ButtonDelete onClick={onDelete}>&minus;</ButtonDelete>
        </Styled.ButtonDelete>
      </Styled.ItemSummary>
    );
  }
  if (!active) {
    return null;
  }

  return (
    <NetWorthEditForm
      item={item}
      categories={categories}
      subcategories={subcategories}
      setActiveId={setActive}
      onUpdate={onUpdate}
    />
  );
};
const NetWorthListItemMemo = memo(NetWorthListItem);
export { NetWorthListItemMemo as NetWorthListItem };
