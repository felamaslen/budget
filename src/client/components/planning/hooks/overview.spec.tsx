import React from 'react';

import { testState } from '../__tests__/fixtures';
import { PlanningContext } from '../context';
import { PlanningOverviewRow, useOverviewData } from './overview';
import { usePlanningTableData } from './table';

import { renderHookWithStore } from '~client/test-utils';

describe(useOverviewData.name, () => {
  const Wrapper: React.FC = ({ children }) => {
    const table = usePlanningTableData(testState);
    return (
      <PlanningContext.Provider
        value={{
          state: testState,
          table,
          localYear: 2020,
          isSynced: true,
          isLoading: false,
          error: null,
        }}
      >
        {children}
      </PlanningContext.Provider>
    );
  };

  it('should return a computed gross income row', () => {
    expect.assertions(2);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'Gross income',
          value: 500000 + 550000 + 708333,
          isBold: true,
        },
      ]),
    );
    expect(result.current.filter((compare) => compare.name === 'Gross income')).toHaveLength(1);
  });

  it('should return a total income tax row', () => {
    expect.assertions(2);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'Taxes',
          value: 105603,
        },
      ]),
    );
    expect(result.current.filter((compare) => compare.name === 'Taxes')).toHaveLength(1);
  });

  it('should return a total NI row', () => {
    expect.assertions(2);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'NI',
          value: -0,
        },
      ]),
    );
    expect(result.current.filter((compare) => compare.name === 'NI')).toHaveLength(1);
  });

  it('should return a total student loan payments row', () => {
    expect.assertions(2);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'Student loan',
          value: -0,
        },
      ]),
    );
    expect(result.current.filter((compare) => compare.name === 'Student loan')).toHaveLength(1);
  });

  it('should return a total investments row', () => {
    expect.assertions(2);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'Investments',
          value: 333300,
          isBold: true,
        },
      ]),
    );
    expect(result.current.filter((compare) => compare.name === 'Investments')).toHaveLength(1);
  });

  it('should return a total pension contribs row', () => {
    expect.assertions(2);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'Pension contributions',
          value: 300000 + 50000,
          isBold: true,
        },
      ]),
    );
    expect(result.current.filter((compare) => compare.name === 'Investments')).toHaveLength(1);
  });

  it("should return a row for the previous year's tax relief", () => {
    expect.assertions(2);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'Tax relief from previous year',
          value: 48872,
        },
      ]),
    );
    expect(
      result.current.filter((compare) => compare.name === 'Tax relief from previous year'),
    ).toHaveLength(1);
  });

  it('should return summed custom rows, grouped by name, where there are more than 2', () => {
    expect.assertions(3);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'My recurring payment',
          value: 15623 + 27310 + 10032,
        },
      ]),
    );

    expect(result.current).not.toStrictEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Transfer to savings' })]),
    );

    expect(result.current).not.toStrictEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Car payment' })]),
    );
  });

  it('should return a row for the total credit card spending', () => {
    expect.assertions(2);
    const { result } = renderHookWithStore(useOverviewData, {
      renderHookOptions: { wrapper: Wrapper },
    });

    expect(result.current).toStrictEqual(
      expect.arrayContaining<PlanningOverviewRow>([
        {
          name: 'CC spending',
          value: 15628 + 14892 + 39923 + 20156 * 6, // Oct-Mar inclusive,
        },
      ]),
    );
    expect(result.current.filter((compare) => compare.name === 'CC spending')).toHaveLength(1);
  });
});
