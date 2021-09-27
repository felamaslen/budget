import {
  DateResolver,
  DateTimeResolver,
  NonNegativeIntResolver,
  NonNegativeFloatResolver,
  PositiveIntResolver,
} from 'graphql-scalars';

import { Resolvers } from '~api/types';

export * from './analysis';
export * from './buckets';
export * from './config';
export * from './exchange-rates';
export * from './funds';
export * from './list';
export * from './income';
export * from './net-worth';
export * from './overview';
export * from './search';
export * from './user';

export const mainResolvers: Resolvers = {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  NonNegativeInt: NonNegativeIntResolver,
  NonNegativeFloat: NonNegativeFloatResolver,
  PositiveInt: PositiveIntResolver,
};
