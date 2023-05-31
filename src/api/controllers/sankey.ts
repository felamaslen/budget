import { compose } from '@typed/compose';
import { capitalize, groupBy } from 'lodash';
import { DatabaseTransactionConnectionType } from 'slonik';

import { Links } from './sankey.constants';
import {
  SankeyExpenseRow,
  SankeyIncomeDeductionRow,
  SankeyIncomeRow,
  SankeyInvestmentsRow,
  selectExpenses,
  selectInvestments,
  selectSankeyDeductions,
  selectSankeyIncome,
} from '~api/queries/sankey';
import { PageListStandard, SankeyLink, SankeyResponse } from '~api/types';
import { getDateFromYearAndMonth, getFinancialYear, startMonth } from '~shared/planning';

function aggregateSmallValues<T extends { weight: number }, NameKey extends keyof T = never>(
  items: T[],
  {
    parent,
    minWeight = 0.05,
    nameKey,
    totalWeightExplicit,
  }: {
    parent?: T[NameKey];
    minWeight?: number;
    nameKey?: NameKey;
    totalWeightExplicit?: number;
  } = {},
): {
  explicit: T[];
  aggregatedWeight: number;
} {
  const totalWeight =
    totalWeightExplicit ?? items.reduce<number>((sum, { weight }) => sum + weight, 0);

  const isExplicit = (item: T): boolean =>
    !(nameKey && item[nameKey] === parent) && item.weight / totalWeight >= minWeight;

  const explicit = items.filter(isExplicit);
  const aggregatedWeight = items
    .filter((item) => !isExplicit(item))
    .reduce<number>((sum, { weight }) => sum + weight, 0);

  return { explicit, aggregatedWeight };
}

const withIncome =
  (rows: readonly SankeyIncomeRow[]) =>
  (links: SankeyLink[]): SankeyLink[] => {
    const extra = Object.values(
      groupBy(
        rows.filter((row) => !row.is_wages),
        'item',
      ),
    )
      .map<SankeyIncomeRow>((group) => ({
        ...group[0],
        weight: group.reduce<number>((sum, { weight }) => sum + weight, 0),
      }))
      .sort((a, b) => b.weight - a.weight);

    const { explicit: extraExplicit, aggregatedWeight } = aggregateSmallValues(extra);

    const extraImplicit: SankeyLink = {
      from: 'Miscellaneous (aggregated)',
      to: Links.Budget,
      weight: aggregatedWeight,
    };

    const explicitRows = [
      ...rows.filter((row) => row.is_wages).sort((a, b) => (a.item < b.item ? -1 : 1)),
      ...extraExplicit,
    ];

    const explicitLinks = explicitRows.reduce<SankeyLink[]>(
      (prev, row) => [
        ...prev,
        {
          from: row.item,
          to: Links.Budget,
          weight: row.weight,
        },
      ],
      [],
    );

    return [...links, ...explicitLinks, extraImplicit];
  };

const withIncomeDeductions =
  (rows: readonly SankeyIncomeDeductionRow[]) =>
  (links: SankeyLink[]): SankeyLink[] => {
    const positiveValues = rows.filter((row) => row.weight > 0);
    const negativeValues = rows.filter((row) => row.weight < 0);

    const totalWeight = rows.reduce<number>((sum, { weight }) => sum + Math.abs(weight), 0);
    const negativeValuesWeight = negativeValues.reduce<number>(
      (sum, { weight }) => sum - weight,
      0,
    );

    const positiveLinks = aggregateSmallValues(
      positiveValues.reduce<SankeyLink[]>(
        (prev, row) => [
          ...prev,
          {
            from: row.name,
            to: Links.Budget,
            weight: row.weight,
          },
        ],
        [],
      ),
      { minWeight: 0.05, totalWeightExplicit: totalWeight },
    );

    const negativeLinks = aggregateSmallValues(
      negativeValues.reduce<SankeyLink[]>(
        (prev, row) => [
          ...prev,
          {
            from: Links.Deductions,
            to: row.name,
            weight: -row.weight,
          },
        ],
        [],
      ),
      { minWeight: 0.05, totalWeightExplicit: totalWeight },
    );

    return [
      ...links,
      { from: Links.Budget, to: Links.Deductions, weight: negativeValuesWeight },
      ...positiveLinks.explicit,
      ...negativeLinks.explicit,
    ];
  };

const withExpenses =
  (expenses: readonly SankeyExpenseRow[]) =>
  (links: SankeyLink[]): SankeyLink[] =>
    Object.values(PageListStandard).reduce<SankeyLink[]>((prev, page) => {
      const link = capitalize(page);
      const filtered = expenses.filter((compare) => compare.page === page);
      const filteredWeight = filtered.reduce<number>((sum, { weight }) => sum + weight, 0);

      if (!filteredWeight) {
        return prev;
      }

      const { explicit, aggregatedWeight } = aggregateSmallValues(filtered, {
        nameKey: 'category',
        parent: link,
      });

      return [
        ...prev,
        {
          from: Links.Budget,
          to: link,
          weight: filteredWeight,
        },
        ...explicit.map<SankeyLink>((row) => ({
          from: link,
          to: row.category,
          weight: row.weight,
        })),
        {
          from: link,
          to: `Miscellaneous (${page})`,
          weight: aggregatedWeight,
        },
      ];
    }, links);

const withInvestments =
  (investments: readonly SankeyInvestmentsRow[]) =>
  (links: SankeyLink[]): SankeyLink[] => {
    const totalWeight = investments.reduce<number>((sum, { weight }) => sum + weight, 0);
    return [
      ...links,
      {
        from: Links.Budget,
        to: Links.Investments,
        weight: totalWeight,
      },
      ...investments.map<SankeyLink>((row) => ({
        from: Links.Investments,
        to: row.name,
        weight: row.weight,
      })),
    ];
  };

export async function getSankeyDiagram(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<SankeyResponse> {
  const financialYear = getFinancialYear(new Date());
  const endOfFinancialYear = getDateFromYearAndMonth(financialYear + 1, (startMonth + 1) % 12);

  const [income, incomeDeductions, expenses, investments] = await Promise.all([
    selectSankeyIncome(db, uid),
    selectSankeyDeductions(db, uid),
    selectExpenses(db, uid, endOfFinancialYear),
    selectInvestments(db, uid, endOfFinancialYear),
  ]);

  const links = compose(
    withInvestments(investments),
    withExpenses(expenses),
    withIncomeDeductions(incomeDeductions),
    withIncome(income),
  )([]);

  return {
    links,
  };
}
