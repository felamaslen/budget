import format from 'date-fns/format';
import React, { memo, useCallback } from 'react';

import { NetWorthEditForm } from '../edit-form';
import * as Styled from './styles';
import { OnUpdate } from '~client/hooks';
import type { NetWorthEntryNative as Entry, SetActiveId } from '~client/types';
import type {
  NetWorthCategory as Category,
  NetWorthSubcategory as Subcategory,
} from '~client/types/gql';
import type { Create } from '~shared/types';

type Props = {
  item: Entry;
  categories: Category[];
  subcategories: Subcategory[];
  active: boolean;
  setActive: SetActiveId;
  noneActive: boolean;
  onUpdate: OnUpdate<Create<Entry>>;
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

  const dateFormatted = format(item.date, 'dd MMM yy');

  const onDeleteConfirmed = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete the entry for: ${dateFormatted}?`)) {
      onDelete();
    }
  }, [onDelete, dateFormatted]);

  if (noneActive) {
    return (
      <Styled.ItemSummary onClick={onActivate}>
        <span>{dateFormatted}</span>
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
      onDelete={onDeleteConfirmed}
      onUpdate={onUpdate}
    />
  );
};
const NetWorthListItemMemo = memo(NetWorthListItem);
export { NetWorthListItemMemo as NetWorthListItem };
