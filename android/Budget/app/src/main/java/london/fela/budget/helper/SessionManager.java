package london.fela.budget.helper;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Manages sessions
 */
public class SessionManager {
  // Shared Preferences
  private final SharedPreferences pref;

  // Shared preferences file name
  private static final String PREF_NAME         = "BudgetLogin";
  private static final String KEY_IS_LOGGED_IN  = "isLoggedIn";

  public SessionManager(Context context) {
    pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);

    // TODO: set preferences here?
  }

  public void setLogin(boolean isLoggedIn) {
    pref.edit().putBoolean(KEY_IS_LOGGED_IN, isLoggedIn).apply();
  }

  public boolean isLoggedIn() {
    return pref.getBoolean(KEY_IS_LOGGED_IN, false);
  }
}
