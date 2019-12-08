import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

import { HELLO } from '~/constants/actions.rt';

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      [HELLO]: {
        type: GraphQLString,
        resolve(): string {
          return 'world';
        },
      },
    },
  }),
});
