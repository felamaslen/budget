import { compose } from '@typed/compose';
import { groupBy } from 'lodash';
import { DatabaseTransactionConnectionType } from 'slonik';
import {
  SankeyIncomeDeductionRow,
  SankeyIncomeRow,
  selectSankeyDeductions,
  selectSankeyIncome,
} from '~api/queries/sankey';
import { SankeyLink, SankeyResponse } from '~api/types';

const enum Links {
  Budget = 'Budget',
  Deductions = 'Deductions',
}

function aggregateSmallValues<T extends { weight: number }>(
  items: T[],
  minWeight = 0.05,
  totalWeightExplicit?: number,
): {
  explicit: T[];
  aggregatedWeight: number;
} {
  const totalWeight =
    totalWeightExplicit ?? items.reduce<number>((sum, { weight }) => sum + weight, 0);
  const explicit = items.filter((item) => item.weight / totalWeight >= minWeight);
  const aggregatedWeight = items
    .filter((item) => item.weight / totalWeight < minWeight)
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
      0.05,
      totalWeight,
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
      0.05,
      totalWeight,
    );

    return [
      ...links,
      { from: Links.Budget, to: Links.Deductions, weight: negativeValuesWeight },
      ...positiveLinks.explicit,
      ...negativeLinks.explicit,
    ];
  };

export async function getSankeyDiagram(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<SankeyResponse> {
  const [income, incomeDeductions] = await Promise.all([
    selectSankeyIncome(db, uid),
    selectSankeyDeductions(db, uid),
  ]);

  const links = compose(withIncomeDeductions(incomeDeductions), withIncome(income))([]);

  return {
    links,
  };
}
