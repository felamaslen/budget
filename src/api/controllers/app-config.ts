import { formatISO } from 'date-fns';
import config from '~api/config';

import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import { AppConfig, MutationSetConfigArgs } from '~api/types';
import { Context } from '~api/types/resolver';

import {
  defaultBirthDate,
  defaultFundLength,
  defaultFundMode,
  defaultFundPeriod,
  defaultRealTimePrices,
} from '~shared/constants';

export function getAppConfig(_: unknown, __: unknown, ctx: Context): AppConfig {
  return {
    birthDate: ctx.session.config?.birthDate ?? defaultBirthDate,
    futureMonths: config.data.overview.numFuture,
    realTimePrices: ctx.session.config?.realTimePrices ?? defaultRealTimePrices,
    fundMode: ctx.session.config?.fundMode ?? defaultFundMode,
    fundPeriod: ctx.session.config?.fundPeriod ?? defaultFundPeriod,
    fundLength:
      typeof ctx.session.config?.fundLength === 'undefined'
        ? defaultFundLength
        : ctx.session.config?.fundLength ?? null,
  };
}

export function setAppConfig(
  root: unknown,
  args: MutationSetConfigArgs,
  ctx: Context,
): Promise<AppConfig> {
  const previousConfig = ctx.session.config ?? {};
  ctx.session.config = {
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

  return new Promise((resolve, reject) => {
    ctx.session.save((err) => {
      if (err) {
        reject(err);
      } else {
        const nextConfig = getAppConfig(root, {}, ctx);
        pubsub.publish(`${PubSubTopic.ConfigUpdated}.${ctx.session.uid}`, nextConfig);
        resolve(nextConfig);
      }
    });
  });
}
