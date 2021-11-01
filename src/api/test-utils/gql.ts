import type { DocumentNode } from 'graphql';
import * as w from 'wonka';

import type { App } from './create-server';
import type { Maybe, Mutation, Query } from '~api/types';

export async function runQuery<Args extends Record<string, unknown>>(
  app: App,
  query: DocumentNode,
  args?: Args,
): Promise<Maybe<Query>> {
  const res = await app.authGqlClient.query<Query, Args>(query, args).toPromise();
  return res.data ?? null;
}

export async function runMutation<Args extends Record<string, unknown>>(
  app: App,
  query: DocumentNode,
  args?: Args,
): Promise<Maybe<Mutation>> {
  const res = await app.authGqlClient.mutation<Mutation, Args>(query, args).toPromise();
  return res.data ?? null;
}

export async function runSubscription<Subscription, Args extends Record<string, unknown>>(
  app: App,
  subscription: DocumentNode,
  args?: Args,
): Promise<Maybe<Subscription>> {
  return new Promise<Maybe<Subscription>>((resolve) => {
    const { unsubscribe } = w.pipe(
      app.authGqlClient.subscription<Subscription, Args>(subscription, args),
      w.subscribe((result) => {
        unsubscribe();
        resolve(result.data ?? null);
      }),
    );
  });
}
