import { formatISO } from 'date-fns';
import { DatabaseTransactionConnectionType, sql } from 'slonik';
import config from '~api/config';
import { UserRow } from '~api/modules/auth';

import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import { AppConfig, AppConfigSet, MutationSetConfigArgs } from '~api/types';

import {
  defaultBirthDate,
  defaultFundLength,
  defaultFundMode,
  defaultFundPeriod,
  defaultRealTimePrices,
} from '~shared/constants';

const defaultAppConfig: AppConfig = {
  birthDate: defaultBirthDate,
  futureMonths: config.data.overview.numFuture,
  realTimePrices: defaultRealTimePrices,
  fundMode: defaultFundMode,
  fundPeriod: defaultFundPeriod,
  fundLength: defaultFundLength,
};

export async function getAppConfig(
  db: DatabaseTransactionConnectionType,
  uid?: number | null,
): Promise<AppConfig> {
  if (!uid) {
    return defaultAppConfig;
  }
  const { rowCount, rows } = await db.query(sql`SELECT config FROM users WHERE uid = ${uid}`);
  if (rowCount !== 1) {
    return defaultAppConfig;
  }

  // TODO: fix slonik types bug upstream so we can assert the type in the query
  // See this issue: https://github.com/gajus/slonik/issues/275
  const userAppConfig = (rows[0] as unknown) as Pick<UserRow, 'config'>;

  return {
    ...defaultAppConfig,
    birthDate: userAppConfig.config?.birthDate ?? defaultAppConfig.birthDate,
    realTimePrices: userAppConfig.config?.realTimePrices ?? defaultAppConfig.realTimePrices,
    fundMode: userAppConfig.config?.fundMode ?? defaultAppConfig.fundMode,
    fundPeriod: userAppConfig.config?.fundPeriod ?? defaultAppConfig.fundPeriod,
    fundLength:
      typeof userAppConfig.config?.fundLength === 'undefined'
        ? defaultAppConfig.fundLength
        : userAppConfig.config?.fundLength ?? null,
  };
}

export async function setAppConfig(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationSetConfigArgs,
): Promise<AppConfigSet> {
  const previousConfig = await getAppConfig(db, uid);
  const nextConfig: AppConfig = {
    ...previousConfig,
    birthDate: args.config.birthDate
      ? formatISO(args.config.birthDate, { representation: 'date' })
      : previousConfig.birthDate,
    realTimePrices: args.config.realTimePrices ?? previousConfig.realTimePrices,
    fundMode: args.config.fundMode ?? previousConfig.fundMode,
    fundPeriod: args.config.fundPeriod ?? previousConfig.fundPeriod,
    fundLength:
      typeof args.config.fundLength === 'undefined'
        ? previousConfig.fundLength
        : args.config.fundLength ?? null,
  };

  await db.query(sql`
  UPDATE users SET config = ${JSON.stringify(nextConfig)} WHERE uid = ${uid}
  `);

  pubsub.publish(`${PubSubTopic.ConfigUpdated}.${uid}`, nextConfig);
  return { config: nextConfig };
}
