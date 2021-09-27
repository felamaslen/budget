import type { IncomeDeductionInput } from '~client/types/gql';
import type { GQL } from '~shared/types';

export const getComponentKey = ({ name }: GQL<IncomeDeductionInput>, index: number): string =>
  `${name}-${index}`;
