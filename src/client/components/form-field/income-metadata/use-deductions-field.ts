import { useCallback, useEffect, useRef, useState } from 'react';

import { HookOptions, HookProps, HookResult, useCompositeField } from '../metadata/hooks';
import type { IncomeDeductionNative } from './types';

import { IncomeDeductionInput } from '~client/types/gql';

const hookOptions: HookOptions<IncomeDeductionNative> = {
  newItemInit: () => ({
    name: '',
    value: 0,
  }),
  processItems: (items) => items || [],
  validateItem: (delta) => !!(delta.name && delta.value),
};

export function useDeductionsField(
  props: HookProps<IncomeDeductionNative>,
): HookResult<IncomeDeductionNative> {
  return useCompositeField<IncomeDeductionNative>(props, hookOptions);
}

export function useSingleDeductionField(
  onChange: (index: number, delta: Partial<IncomeDeductionInput>) => void,
  index = -1,
): {
  onChangeName: (value: string | undefined) => void;
  onChangeValue: (value: number | undefined) => void;
} {
  const [delta, setDelta] = useState<Partial<IncomeDeductionInput>>({});
  const prevDelta = useRef<Partial<IncomeDeductionInput>>(delta);
  useEffect(() => {
    if (delta !== prevDelta.current && Object.keys(delta).length) {
      prevDelta.current = delta;
      onChange(index, delta);
    }
  }, [delta, onChange, index]);

  const onChangeName = useCallback((name?: string) => setDelta((last) => ({ ...last, name })), []);
  const onChangeValue = useCallback(
    (value?: number) => setDelta((last) => ({ ...last, value })),
    [],
  );

  return { onChangeName, onChangeValue };
}
