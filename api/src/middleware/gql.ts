import path from 'path';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { mergeResolvers } from '@graphql-tools/merge';
import { addResolversToSchema } from '@graphql-tools/schema';
import { IResolvers } from '@graphql-tools/utils';
import { graphqlHTTP } from 'express-graphql';

import logger from '~api/modules/logger';
import { resolvers as user } from '~api/resolvers/user';

const schemaFiles: string[] = ['../gql/schema.graphql', '../gql/user.graphql'];

export async function graphqlMiddleware(
  databaseName?: string,
): Promise<ReturnType<typeof graphqlHTTP>> {
  logger.verbose('Loading GraphQL schema...');
  const schemas = await loadSchema(
    schemaFiles.map((file) => path.resolve(__dirname, file)),
    { loaders: [new GraphQLFileLoader()] },
  );

  const resolvers: IResolvers = mergeResolvers([user(databaseName) as IResolvers]);

  const schema = addResolversToSchema({
    schema: schemas,
    resolvers,
  });

  return graphqlHTTP({
    schema,
    graphiql: true,
  });
}
