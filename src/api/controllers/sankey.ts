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

type SankeyLinkWithLevel = SankeyLink & { level: number };

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

const withLevel =
  (level: number) =>
  (links: SankeyLink[]): SankeyLinkWithLevel[] =>
    links.map((link) => ({ ...link, level }));

const withIncome =
  (rows: readonly SankeyIncomeRow[]) =>
  (links: SankeyLinkWithLevel[]): SankeyLinkWithLevel[] => {
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

    return [...links, ...withLevel(0)([...explicitLinks, extraImplicit])];
  };

const withIncomeDeductions =
  (rows: readonly SankeyIncomeDeductionRow[]) =>
  (links: SankeyLinkWithLevel[]): SankeyLinkWithLevel[] => {
    const positiveValues = rows.filter((row) => row.weight > 0);
    const negativeValues = rows.filter((row) => row.weight < 0);

    const positiveValuesWeight = positiveValues.reduce<number>(
      (sum, { weight }) => sum + weight,
      0,
    );
    const negativeValuesWeight = negativeValues.reduce<number>(
      (sum, { weight }) => sum - weight,
      0,
    );

    const positiveLinks = aggregateSmallValues(
      positiveValues.reduce<SankeyLinkWithLevel[]>(
        (prev, row) => [
          ...prev,
          {
            level: 0,
            from: row.name,
            to: Links.Budget,
            weight: row.weight,
          },
        ],
        [],
      ),
      { minWeight: 0.05, totalWeightExplicit: positiveValuesWeight },
    );

    const negativeLinks = aggregateSmallValues(
      negativeValues.reduce<SankeyLinkWithLevel[]>(
        (prev, row) => [
          ...prev,
          {
            level: 2,
            from: Links.Deductions,
            to: row.name,
            weight: -row.weight,
          },
        ],
        [],
      ),
      { minWeight: 0.05, totalWeightExplicit: negativeValuesWeight },
    );

    return [
      ...links,
      { level: 1, from: Links.Budget, to: Links.Deductions, weight: negativeValuesWeight },
      ...positiveLinks.explicit,
      {
        level: 0,
        from: 'Salary extras (misc)',
        to: Links.Budget,
        weight: positiveLinks.aggregatedWeight,
      },
      ...negativeLinks.explicit,
      {
        level: 2,
        from: Links.Deductions,
        to: 'Deductions (misc)',
        weight: negativeLinks.aggregatedWeight,
      },
    ];
  };

const withExpenses =
  (expenses: readonly SankeyExpenseRow[]) =>
  (links: SankeyLinkWithLevel[]): SankeyLinkWithLevel[] =>
    Object.values(PageListStandard).reduce<SankeyLinkWithLevel[]>((prev, page) => {
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
          level: 1,
          from: Links.Budget,
          to: link,
          weight: filteredWeight,
        },
        ...explicit.map<SankeyLinkWithLevel>((row) => ({
          level: 2,
          from: link,
          to: row.category,
          weight: row.weight,
        })),
        {
          level: 2,
          from: link,
          to: `Miscellaneous (${page})`,
          weight: aggregatedWeight,
        },
      ];
    }, links);

const withInvestments =
  (investments: readonly SankeyInvestmentsRow[]) =>
  (links: SankeyLinkWithLevel[]): SankeyLinkWithLevel[] => {
    const totalWeight = investments.reduce<number>((sum, { weight }) => sum + weight, 0);
    return [
      ...links,
      {
        level: 1,
        from: Links.Budget,
        to: Links.Investments,
        weight: totalWeight,
      },
      ...investments.map<SankeyLinkWithLevel>((row) => ({
        level: 2,
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

  const allLinks = compose(
    withInvestments(investments),
    withExpenses(expenses),
    withIncomeDeductions(incomeDeductions),
    withIncome(income),
  )([]);

  const links = allLinks
    .sort((a, b) => {
      if (a.level < b.level) {
        return -1;
      }
      if (a.level > b.level) {
        return 1;
      }
      if (a.from === b.from) {
        return b.weight - a.weight;
      }
      const aParentLevel = allLinks.find((compare) => compare.to === a.from)?.level;
      const bParentLevel = allLinks.find((compare) => compare.to === b.from)?.level;
      if (typeof aParentLevel === 'undefined' || typeof bParentLevel === 'undefined') {
        if (typeof bParentLevel !== 'undefined') {
          return -1;
        }
        if (typeof aParentLevel !== 'undefined') {
          return 1;
        }
        return b.weight - a.weight;
      }
      if (aParentLevel < bParentLevel) {
        return -1;
      }
      if (aParentLevel > bParentLevel) {
        return 1;
      }

      const aParentWeight = allLinks
        .filter((compare) => compare.to === a.from)
        .reduce<number>((sum, link) => sum + link.weight, 0);
      const bParentWeight = allLinks
        .filter((compare) => compare.to === b.from)
        .reduce<number>((sum, link) => sum + link.weight, 0);
      if (aParentWeight > bParentWeight) {
        return -1;
      }
      if (aParentWeight < bParentWeight) {
        return 1;
      }
      return b.weight - a.weight;
    })
    .map<SankeyLink>(({ level, ...rest }) => rest);

  return { links };
}
