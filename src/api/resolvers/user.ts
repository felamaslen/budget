import { attemptLogin, logout } from '~api/controllers';
import { whoami, withResolverAuth } from '~api/modules/auth';
import { LoginResponse, MutationLoginArgs, Resolvers, UserInfo } from '~api/types';
import { Context, isUserDefined } from '~api/types/resolver';
import { LogoutResponse } from '~client/types/gql';

export const userResolvers: Resolvers = {
  Query: {
    whoami: withResolverAuth(
      async (_, __, ctx): Promise<UserInfo | null> =>
        isUserDefined(ctx.user) ? whoami(ctx.user) : null,
    ),
  },

  Mutation: {
    login: async (_: unknown, { pin }: MutationLoginArgs, ctx: Context): Promise<LoginResponse> => {
      try {
        return await attemptLogin(ctx, pin, new Date());
      } catch (err) {
        return { error: err.message };
      }
    },

    logout: (_: unknown, __: unknown, ctx: Context): Promise<LogoutResponse> => logout(ctx),
  },
};
