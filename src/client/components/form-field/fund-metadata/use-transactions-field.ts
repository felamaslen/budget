import { useCallback, useEffect, useRef, useState } from 'react';

import { HookOptions, HookProps, HookResult, useCompositeField } from './hooks';

import { sortByKey } from '~client/modules/data';
import type { TransactionNative } from '~client/types';

const hookOptions: HookOptions<TransactionNative> = {
  newItemInit: () => ({
    date: new Date(),
    units: 0,
    price: 0,
    fees: 0,
    taxes: 0,
  }),
  processItems: sortByKey<'date', TransactionNative>({ key: 'date', order: -1 }),
  validateItem: (delta) => !!(delta.units && delta.price),
};

export function useTransactionsField(
  props: HookProps<TransactionNative>,
): HookResult<TransactionNative> {
  return useCompositeField<TransactionNative>(props, hookOptions);
}

export function useSingleTransactionField(
  onChange: (index: number, delta: Partial<TransactionNative>) => void,
  index = -1,
): {
  onChangeDate: (value: Date | undefined) => void;
  onChangeUnits: (value: number | undefined) => void;
  onChangePrice: (value: number | undefined) => void;
  onChangeFees: (value: number | undefined) => void;
  onChangeTaxes: (value: number | undefined) => void;
} {
  const [delta, setDelta] = useState<Partial<TransactionNative>>({});
  const prevDelta = useRef<Partial<TransactionNative>>(delta);
  useEffect(() => {
    if (delta !== prevDelta.current && Object.keys(delta).length) {
      prevDelta.current = delta;
      onChange(index, delta);
    }
  }, [delta, onChange, index]);
  const onChangeDate = useCallback((date?: Date) => setDelta((last) => ({ ...last, date })), []);
  const onChangeUnits = useCallback(
    (units?: number) => setDelta((last) => ({ ...last, units })),
    [],
  );
  const onChangePrice = useCallback(
    (price?: number) => setDelta((last) => ({ ...last, price })),
    [],
  );
  const onChangeFees = useCallback((fees?: number) => setDelta((last) => ({ ...last, fees })), []);
  const onChangeTaxes = useCallback(
    (taxes?: number) => setDelta((last) => ({ ...last, taxes })),
    [],
  );

  return { onChangeDate, onChangeUnits, onChangePrice, onChangeFees, onChangeTaxes };
}
