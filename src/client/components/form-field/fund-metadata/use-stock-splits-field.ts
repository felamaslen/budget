import { useCallback, useEffect, useRef, useState } from 'react';

import { HookOptions, HookProps, HookResult, useCompositeField } from './hooks';

import { sortByKey } from '~client/modules/data';
import type { StockSplitNative } from '~client/types';

const hookOptions: HookOptions<StockSplitNative> = {
  newItemInit: () => ({
    date: new Date(),
    ratio: 0,
  }),
  processItems: sortByKey<'date', StockSplitNative>({ key: 'date', order: -1 }),
  validateItem: (delta) => (delta.ratio ?? 0) > 0,
};

export function useStockSplitsField(
  props: HookProps<StockSplitNative>,
): HookResult<StockSplitNative> {
  return useCompositeField<StockSplitNative>(props, hookOptions);
}

export function useSingleStockSplitField(
  onChange: (index: number, delta: Partial<StockSplitNative>) => void,
  index = -1,
): {
  onChangeDate: (value: Date | undefined) => void;
  onChangeRatio: (value: number | undefined) => void;
} {
  const [delta, setDelta] = useState<Partial<StockSplitNative>>({});
  const prevDelta = useRef<Partial<StockSplitNative>>(delta);
  useEffect(() => {
    if (delta !== prevDelta.current && Object.keys(delta).length) {
      prevDelta.current = delta;
      onChange(index, delta);
    }
  }, [delta, onChange, index]);
  const onChangeDate = useCallback((date?: Date) => setDelta((last) => ({ ...last, date })), []);
  const onChangeRatio = useCallback(
    (ratio?: number) => setDelta((last) => ({ ...last, ratio })),
    [],
  );

  return { onChangeDate, onChangeRatio };
}
