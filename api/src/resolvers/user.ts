import { Request } from 'express';

import { attemptLogin } from '~api/controllers';
import { whoami, withResolverAuth } from '~api/modules/auth';
import { getIp } from '~api/modules/headers';
import { LoginResponse, MutationLoginArgs, Resolvers, UserInfo } from '~api/types';

export const userResolvers: Resolvers = {
  Query: {
    whoami: withResolverAuth((_, __, ctx): Promise<UserInfo | null> => whoami(ctx.user)),
  },

  Mutation: {
    login: async (_: unknown, { pin }: MutationLoginArgs, ctx: unknown): Promise<LoginResponse> => {
      try {
        return await attemptLogin(getIp(ctx as Request), pin, new Date());
      } catch (err) {
        return { error: err.message };
      }
    },
  },
};
