package london.fela.budget.app;

import java.util.Calendar;

import london.fela.budget.helper.Data;

/**
 * Class for passing year,month,date as one object
 */
public class YMD {
    private final int year;
    private final int month;
    private final int date;

    private static final String separator = "-";

    private static String leadingZero(Integer number) {
        if (number < 10) {
            return "0" + String.valueOf(number);
        }

        return String.valueOf(number);
    }

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
        return YMD.leadingZero(year) + separator +
            YMD.leadingZero(month) + separator +
            YMD.leadingZero(date);
    }

    public static YMD deserialise(String serial) {
        String[] parts;
        
        int theYear, theMonth, theDate;
        
        if (serial != null && serial.length() > 0) {
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
