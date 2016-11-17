package london.fela.budget.app;

import android.content.res.Resources;
import android.graphics.Color;

import java.util.HashMap;
import java.util.Map;
import java.lang.String;

import london.fela.budget.R;

/**
 * Application-specific constants
 */
public class AppConfig {
  public static final String URL_LOGIN = "login";

  public static final String URL_DATA_ALL       = "data/all";

  public static final String URL_UPDATE_OVERVIEW  = "update/overview";
  public static final String URL_UPDATE_FUNDS     = "update/funds";
  public static final String URL_UPDATE_IN        = "update/in";
  public static final String URL_UPDATE_BILLS     = "update/bills";
  public static final String URL_UPDATE_FOOD      = "update/food";
  public static final String URL_UPDATE_GENERAL   = "update/general";
  public static final String URL_UPDATE_HOLIDAY   = "update/holiday";
  public static final String URL_UPDATE_SOCIAL    = "update/social";

  public static final String URL_ADD_FUNDS     = "add/funds";
  public static final String URL_ADD_IN        = "add/in";
  public static final String URL_ADD_BILLS     = "add/bills";
  public static final String URL_ADD_FOOD      = "add/food";
  public static final String URL_ADD_GENERAL   = "add/general";
  public static final String URL_ADD_HOLIDAY   = "add/holiday";
  public static final String URL_ADD_SOCIAL    = "add/social";

  public static final int DIALOG_MSG_LOADING_ALL      = 71885;
  public static final int DIALOG_MSG_LOADING_FUNDS    = 91784;
  public static final int DIALOG_MSG_LOADING_IN       = 10922;
  public static final int DIALOG_MSG_LOADING_BILLS    = 81904;
  public static final int DIALOG_MSG_LOADING_FOOD     = 33191;
  public static final int DIALOG_MSG_LOADING_GENERAL  = 41381;
  public static final int DIALOG_MSG_LOADING_HOLIDAY  = 38105;
  public static final int DIALOG_MSG_LOADING_SOCIAL   = 91847;
  static final int DIALOG_MSG_LOADING_SCAN     = 81199;

  public static final int SCAN_REQUEST_CODE = 1886;

  public static final String ACTION_SCAN = "com.google.zxing.client.android.SCAN";

  public static final String[] tabs = {
    "Overview", "Funds", "In", "Bills", "Food", "General", "Holiday", "Social"
  };

  public static final String[] pages = {
    "funds", "in", "bills", "food", "general", "holiday", "social"
  };

  public static final String currencySymbol = "\u00a3";

  public static class PageColor {
    private static final Map<String, Integer> bgColor = new HashMap<>();

    static {
      bgColor.put("funds",    Color.rgb(194, 221, 234));
      bgColor.put("in",       Color.rgb(255, 197, 179));
      bgColor.put("bills",    Color.rgb(234, 190, 182));
      bgColor.put("food",     Color.rgb(165, 212, 166));
      bgColor.put("general",  Color.rgb(170, 200, 224));
      bgColor.put("holiday",  Color.rgb(162, 222, 215));
      bgColor.put("social",   Color.rgb(217, 202, 148));
    }

    public static int getBg(String pageName) {
      return bgColor.get(pageName);
    }
  }

  public static String api_url(Resources resources) {
    return resources.getString(R.string.api_url) + "/api?t=";
  }
}
