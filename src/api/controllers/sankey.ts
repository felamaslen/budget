import { compose } from '@typed/compose';
import { DatabaseTransactionConnectionType } from 'slonik';
import { SankeyIncomeRow, selectSankeyIncome } from '~api/queries/sankey';
import { SankeyLink, SankeyResponse } from '~api/types';

const middleLink = 'Budget';

const aggregateWeightFraction = 0.05;

const withIncome =
  (rows: readonly SankeyIncomeRow[]) =>
  (links: SankeyLink[]): SankeyLink[] => {
    const extra = rows.filter((row) => !row.is_wages).sort((a, b) => b.weight - a.weight);

    const totalExtraWeight = extra.reduce<number>((sum, { weight }) => sum + weight, 0);

    const extraImplicit = extra
      .filter(({ weight }) => weight / totalExtraWeight < aggregateWeightFraction)
      .reduce<SankeyLink>(
        (prev, row) => ({
          ...prev,
          weight: prev.weight + row.weight,
        }),
        {
          from: 'Miscellaneous (aggregated)',
          to: middleLink,
          weight: 0,
        },
      );

    const explicitRows = [
      ...rows.filter((row) => row.is_wages),
      ...extra.filter(({ weight }) => weight / totalExtraWeight >= aggregateWeightFraction),
    ];

    const explicitLinks = explicitRows.reduce<SankeyLink[]>(
      (prev, row) => [
        ...prev,
        {
          from: row.item,
          to: middleLink,
          weight: row.weight,
        },
      ],
      [],
    );

    return [...links, ...explicitLinks, extraImplicit];
  };

export async function getSankeyDiagram(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<SankeyResponse> {
  const [income] = await Promise.all([selectSankeyIncome(db, uid)]);

  const links = compose(withIncome(income))([]);

  return {
    links,
  };
}
