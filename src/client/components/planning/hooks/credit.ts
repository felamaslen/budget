import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getSubcategories } from '~client/selectors';
import type { NetWorthSubcategory } from '~client/types/gql';

export function useCreditCards(): NetWorthSubcategory[] {
  const netWorthSubcategories = useSelector(getSubcategories);
  return useMemo(() => netWorthSubcategories.filter((compare) => !!compare.hasCreditLimit), [
    netWorthSubcategories,
  ]);
}
