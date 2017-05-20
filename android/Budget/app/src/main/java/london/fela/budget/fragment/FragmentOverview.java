package london.fela.budget.fragment;

import android.app.Activity;
import android.app.Fragment;
import android.content.Context;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.ListView;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import london.fela.budget.R;
import london.fela.budget.activity.DialogOverviewEdit;
import london.fela.budget.helper.Data;

import static android.app.Activity.RESULT_OK;

/**
 * Displays an editable table showing monthly overview financial data,
 * and draws a graph showing balance over the months
 */
public class FragmentOverview extends Fragment {
  private ListView list;
  private ArrayList<Object> itemList;
  private int startOffset;

  private final int EDIT_ITEM = 119181;
  private int dataIndex; // for editing

  public static FragmentOverview newInstance() {
    FragmentOverview fragmentOverview = new FragmentOverview();

    Bundle args = new Bundle();
    fragmentOverview.setArguments(args);

    return fragmentOverview;
  }
  
  private Map<String, int[]> month = new HashMap<>();
  private final Map<String, Integer> monthMax = new HashMap<>();

  // all columns
  public static final String[] allCols = {
    "funds",      // 0
    "income",     // 1
    "bills",      // 2
    "food",       // 3
    "general",    // 4
    "holiday",    // 5
    "social",     // 6
    "balance",    // 7
    "out",        // 8
    "predicted"   // 9
  };

  // extra column definitions which we calculate from the data
  private static final int[] extraCols = { 8, 9 };

  // columns for which we want to calculate forecasts
  private static final int[] futureCols = { 3, 4, 5, 6 };

  // columns which we show on screen
  public static final int[] visibleCols = { 1, 8, 9 };

  private static final int numExtraCols   = extraCols.length;
  public static final int numVisibleCols  = visibleCols.length;

  public static int startYear ;
  public static int startMonth ;

  private static int currentYear ;
  private static int currentMonth ;

  private static int numMonths = 0;

  // numeric key in data columns which is the present month
  private static int presentKey;

  /**
   * determine whether a year-month is in the future or present
   */
  public static int futureStatus(int year, int month) {
    if (year == currentYear && month == currentMonth) {
      return 1; // present
    }
    else if (year > currentYear || (year == currentYear && month > currentMonth)) {
      return 2; // future
    }
    else {
      return 0; // past
    }
  }

  /**
   * Graph stuff
   * This is commented out because I realised the graph is useless eye candy
   * TODO: add a setting to enable the graph
   */
  /**
  private static GraphOverview graph;
  private static SurfaceHolder graphHolder;

  static float graphUpperPaddingScale = (float)1.1;

  private static float[][] getRanges(float[] dataPoints) {
    float[][] ranges = {
      { 0, (float)numMonths-1 },
      { 0, 0 }
    };

    for (int j = 0; j < numMonths; j++) {
      float val = (float)month.get("predicted")[j] / 100;

      ranges[1][1] = Math.max(ranges[1][1], val * graphUpperPaddingScale);

      dataPoints[j] = val;
    }

    return ranges;
  }

  public static void updateGraph() {
    if (numMonths == 0 || month.get("predicted") == null) {
      return;
    }

    float[] dataPoints = new float[numMonths];

    graph.setRanges(getRanges(dataPoints));

    GraphOverview.CubicLine cubicLine = new GraphOverview.CubicLine(
      dataPoints, presentKey - 1, Color.BLUE, Color.RED
    );

    graphHolder.setFormat(PixelFormat.TRANSLUCENT);

    Canvas canvas = graphHolder.lockCanvas();

    if (canvas != null) {
      graph.calculateTickSize();

      graph.drawAxes(canvas);

      // draw the data points in a smooth line
      cubicLine.draw(canvas);

      graph.drawLabels(canvas);

      graphHolder.unlockCanvasAndPost(canvas);
    }
  }
  // */

  @Override
  public View onCreateView(
    LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState
  ) {
    View view = inflater.inflate(R.layout.fragment_overview, container, false);

    // this is the android ListView widget
    list = (ListView) view.findViewById(R.id.overview_list);

    // remove dividing lines
    list.setDividerHeight(0);
    list.setDivider(null);

    //LinearLayout graphOuter = (LinearLayout) view.findViewById(R.id.graph_outer);

    // set up the graph
    /*
    graph = (GraphOverview) view.findViewById(R.id.graph);

    graphHolder = graph.getHolder();
    // */

    if (month.size() == 0) {
      fetchDataFromCache();
    }
    else {
      // data is already loaded in memory, but may have been
      // altered by other fragments, so we'll update the calculations
      calculateData();
      drawList();

      //updateGraph();
    }

    // handle click (i.e. item edits)
    AdapterView.OnItemClickListener listener = new AdapterView.OnItemClickListener() {
      @Override
      public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        OverviewListItem item = (OverviewListItem) itemList.get(position);

        Intent intent = new Intent(getActivity(), DialogOverviewEdit.class);

        dataIndex = position + startOffset;

        intent.putExtra("year", item.year);
        intent.putExtra("month", item.month);
        intent.putExtra("yearMonth", item.yearMonth);
        intent.putExtra("balance", month.get("balance")[dataIndex]);

        startActivityForResult(intent, EDIT_ITEM);
      }
    };

    list.setOnItemClickListener(listener);

    return view;
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent intent) {
    if (requestCode == EDIT_ITEM && resultCode == RESULT_OK) {
      int newBalance = intent.getIntExtra("balance", -1);

      if (newBalance >= 0) {
        this.month.get("balance")[dataIndex] = newBalance;
        this.updateData();
      }
    }
  }

  private void updateData() {
    updateList();
    //updateGraph();
  }

  public void reloadDataFromCache() {
    month = new HashMap<>();

    fetchDataFromCache();
  }

  private void addListItem(
    int year, int month, String[] cols, String[] text, double[] scores
  ) {
    OverviewListItem item = new OverviewListItem();

    item.setYearMonth(year, month);

    item.setCols(cols, text);
    item.setScores(cols, scores);

    itemList.add(item);
  }

  private boolean itemParamsUpdated(
    String[] cols, String[] text, int[] values, double[] scores, int position
  ) {
    // calculate scores and update item

    String newText;
    int newValue;
    double newScore;

    boolean changed = false;

    for (int i = 0; i < numVisibleCols; i++) {
      cols[i] = allCols[visibleCols[i]];

      newValue  = month.get(cols[i])[position];
      newText   = Data.formatCurrency(newValue, true);
      newScore  = (double)newValue / monthMax.get(cols[i]);

      if (!(newScore == scores[i] && newText.equals(text[i]))) {
        if (!changed) {
          changed = true;
        }

        values[i] = newValue;
        text[i]   = newText;
        scores[i] = newScore;
      }
    }

    return changed;
  }

  /**
   * draw table of overview data
   */
  private void drawList() {
    itemList = new ArrayList<>();

    // the API fetches ThisData going back up to 24 months in the past (inclusive)
    // we want three past months, so that's an offset of up to 24 - 3 = 21
    // the offset essentially cuts off the first 21 months of ThisData from display,
    // without affecting the calculations (such as forecasts)
    int oldMonths = Integer.valueOf(getString(R.string.old_months));

    startOffset = Math.max(Math.min(24 - oldMonths, presentKey - oldMonths + 1), 0);

    int theStartMonth = (startMonth + startOffset - 1) % 12 + 1;
    int theStartYear   = startYear + (int)Math.ceil(
      (double)(startOffset - 12 + startMonth) / 12
    );

    for (
      int y = theStartYear, m = theStartMonth, j = startOffset;
      j < numMonths;
      m++, j++
      ) {

      if (m > 12) {
        m = 1;
        y++;
      }

      String[] cols   = new String[numVisibleCols];
      String[] text   = new String[numVisibleCols];
      int[] values    = new int[numVisibleCols];
      double[] scores = new double[numVisibleCols];

      itemParamsUpdated(cols, text, values, scores, j);

      addListItem(y, m, cols, text, scores);
    }

    OverviewAdapter adapter = new OverviewAdapter(
      getActivity(),
      itemList
    );

    list.setAdapter(adapter);
  }

  /**
   * update list values that have changed
   */
  private void updateList() {
    // go through each list item and update its values from the data
    calculateData();

    for (int j = 0, s = startOffset; j < itemList.size(); j++) {
      OverviewListItem item = (OverviewListItem) itemList.get(j);

      String[] cols   = item.cols;
      String[] text   = item.text;
      double[] scores = item.scores;

      int[] values    = new int[numVisibleCols];

      if (itemParamsUpdated(cols, text, values, scores, j + s)) {
        item.setCols(cols, text);
        item.setScores(cols, scores);

        itemList.set(j, item);
      }
    }
  }

  /**
   * calculate extra columns from response ThisData
   */
  private int[] calculateExtraCol(int extraColKey) {
    switch (extraColKey) {
      case 0: // out
        // calculate the out column

        // sum these columns to find spending
        int[] outCols = { 2, 3, 4, 5, 6 };

        int[] outSum = new int[numMonths];

        for (int j = 0; j < numMonths; j++) {
          int thisSum = 0;

          for (int outCol : outCols) {
            thisSum += month.get(allCols[outCol])[j];
          }

          outSum[j] = thisSum;
        }

        return outSum;

      case 1: // predicted
        // calculate the predicted future balance

        int[] predicted = new int[numMonths];

        int[] income = month.get("income");
        int[] out = month.get("out");

        int[] balance = month.get("balance");

        for (int j = 0; j < numMonths; j++) {
          if (j > presentKey && j > 0) {
            // add this month's net spending to the last balance
            predicted[j] = predicted[j - 1] + income[j] - out[j];
          }
          else {
            // copy the existing value since we're in the past
            predicted[j] = balance[j];
          }
        }

        return predicted;
    }

    return null;
  }

  /**
   * calculate extra column values based on response ThisData
   */
  private void calculateExtraCols() {
    for (int i = 0; i < numExtraCols; i++) {
      String col = allCols[extraCols[i]];

      int[] extraCol = calculateExtraCol(i);

      month.put(col, extraCol);
    }
  }

  /**
   * calculate maximums
   */
  private void calculateMaximums() {
    // we only want to calculate maximums for the visible columns,
    // since the maximum is solely used for the colour calculation
    for (int visibleCol : visibleCols) {
      String key = allCols[visibleCol];

      monthMax.put(
        key,
        Data.intArrayMax(month.get(key))
      );
    }
  }

  /**
   * calculate futures
   */
  private void calculateFutures() {
    int i, j;

    // for each future column, modify the corresponding column in rawValues,
    // adding forecasts
    // Note: the futureCols are a subset of the rawCols
    for (i = 0; i < futureCols.length; i++) {
      String col = allCols[futureCols[i]];

      int avg = Data.intArrayAvg(month.get(col), presentKey + 1, true);

      // fill in the future values with the forecasted value
      for (j = presentKey + 1; j < numMonths; j++) {
        month.get(col)[j] = avg;
      }
    }
  }

  /**
   * call this when updating the display
   */
  private void calculateData() {
    calculateFutures();
    calculateExtraCols();
    calculateMaximums();
  }

  /**
   * puts the raw response JSON data into the global Data class
   */
  private void processDataResponse() {
    startYear       = Data.Cache.Overview.startYear;
    startMonth      = Data.Cache.Overview.startMonth;
    int endYear = Data.Cache.Overview.endYear;
    int endMonth = Data.Cache.Overview.endMonth;
    currentYear     = Data.Cache.Overview.currentYear;
    currentMonth    = Data.Cache.Overview.currentMonth;

    month = Data.Cache.Overview.cost;

    numMonths = Data.yearMonthDifference(endYear, endMonth, startYear, startMonth) + 1;

    presentKey = Data.yearMonthDifference(currentYear, currentMonth, startYear, startMonth);

    calculateData();
  }

  /**
   * fetch data for the overview page
   */
  private void fetchDataFromCache() {
    // fetch data from the cache, which was loaded by MainActivity
    if (Data.dataPreLoaded) {
      try {
        processDataResponse();

        drawList();
        // updateGraph();

      } catch (Exception e) {
        // serious error with API
        e.printStackTrace();
      }
    }

    /*
    AppController.startDialogMessage(AppConfig.DIALOG_MSG_LOADING_OVERVIEW, "Loading overview data...");

    api.request(
      API_TAG_FETCH_DATA,
      "req_data_overview",
      "GET",
      AppConfig.URL_DATA_OVERVIEW,
      null
    );
    */
  }
}

class OverviewListItem {
  private final HashMap<String, String> colText   = new HashMap<>();
  private final HashMap<String, Double> colScore  = new HashMap<>();

  int year;
  int month;

  public int futureStatus;

  public String[] cols;
  public String[] text;

  public double[] scores;

  public String yearMonth;

  public void setYearMonth(int year, int month) {
    this.year = year;
    this.month = month;

    this.futureStatus = FragmentOverview.futureStatus(year, month);

    this.yearMonth = Data.months[month-1] + "-" + Integer.toString(year).substring(2);

    this.colText.put("month", yearMonth);
  }

  public String getCol(String col) {
    return colText.get(col);
  }

  public double getScore(String col) {
    return colScore.get(col);
  }

  public void setCols(String[] cols, String[] text) {
    this.cols = cols;
    this.text = text;

    for (int i = 0; i < text.length; i++) {
      this.colText.put(cols[i], text[i]);
    }
  }

  public void setScores(String[] cols, double[] scores) {
    this.scores = scores;

    for (int i = 0; i < scores.length; i++) {
      this.colScore.put(cols[i], scores[i]);
    }
  }
}

class OverviewAdapter extends BaseAdapter {
  private final ArrayList<Object> itemList;

  private LayoutInflater inflater;

  private final int[] timeBg = {
    0xffdfdfdf, // past (grey)
    0xff009933, // present (green)
    0xfffbe07f  // future (yellow)
  };

  private final int[] timeColor = {
    0xff666666, // past (grey)
    0xff000000, // present (black)
    0xff000000  // future (black)
  };

  private final int[] timeTypeface = {
    Typeface.ITALIC,  // past (italic)
    Typeface.BOLD,    // present (bold)
    Typeface.NORMAL   // future (normal)
  };

  public OverviewAdapter(Activity context, ArrayList<Object> itemList) {
    super();

    this.itemList = itemList;

    if (context != null) {
      this.inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }
  }

  @Override
  public int getCount() {
    return itemList.size();
  }

  @Override
  public Object getItem(int position) {
    return itemList.get(position);
  }

  @Override
  public long getItemId(int position) {
    return 0;
  }

  public static class ViewHolder {
    TextView tvMonth;
    TextView tvIncome;
    TextView tvOut;
    TextView tvBalance;
  }

  private static final Map<String, int[]> colColors;
  static {
    colColors = new HashMap<>();

    int[] colorIn       = { 36,   191,  55 };
    int[] colorOut      = { 191,  36,   36 };
    int[] colorBalance  = { 36,   191,  55 };

    colColors.put("income", colorIn);
    colColors.put("out", colorOut);
    colColors.put("balance", colorBalance);
  }

  private int getColorFromScore(String col, double score) {
    int[] rgbVal = colColors.get(col);

    int r = (int) Math.round(255 - (255 - rgbVal[0]) * score);
    int g = (int) Math.round(255 - (255 - rgbVal[1]) * score);
    int b = (int) Math.round(255 - (255 - rgbVal[2]) * score);

    // 0..255 << 24 is the alpha channel (0x00000000..0xff000000)
    return (255 << 24) + (r << 16) + (g << 8) + b;
  }

  @Override
  public View getView(final int position, View convertView, ViewGroup parent) {
    ViewHolder holder;
    if (convertView == null) {
      holder = new ViewHolder();
      convertView = inflater.inflate(R.layout.row_overview, parent, false);

      TextView[] tv = new TextView[FragmentOverview.numVisibleCols + 1];

      // first one is the month label
      tv[0] =(TextView) convertView.findViewById(R.id.rowOverviewMonth);

      int[] id = {
        R.id.rowOverviewIn,
        R.id.rowOverviewOut,
        R.id.rowOverviewBalance
      };

      for (int i = 0; i < FragmentOverview.numVisibleCols; i++) {
        tv[i + 1] = (TextView) convertView.findViewById(id[i]);
      }

      holder.tvMonth    = tv[0];
      holder.tvIncome   = tv[1];
      holder.tvOut      = tv[2];
      holder.tvBalance  = tv[3];

      convertView.setTag(holder);
    }
    else {
      holder = (ViewHolder) convertView.getTag();
    }

    OverviewListItem item = (OverviewListItem) itemList.get(position);

    holder.tvMonth
      .setText(item.getCol("month"));
    holder.tvIncome
      .setText(item.getCol(
        FragmentOverview.allCols[FragmentOverview.visibleCols[0]]
      ));
    holder.tvOut
      .setText(item.getCol(
        FragmentOverview.allCols[FragmentOverview.visibleCols[1]]
      ));
    holder.tvBalance
      .setText(item.getCol(
        FragmentOverview.allCols[FragmentOverview.visibleCols[2]]
      ));

    int futureStatus = item.futureStatus;

    holder.tvMonth.setBackgroundColor(timeBg[futureStatus]);

    holder.tvIncome.setBackgroundColor(getColorFromScore("income", item.getScore("income")));
    holder.tvOut.setBackgroundColor(getColorFromScore("out", item.getScore("out")));
    holder.tvBalance.setBackgroundColor(getColorFromScore("balance", item.getScore("predicted")));
    
    int textColor = timeColor[futureStatus];
    holder.tvMonth.setTextColor(textColor);
    holder.tvIncome.setTextColor(textColor);
    holder.tvOut.setTextColor(textColor);
    holder.tvBalance.setTextColor(textColor);
    
    int typeFace = timeTypeface[futureStatus];
    holder.tvMonth.setTypeface(null, typeFace);
    holder.tvIncome.setTypeface(null, typeFace);
    holder.tvOut.setTypeface(null, typeFace);
    holder.tvBalance.setTypeface(null, typeFace);

    return convertView;
  }
}
