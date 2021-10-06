import { renderHook } from '@testing-library/react-hooks';
import { endOfMonth } from 'date-fns';

import type { PlanningMonth } from '../types';
import { usePlanningMonths } from './months';

describe(usePlanningMonths.name, () => {
  it('should return a list of planning months, corresponding to a financial year', () => {
    expect.assertions(1);
    const { result } = renderHook(() => usePlanningMonths(2021));
    expect(result.current).toStrictEqual<PlanningMonth[]>([
      { year: 2021, month: 3, date: endOfMonth(new Date('2021-04-01')) },
      { year: 2021, month: 4, date: endOfMonth(new Date('2021-05-01')) },
      { year: 2021, month: 5, date: endOfMonth(new Date('2021-06-01')) },
      { year: 2021, month: 6, date: endOfMonth(new Date('2021-07-01')) },
      { year: 2021, month: 7, date: endOfMonth(new Date('2021-08-01')) },
      { year: 2021, month: 8, date: endOfMonth(new Date('2021-09-01')) },
      { year: 2021, month: 9, date: endOfMonth(new Date('2021-10-01')) },
      { year: 2021, month: 10, date: endOfMonth(new Date('2021-11-01')) },
      { year: 2021, month: 11, date: endOfMonth(new Date('2021-12-01')) },
      { year: 2021, month: 0, date: endOfMonth(new Date('2022-01-01')) },
      { year: 2021, month: 1, date: endOfMonth(new Date('2022-02-01')) },
      { year: 2021, month: 2, date: endOfMonth(new Date('2022-03-01')) },
    ]);
  });
});
