package london.fela.budget.app;

import java.util.Calendar;

import org.json.JSONException;
import org.json.JSONObject;

import london.fela.budget.helper.Data;

/**
 * Class for passing year,month,date as one object
 */
public class YMD {
  private final int year;
  private final int month;
  private final int date;

  private static final String separator = ",";

  public YMD(int theYear, int theMonth, int theDate) {
    year = theYear;
    month = theMonth;
    date = theDate;
  }

  public boolean isAfter(YMD ymd) {
    return year > ymd.year || year == ymd.year &&
      (month > ymd.month || month == ymd.month && date > ymd.date);
  }

  public boolean isEqual(YMD ymd) {
    return year == ymd.year && month == ymd.month && date == ymd.date;
  }

  public int getYear() { return year; }
  public int getMonth() { return month; }
  public int getDate() { return date; }

  public String serialise() {
    return String.valueOf(year) + separator +
      String.valueOf(month) + separator +
      String.valueOf(date);
  }
  
  public JSONObject getValuesForTransfer() {
    JSONObject data = new JSONObject();

    try {
      data.put("year", year);
      data.put("month", month);
      data.put("date", date);
    }
    catch (JSONException e) {
      return null;
    }

    return data;
  }

  public static YMD deserialise(String serial) {
    String[] parts;
    
    int theYear, theMonth, theDate;
    
    if (serial.length() > 0) {
      parts = serial.split(separator);

      theYear   = Integer.valueOf(parts[0]);
      theMonth  = Integer.valueOf(parts[1]);
      theDate   = Integer.valueOf(parts[2]);
    }
    else {
      // use the current date as the default
      Calendar calendar = Calendar.getInstance();

      theYear  = calendar.get(Calendar.YEAR);
      theMonth = calendar.get(Calendar.MONTH) + 1;
      theDate  = calendar.get(Calendar.DAY_OF_MONTH);
    }

    return new YMD(theYear, theMonth, theDate);
  }

  public String format() {
    return Data.formatDate(year, month, date);
  }
}
