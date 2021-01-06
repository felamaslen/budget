import config from '~api/config';

import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import { AppConfig, MutationSetConfigArgs } from '~api/types';
import { Context } from '~api/types/resolver';

import { defaultFundLength, defaultFundPeriod } from '~client/constants';

export const defaultConfig: Omit<AppConfig, 'birthDate' | 'pieTolerance' | 'futureMonths'> = {
  fundPeriod: defaultFundPeriod,
  fundLength: defaultFundLength,
};

export function getAppConfig(_: unknown, __: unknown, ctx: Context): AppConfig {
  return {
    birthDate: config.data.overview.birthDate,
    pieTolerance: config.data.pie.tolerance,
    futureMonths: config.data.overview.numFuture,
    fundPeriod: ctx.session.config?.fundPeriod ?? defaultConfig.fundPeriod,
    fundLength: ctx.session.config?.fundLength ?? defaultConfig.fundLength,
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
    fundPeriod: args.config.fundPeriod ?? previousConfig.fundPeriod,
    fundLength: args.config.fundLength ?? previousConfig.fundLength,
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
