package london.fela.budget.helper;

import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.util.Arrays;
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

    public static final String[] months = { "Jan", "Feb", "Mar", "Apr", "May",
		"Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

	public static final Map<String, String> user = new HashMap<>();

	public static boolean dataPreLoaded = false;

	// cache data here
	public static class Cache {
		public static class Overview {
			public static Map<String, int[]> cost = new HashMap<>();

			public static int startYear = 0;
			public static int startMonth = 0;
			public static int endYear = 0;
			public static int endMonth = 0;
			public static int currentYear = 0;
			public static int currentMonth = 0;
		}

		public static HashMap<String, PageCache> Pages = new HashMap<>();
	}

	private static HashMap<String, String> getConsumableProps(JSONObject json, String category, String categoryKey) {
		HashMap<String, String> values = new HashMap<>();

		try {
			values.put(category, json.getString(categoryKey));
			values.put("shop", json.getString("s"));
		}
		catch (JSONException e) {
		    // do nothing
        }

		return values;
	}

	private static HashMap<String, String> getFundsProps(JSONObject json) {
		HashMap<String, String> values = new HashMap<>();

		String placeholder = "-";
		
		try {
			JSONArray transactions = json.getJSONArray("tr");
			JSONArray prices = json.getJSONArray("pr");

			Double latestPrice = null;
			if (prices.length() > 0) {
                latestPrice = prices.getDouble(prices.length() - 1);
            }

            double latestUnits = 0;
			int latestCost = 0;
			
			int numTransactions = transactions.length();
			for (int i = 0; i < numTransactions; i++) {
				JSONObject transaction = transactions.getJSONObject(i);
				latestUnits += transaction.getDouble("units");
				latestCost += transaction.getInt("cost");
			}

			if (latestPrice != null) {
                int value = (int) (latestUnits * latestPrice);
                values.put("value", formatCurrency(value, true));
            }
            else {
                values.put("value", placeholder);
            }

            values.put("cost", formatCurrency(latestCost, true));
		}
		catch (JSONException e) {
		    e.printStackTrace();

			values.put("value", placeholder);
			values.put("cost", placeholder);
		}

		return values;
	}

	public static HashMap<String, String> getOtherProps(String page, JSONObject json) {
		if (page.equals("food") || page.equals("general")) {
			return getConsumableProps(json, "category", "k");
		}
		if (page.equals("holiday")) {
			return getConsumableProps(json, "holiday", "h");
		}
		if (page.equals("social")) {
			return getConsumableProps(json, "shop", "s");
		}
		if (page.equals("funds")) {
			return getFundsProps(json);
		}

		return new HashMap<>();
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
		return formatCurrency(cost, false);
	}
	public static String formatCurrency(int cost, boolean abbreviate) {
		String result;
		String format = "#0.00";
		// convert int (pence) to double (pounds)
		double costDouble = (double)cost / 100;

		String abbreviation = "";
		if (abbreviate && costDouble != 0) {
				String[] abbr = {"k", "m", "bn", "tn"};
				int log = (int) Math.min(Math.floor(Math.log10(Math.abs(costDouble)) / 3), abbr.length);
				if (log > 0) {
						abbreviation = abbr[log - 1];
						costDouble = costDouble / Math.pow(10, log * 3);
						format = "#0.0";
				}
		}

		DecimalFormat formatter = new DecimalFormat(format);
		formatter.setGroupingUsed(true);
		formatter.setGroupingSize(3);

		result = formatter.format(costDouble);

		if (abbreviation.length() > 0) {
				result = result + abbreviation;
		}

		return AppConfig.currencySymbol + result;
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
	 * get the rounded average (mean or median) value of an int[] array
	 */
	public static int intArrayAvg(int[] array, int limit, boolean median) {
        int[] list = Arrays.copyOfRange(array, 0, limit);
        if (median) {
            Arrays.sort(list);
            if ((list.length & 1) == 1) {
                // odd: get the middle value
                return list[(list.length - 1) / 2];
            }
            // even: get the middle two values and find the average of them
            int key = list.length / 2 - 1;
            return (list[key] + list[key + 1]) / 2;
        }

        int sum = 0;
        for (int aList : list) {
            sum += aList;
        }

        return (int)Math.round((double)sum / list.length);
	}
}

