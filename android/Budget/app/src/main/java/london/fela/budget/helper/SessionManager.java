package london.fela.budget.helper;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;

/**
 * Manages sessions
 */
public class SessionManager {
  // LogCat tag
  private static String TAG = SessionManager.class.getSimpleName();

  // Shared Preferences
  private final SharedPreferences pref;

  private final Editor editor;

  // Shared preferences file name
  private static final String PREF_NAME = "BudgetLogin";

  private static final String KEY_IS_LOGGED_IN = "isLoggedIn";

  public SessionManager(Context context) {
    int PRIVATE_MODE = 0;
    pref = context.getSharedPreferences(PREF_NAME, PRIVATE_MODE);

    editor = pref.edit();

    // TODO: set preferences here?

    editor.apply();
  }

  public void setLogin(boolean isLoggedIn) {
    editor.putBoolean(KEY_IS_LOGGED_IN, isLoggedIn);

    // commit changes
    editor.commit();
  }

  public boolean isLoggedIn() {
    return pref.getBoolean(KEY_IS_LOGGED_IN, false);
  }
}
