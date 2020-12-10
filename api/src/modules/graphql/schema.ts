import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { addResolversToSchema, makeExecutableSchema } from '@graphql-tools/schema';
import { IResolvers } from '@graphql-tools/utils';
import moize from 'moize';

import * as gql from '~api/gql';
import * as resolvers from '~api/resolvers';

export const getSchema = moize(() => {
  const mergedResolvers = mergeResolvers(Object.values(resolvers) as IResolvers[]);

  const typeDefs = mergeTypeDefs(Object.values(gql));

  const schema = addResolversToSchema({
    schema: makeExecutableSchema({ typeDefs }),
    resolvers: mergedResolvers,
  });

  return schema;
});
