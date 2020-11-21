import { isObject } from 'util';
import { DateTimeResolver } from 'graphql-scalars';
import jwt from 'jsonwebtoken';

import config from '~api/config';
import { attemptLogin } from '~api/controllers';
import { whoami, jwtFromRequest } from '~api/modules/auth';
import { getIp } from '~api/modules/headers';
import { LoginResponse, Resolvers, UserInfo } from '~api/types';

export const resolvers = (databaseName?: string): Resolvers => ({
  Query: {
    whoami: async (_, __, ctx): Promise<UserInfo | null> => {
      const token = jwtFromRequest(ctx);
      if (!token) {
        return null;
      }
      const tokenData = jwt.verify(token, config.user.tokenSecret);
      if (!isObject(tokenData)) {
        return null;
      }
      return whoami(tokenData as object, databaseName);
    },
  },

  Mutation: {
    login: async (_, { pin }, ctx): Promise<LoginResponse> => {
      try {
        return await attemptLogin(getIp(ctx), pin, new Date(), databaseName);
      } catch (err) {
        return { error: err.message };
      }
    },
  },

  DateTime: DateTimeResolver,
});
