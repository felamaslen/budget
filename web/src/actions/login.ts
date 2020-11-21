export const enum ActionTypeLogin {
  ApiKeySet = '@@login/API_KEY_SET',
  LoggedOut = '@@login/LOGGED_OUT',
}

export type ActionApiKeySet = {
  type: ActionTypeLogin.ApiKeySet;
  apiKey: string;
};

export const apiKeySet = (apiKey: string): ActionApiKeySet => ({
  type: ActionTypeLogin.ApiKeySet,
  apiKey,
});

export type ActionLoggedOut = {
  type: ActionTypeLogin.LoggedOut;
};

export const loggedOut = (): ActionLoggedOut => ({ type: ActionTypeLogin.LoggedOut });

export type ActionLogin = ActionApiKeySet | ActionLoggedOut;
