import { useCallback, useMemo, useState } from 'react';
import { removeAtIndex } from 'replace-array';
import { useField } from '~client/hooks';
import { partialModification } from '~client/modules/data';
import { Id } from '~client/types';

export type HookProps<F> = {
  value: F[];
  onChange: (value: F[]) => void;
};

export type HookOptions<F> = {
  newItemInit: () => F;
  processItems: (items: F[]) => F[];
  validateItem: (delta: Partial<F>) => boolean;
};

export type HookResult<F> = {
  items: F[];
  newItem: F;
  onCreate: () => void;
  onUpdate: (index: number, delta: Partial<F>) => void;
  onDelete: (index: number) => void;
  onChangeAddField: (id: Id, delta: Partial<F>) => void;
};

export function useCompositeField<F>(
  props: HookProps<F>,
  { newItemInit, processItems, validateItem }: HookOptions<F>,
): HookResult<F> {
  const { currentValue, onChange } = useField<F[], F[]>({
    ...props,
    inline: true,
    immediate: true,
  });

  const items = useMemo(() => processItems(currentValue), [currentValue, processItems]);

  const onUpdate = useCallback(
    (index: number, delta: Partial<F>): void => {
      onChange(partialModification(items, index, delta));
    },
    [items, onChange],
  );

  const onDelete = useCallback((index: number) => onChange(removeAtIndex(items, index)), [
    items,
    onChange,
  ]);

  const [newItem, setNewItem] = useState<F>(newItemInit());

  const onChangeAddField = useCallback((_, delta: Partial<F>): void => {
    setNewItem((last) => ({ ...last, ...delta }));
  }, []);

  const onCreate = useCallback(() => {
    if (!validateItem(newItem)) {
      return;
    }

    setNewItem(newItemInit());
    onChange([...currentValue, newItem]);
  }, [newItem, newItemInit, validateItem, currentValue, onChange]);

  return {
    items,
    newItem,
    onCreate,
    onUpdate,
    onDelete,
    onChangeAddField,
  };
}
