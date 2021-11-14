import {
  DatabaseTransactionConnectionType,
  IdentifierSqlTokenType,
  sql,
  SqlTokenType,
  TaggedTemplateLiteralInvocationType,
} from 'slonik';
import type { ParameterRow } from './types';
import { startMonth } from '~shared/planning';

export const upsertUserParameterRowsByYear =
  (valueType: 'int4' | 'float8', tableName: string) =>
  async (
    db: DatabaseTransactionConnectionType,
    uid: number,
    year: number,
    inputs: Omit<ParameterRow, 'id' | 'uid'>[],
  ): Promise<void> => {
    const { rows: existingIdRows } = await db.query<{ id: number }>(sql`
    INSERT INTO ${sql.identifier([`planning_${tableName}`])} (uid, year, name, value)
    SELECT * FROM ${sql.unnest(
      inputs.map((input) => [uid, input.year, input.name, input.value]),
      ['int4', 'int4', 'text', valueType],
    )}
    ON CONFLICT (uid, year, name) DO UPDATE SET value = excluded.value
    RETURNING id
    `);

    await db.query(sql`
    DELETE FROM ${sql.identifier([`planning_${tableName}`])}
    WHERE uid = ${uid} AND year = ${year} AND id != ALL(${sql.array(
      existingIdRows.map((row) => row.id),
      'int4',
    )})
    `);
  };

export const selectParameterRows =
  (tableName: string) =>
  async (
    db: DatabaseTransactionConnectionType,
    uid: number,
    years: number[],
  ): Promise<readonly ParameterRow[]> => {
    const { rows } = await db.query<ParameterRow>(sql`
    SELECT * FROM ${sql.identifier([`planning_${tableName}`])}
    WHERE uid = ${uid} AND year = ANY(${sql.array(years, 'int4')})
    ORDER BY name
    `);
    return rows;
  };

export const financialYearStart = (year: number): TaggedTemplateLiteralInvocationType =>
  sql`make_date(${year}, ${startMonth + 1}, 1)`;

export const planningStartDateCTE = (
  uid: number,
  year: number,
): TaggedTemplateLiteralInvocationType => sql`(
  SELECT COALESCE(MAX(date), ${financialYearStart(year)}) AS date
  FROM net_worth
  WHERE uid = ${uid} AND date < ${financialYearStart(year)}
)`;

export const planningStartDateIncludingWholePreviousYearCTE = (
  startDateCteName = 'start_date',
): TaggedTemplateLiteralInvocationType => sql`make_date(
  (CASE WHEN date_part('month', ${sql.identifier([startDateCteName, 'date'])}) - 1 < ${startMonth}
   THEN date_part('year', ${sql.identifier([startDateCteName, 'date'])}) - 1
   ELSE date_part('year', ${sql.identifier([startDateCteName, 'date'])})
   END)::int4,
  ${startMonth + 1},
  1
)`;

export const financialDateCTE = (
  year: IdentifierSqlTokenType | SqlTokenType,
  month: IdentifierSqlTokenType | SqlTokenType,
): TaggedTemplateLiteralInvocationType => sql`make_date(
  CASE WHEN ${month} < ${startMonth} THEN ${year} + 1 ELSE ${year} END,
  ${month} + 1,
  1
)`;
