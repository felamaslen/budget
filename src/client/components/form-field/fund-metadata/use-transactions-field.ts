import { useCallback, useEffect, useRef, useState } from 'react';

import { HookOptions, HookProps, HookResult, useCompositeField } from '../metadata/hooks';

import { sortByKey } from '~client/modules/data';
import type { TransactionNative } from '~client/types';

const hookOptions: HookOptions<TransactionNative> = {
  newItemInit: () => ({
    date: new Date(),
    units: 0,
    price: 0,
    fees: 0,
    taxes: 0,
    drip: false,
    pension: false,
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
  onChangeDrip: (value: boolean | undefined) => void;
  onChangePension: (value: boolean | undefined) => void;
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
  const onChangeDrip = useCallback((drip?: boolean) => {
    setDelta((last) => ({ ...last, drip }));
  }, []);
  const onChangePension = useCallback((pension?: boolean) => {
    setDelta((last) => ({ ...last, pension }));
  }, []);

  return {
    onChangeDate,
    onChangeUnits,
    onChangePrice,
    onChangeFees,
    onChangeTaxes,
    onChangeDrip,
    onChangePension,
  };
}
