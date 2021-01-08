import format from 'date-fns/format';
import React, { memo, useCallback } from 'react';

import { NetWorthEditForm } from '../edit-form';
import * as Styled from './styles';
import { OnUpdate } from '~client/hooks';
import { ButtonDelete } from '~client/styled/shared';
import type { NetWorthEntryNative as Entry, SetActiveId, Create } from '~client/types';
import type {
  NetWorthCategory as Category,
  NetWorthSubcategory as Subcategory,
} from '~client/types/gql';

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