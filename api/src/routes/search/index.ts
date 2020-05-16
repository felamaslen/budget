import { Router } from 'express';
import joi from 'joi';
import { sql, TaggedTemplateLiteralInvocationType, DatabasePoolConnectionType } from 'slonik';

import { authDbRoute } from '~api/middleware/request';
import { searchSchema } from '~api/schema';

type Params = {
  table: string;
  column: string;
  searchTerm: string;
  numResults: number;
};

type Result = {
  list: string[];
  nextCategory?: string[];
  nextField?: string;
};

const getColumnResults = (
  { table, column, searchTerm, numResults }: Params,
  uid: string,
): TaggedTemplateLiteralInvocationType<{ value: string }> => {
  if (searchTerm.length < 3) {
    return sql`
      select ${sql.join(
        [
          sql`distinct(${sql.identifier([table, column])}) as "value"`,
          sql`count(${sql.identifier([table, column])}) as "count"`,
        ],
        sql`, `,
      )}
      from ${sql.identifier([table])}
      where ${sql.join(
        [
          sql`${sql.identifier([table, column])} ilike ${`${searchTerm}%`}`,
          sql`${sql.identifier([table, 'uid'])} = ${uid}`,
        ],
        sql` and `,
      )}
      group by ${sql.identifier([table, column])}
      order by "count" desc
      limit ${numResults}
    `;
  }

  const tsQuery = searchTerm
    .trim()
    .replace(/[^\w\s+]/g, '')
    .split(/\s+/)
    .map(word => `${word}:*`)
    .join(' | ');

  return sql`
    select distinct ${sql.join(
      [
        sql`${sql.identifier([table, column])} as "value"`,
        sql`ts_rank_cd(
          ${sql.identifier([table, `${column}_search`])},
          to_tsquery(${tsQuery})
        ) as "rank"`,
        sql`char_length(${sql.identifier([table, column])}) as "length"`,
      ],
      sql`, `,
    )}
    from ${sql.identifier([table])}
    where ${sql.join(
      [
        sql`${sql.identifier([table, 'uid'])} = ${uid}`,
        sql`${sql.identifier([table, `${column}_search`])} @@ to_tsquery(${tsQuery})`,
      ],
      sql` and `,
    )}
    order by "rank" desc, "length" asc
    limit ${numResults}
  `;
};

const getSuggestions = async (
  db: DatabasePoolConnectionType,
  params: Params,
  uid: string,
): Promise<Result> => {
  const { table, column } = params;

  if (['food', 'general'].includes(table) && column === 'item') {
    const nextField = 'category'; // TODO: make this dynamic / define it somewhere

    const result = await db.query<{ value: string; nextField: string }>(
      sql`
          select ${sql.join(
            [
              sql.identifier(['items', 'value']),
              sql`coalesce(${sql.identifier(['next_values', nextField])}, '') as "nextField"`,
            ],
            sql`, `,
          )}
          from (
            ${getColumnResults(params, uid)}
          ) as items
          left join ${sql.identifier([table])} as "next_values"
            on ${sql.identifier(['next_values', 'id'])} = (
              select "id"
              from ${sql.identifier([table])}
              where ${sql.join([sql`"uid" = ${uid}`, sql`"item" = "items"."value"`], sql` and `)}
              limit 1
            )
        `,
    );

    const list = result.rows.map(({ value }) => value);
    const nextCategory = result.rows.map(({ nextField: value }) => value);

    return { list, nextCategory, nextField };
  }

  const result = await db.query<{ value: string }>(getColumnResults(params, uid));
  const list = result.rows.map(({ value }) => value);
  return { list };
};

const routeGet = authDbRoute(async (db, req, res) => {
  const { error, value } = joi.validate<Params>((req.params as unknown) as Params, searchSchema);
  if (error) {
    res.status(400);
    res.json({ errorMessage: error.message });
    return;
  }

  const data = await getSuggestions(db, value, req.user.uid);
  res.json({ data });
});

export function handler(): Router {
  const router = Router();
  router.get('/:table/:column/:searchTerm/:numResults?', routeGet);

  return router;
}
