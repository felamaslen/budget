package london.fela.budget.helper;

import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;

import london.fela.budget.app.AppConfig;

/**
 * Common methods and constants
 */
public class Data {
  private static final String[] monthsLong = {
    "January", "February", "March", "April", "May", "June", "July", "August", "September",
    "October", "November", "December"
  };

  public static final String[] months = {
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  };

  public static final Map<String, String> user = new HashMap<>();

  public static boolean dataPreLoaded = false;

  // cache data here
  public static class Cache {
    public static class Overview {
      public static Map<String, int[]> cost = new HashMap<>();

      public static int startYear     = 0;
      public static int startMonth    = 0;
      public static int endYear       = 0;
      public static int endMonth      = 0;
      public static int currentYear   = 0;
      public static int currentMonth  = 0;
    }

    public static HashMap<String, PageCache> Pages = new HashMap<>();
  }

  public static HashMap<String, String> getOtherProps(String page, JSONObject json) {
    HashMap<String, String> values = new HashMap<>();

    try {
      switch (page) {
        case "food":
        case "general":
          values.put("category", json.getString("k"));
          values.put("shop", json.getString("s"));
          break;

        case "holiday":
          values.put("holiday", json.getString("h"));
          values.put("shop", json.getString("s"));
          break;

        case "social":
          values.put("society", json.getString("y"));
          values.put("shop", json.getString("s"));
          break;
      }
    }
    catch (JSONException e) {
      e.printStackTrace();
    }

    return values;
  }

  /**
   * format year and month as (e.g.) September-2016
   */
  public static String yearMonth(int year, int month) {
    return monthsLong[month - 1] + " " + String.valueOf(year);
  }

  public static int yearMonthDifference(int newYear, int newMonth, int oldYear, int oldMonth) {
    return 12 * (newYear - oldYear) + newMonth - oldMonth;
  }

  /**
   * format number (int) as currency
   */
  public static String formatCurrency(int cost) {
    DecimalFormat format = new DecimalFormat("#0.00");
    format.setGroupingUsed(true);
    format.setGroupingSize(3);

    // convert int (pence) to double (pounds)
    double costDouble = (double)cost / 100;

    return AppConfig.currencySymbol + format.format(costDouble);
  }

  /**
   * format year,month,date as DD/MM/YYYY
   */
  public static String formatDate(int year, int month, int date) {
    DecimalFormat format = new DecimalFormat("##");
    format.setGroupingUsed(false);

    return format.format(date) + "/" + format.format(month) + "/" + String.valueOf(year);
  }

  public static void setInputCurrency(final EditText input) {
    //input.setRawInputType(Configuration.);

    input.addTextChangedListener(new NumberTextWatcher(input));
  }

  private static class NumberTextWatcher implements TextWatcher {
    private final DecimalFormat df;
    private final DecimalFormat dfnd;
    private final EditText et;
    private boolean hasFractionalPart;
    private int trailingZeroCount;

    NumberTextWatcher(EditText editText) {
      df = new DecimalFormat("#,###.##");
      df.setDecimalSeparatorAlwaysShown(true);
      dfnd = new DecimalFormat("#,###.00");
      this.et = editText;
      hasFractionalPart = false;
    }

    @Override
    public void afterTextChanged(Editable s) {
      et.removeTextChangedListener(this);

      if (s != null && !s.toString().isEmpty()) {
        try {
          int inilen, endlen;
          inilen = et.getText().length();
          String v = s.toString().replace(String.valueOf(df.getDecimalFormatSymbols().getGroupingSeparator()), "")
            .replace("£","");
          Number n = df.parse(v);
          int cp = et.getSelectionStart();
          if (hasFractionalPart) {
            StringBuilder trailingZeros = new StringBuilder();
            while (trailingZeroCount-- > 0) {
              trailingZeros.append('0');
            }
            String etv = df.format(n) + trailingZeros.toString();
            et.setText(etv);
          } else {
            et.setText(dfnd.format(n));
          }
          et.setText("£".concat(et.getText().toString()));
          endlen = et.getText().length();
          int sel = (cp + (endlen - inilen));
          if (sel > 0 && sel < et.getText().length()) {
            et.setSelection(sel);
          } else if (trailingZeroCount > -1) {
            et.setSelection(et.getText().length() - 3);
          } else {
            et.setSelection(et.getText().length());
          }
        } catch (NumberFormatException | ParseException e) {
          e.printStackTrace();
        }
      }

      et.addTextChangedListener(this);
    }

    @Override
    public void beforeTextChanged(CharSequence s, int start, int count, int after) {
    }

    @Override
    public void onTextChanged(CharSequence s, int start, int before, int count) {
      int index = s.toString().indexOf(String.valueOf(df.getDecimalFormatSymbols().getDecimalSeparator()));
      trailingZeroCount = 0;
      if (index > -1) {
        for (index++; index < s.length(); index++) {
          if (s.charAt(index) == '0')
            trailingZeroCount++;
          else {
            trailingZeroCount = 0;
          }
        }
        hasFractionalPart = true;
      } else {
        hasFractionalPart = false;
      }
    }
  }

  /**
   * get the maximum value of an int[] array
   */
  public static int intArrayMax(int[] array) {
    int max = 0;
    for (int item : array) {
      max = Math.max(max, item);
    }

    return max;
  }

  /**
   * get the rounded average value of an int[] array
   */
  public static int intArrayAvg(int[] array, int length) {
    int sum = 0;
    for (int i = 0; i < length; i++) {
      sum += array[i];
    }

    return (int)Math.round((double)sum / length);
  }
}
