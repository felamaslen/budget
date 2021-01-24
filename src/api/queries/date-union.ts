import { startOfDay, startOfMonth } from 'date-fns';
import { format } from 'date-fns-tz';
import { sql, TaggedTemplateLiteralInvocationType } from 'slonik';
import config from '~api/config';

const toLocalISO = (date: Date): string =>
  format(date, 'yyyy-MM-dd', { timeZone: config.timeZone });

const formatMonthStart = (month: Date): string => toLocalISO(startOfMonth(month));

export const getEndOfMonthUnion = (monthEnds: Date[]): TaggedTemplateLiteralInvocationType =>
  sql`
  SELECT ${sql.join(
    [
      sql`${toLocalISO(monthEnds[0])}::date AS month_date`,
      ...monthEnds.slice(1).map((date) => sql`${toLocalISO(date)}::date`),
    ],
    sql` UNION SELECT `,
  )}
  `;

export const getMonthRangeUnion = (monthEnds: Date[]): TaggedTemplateLiteralInvocationType =>
  sql`
  SELECT ${sql.join(
    [
      sql`${formatMonthStart(monthEnds[0])}::date AS start_date, ${toLocalISO(
        monthEnds[0],
      )}::date AS end_date`,
      ...monthEnds
        .slice(1)
        .map((date) =>
          sql.join([sql`${formatMonthStart(date)}::date`, sql`${toLocalISO(date)}::date`], sql`, `),
        ),
    ],
    sql` UNION SELECT `,
  )}
  `;

const formatDayStart = (date: Date): string => toLocalISO(startOfDay(date));

export const getDateRangeUnion = (dayEnds: Date[]): TaggedTemplateLiteralInvocationType =>
  sql`
  SELECT ${sql.join(
    dayEnds.map((date) => sql`${formatDayStart(date)}::date AS date`),
    sql` UNION SELECT `,
  )}
  `;
