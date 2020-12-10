export const enum ActionTypeLogin {
  LoggedOut = '@@login/LOGGED_OUT',
}

export type ActionLoggedOut = {
  type: ActionTypeLogin.LoggedOut;
};

export const loggedOut = (): ActionLoggedOut => ({ type: ActionTypeLogin.LoggedOut });

export type ActionLogin = ActionLoggedOut;
