import format from 'date-fns/format';
import { memo, useCallback, useState } from 'react';

import { NetWorthEditForm } from '../edit-form';
import * as Styled from './styles';
import { ConfirmModal } from '~client/components/confirm-modal';
import { OnUpdate } from '~client/hooks';
import type { NetWorthEntryNative as Entry, SetActiveId } from '~client/types';
import type {
  NetWorthCategory as Category,
  NetWorthSubcategory as Subcategory,
} from '~client/types/gql';
import type { Create } from '~shared/types';

export type Props = {
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

  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const onCancelDelete = useCallback(() => setConfirmingDelete(false), []);
  const onConfirmDelete = useCallback(() => {
    onDelete();
    setConfirmingDelete(false);
  }, [onDelete]);
  const onDeleteConfirmed = useCallback(() => setConfirmingDelete(true), []);

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
    <>
      <NetWorthEditForm
        item={item}
        categories={categories}
        subcategories={subcategories}
        setActiveId={setActive}
        onDelete={onDeleteConfirmed}
        onUpdate={onUpdate}
      />
      {confirmingDelete && (
        <ConfirmModal
          title={`Are you sure you want to delete the entry for ${dateFormatted}?`}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      )}
    </>
  );
};
const NetWorthListItemMemo = memo(NetWorthListItem);
export { NetWorthListItemMemo as NetWorthListItem };
