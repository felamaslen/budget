import { isBoom } from '@hapi/boom';
import { withFilter } from 'graphql-subscriptions';
import { DatabaseTransactionConnectionType } from 'slonik';

import { CrudControllerFactory } from './types';
import { withResolverAuth } from '~api/modules/auth';
import { withSlonik } from '~api/modules/db';
import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import logger from '~api/modules/logger';
import {
  Maybe,
  MaybePromise,
  Item,
  CrudResponseCreate,
  CrudResponseUpdate,
  CrudResponseDelete,
  Create,
  ResolversTypes,
  SubscriptionResolverObject,
  ResolversParentTypes,
} from '~api/types';
import { AuthenticatedRequest, Context, Resolver } from '~api/types/resolver';

type AuthDbResolverHandler<A, R> = (
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: A,
) => MaybePromise<R>;

export function genericAuthDbResolver<Args, Response>(
  handler: AuthDbResolverHandler<Args, Response>,
): Resolver<Args, Response> {
  return withResolverAuth(
    withSlonik<Response, [unknown, Args, AuthenticatedRequest]>(async (db, _, args, ctx) =>
      handler(db, ctx.user.uid, args),
    ),
  );
}

export function genericMutationResolver<Result extends { error?: Maybe<string> }, MutationArgs>(
  handler: AuthDbResolverHandler<MutationArgs, Result>,
): Resolver<MutationArgs, Maybe<Partial<Result>>> {
  return genericAuthDbResolver<MutationArgs, Partial<Result>>(async (db, uid, args) => {
    try {
      return await db.transaction(async (trx) => handler(trx, uid, args));
    } catch (err) {
      if (isBoom(err) && err.output.statusCode < 500) {
        return { error: err.message } as Partial<Result>;
      }
      logger.error('[mutation] %s', err.stack);
      return { error: 'Server error' } as Partial<Result>;
    }
  });
}

type CreateArgs<J> = { input: Create<J> };

export const createResolver = <J extends Item>(
  controller: Pick<CrudControllerFactory<J>, 'create'>,
): Resolver<CreateArgs<J>, Maybe<CrudResponseCreate>> =>
  genericMutationResolver<CrudResponseCreate, CreateArgs<J>>(async (db, uid, args) => {
    const { id } = await controller.create(db, uid, args.input);
    return { id };
  });

type ReadArgs = { id?: Maybe<number> };

export const readResolver = <J extends Item>(
  controller: Pick<CrudControllerFactory<J>, 'read'>,
): Resolver<ReadArgs, J[]> => {
  return genericAuthDbResolver<ReadArgs, J[]>(async (db, uid, args) => {
    try {
      const results = await controller.read(db, uid, args.id ?? undefined);
      return results;
    } catch (err) {
      if (isBoom(err) && err.output.statusCode === 404) {
        return [];
      }
      throw err;
    }
  });
};

type UpdateArgs<J> = { id: number; input: Create<J> };

export const updateResolver = <J extends Item>(
  controller: Pick<CrudControllerFactory<J>, 'update'>,
): Resolver<UpdateArgs<J>, Maybe<CrudResponseUpdate>> =>
  genericMutationResolver<CrudResponseUpdate, UpdateArgs<J>>(async (db, uid, args) => {
    await controller.update(db, uid, args.id, args.input);
    return { error: null };
  });

type DeleteArgs = { id: number };

export const deleteResolver = <J extends Item>(
  controller: Pick<CrudControllerFactory<J>, 'delete'>,
): Resolver<DeleteArgs, Maybe<CrudResponseDelete>> =>
  genericMutationResolver<CrudResponseDelete, DeleteArgs>(async (db, uid, args) => {
    await controller.delete(db, uid, args.id);
    return { error: null };
  });

const getSubscriberIterator = (topic: PubSubTopic, context: Context): AsyncIterator<void> =>
  pubsub.asyncIterator(`${topic}.${context.user?.uid ?? 0}`, {
    pattern: true,
  });

export function createSubscription<K extends keyof ResolversTypes>(
  topic: PubSubTopic,
): SubscriptionResolverObject<ResolversTypes[K], unknown, Context, unknown> {
  return {
    subscribe: (_, __, context): AsyncIterator<void> => getSubscriberIterator(topic, context),
    resolve: (payload: ResolversTypes[K]): ResolversTypes[K] => payload,
  };
}

export function createFilteredSubscription<
  K extends keyof ResolversParentTypes,
  A extends Record<string, unknown>
>(
  topic: PubSubTopic,
  filter: (payload: ResolversParentTypes[K], args: A) => boolean,
): SubscriptionResolverObject<ResolversTypes[K], unknown, Context, A> {
  return {
    subscribe: withFilter(
      (_: unknown, __: A, context: Context) => getSubscriberIterator(topic, context),
      filter,
    ),
    resolve: (payload: ResolversTypes[K]): ResolversTypes[K] => payload,
  };
}
