import { graphqlHTTP } from 'express-graphql';

import { getSchema } from './schema';

export function graphqlMiddleware(): ReturnType<typeof graphqlHTTP> {
  return graphqlHTTP({
    schema: getSchema(),
    graphiql: true,
  });
}
