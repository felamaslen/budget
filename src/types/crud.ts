export type OptimisticStatus = string | null | undefined;

export type OptimisticItem<T> = T & {
  id?: string;
  fakeId?: string;
  __optimistic?: OptimisticStatus;
};

export function isPayloadDefined<T, K extends string = 'cost'>(
  payload: OptimisticItem<T> | undefined,
): payload is OptimisticItem<T> {
  return typeof payload !== 'undefined';
}

export type CrudOptions = {
  withTotals: boolean;
};
