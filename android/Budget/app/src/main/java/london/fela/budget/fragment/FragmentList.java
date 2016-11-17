package london.fela.budget.fragment;

import android.app.Activity;
import android.app.Fragment;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Parcelable;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import london.fela.budget.R;
import london.fela.budget.app.AppConfig;
import london.fela.budget.app.UPCProduct;
import london.fela.budget.helper.Data;
import london.fela.budget.activity.MainActivity;
import london.fela.budget.app.YMD;
import london.fela.budget.helper.PageCache;

/**
 * Displays an editable list of items (such as food, or funds)
 */
public class FragmentList extends Fragment {
  public final String TAG = FragmentList.class.getSimpleName();

  String pageName = null;
  String dataUrl = null;
  int loadingMsgId = 0;
  String loadingMsg;
  String[] props = new String[] {};
  void setProps() {
    props = new String[] {};
  }
  public HashMap<String, String> getOtherProps(JSONObject json) {
    return new HashMap<>();
  }

  Intent getDialogIntent() { return null; }

  private ListView list;

  private final ArrayList<ListItem> itemList = new ArrayList<>();

  private ListAdapter listAdapter;

  private final int API_TAG_FETCH_DATA = 88181;

  private class intentDialog {
    public ListItem item;
    public final HashMap<String, String> map = new HashMap<>();
    public final Intent intent;

    public void setMap(int position, String item) {
    }

    public intentDialog(int position, String item) {
      setMap(position, item);

      EditParcel values = new EditParcel(map);

      intent = getDialogIntent();

      intent.putExtra("values", values);
      intent.putExtra("dataIndex", position);

      startActivity(intent);
    }
  }
  private class intentDialogEdit extends intentDialog {
    public intentDialogEdit(int position) {
      super(position, null);
    }

    @Override
    public void setMap(int position, String _item) {
      ListItem item = itemList.get(position);

      map.put("id", String.valueOf(item.id));
      map.put("date", item.date.serialise());
      map.put("item", item.item);
      map.put("cost", String.valueOf(item.cost));

      for (String prop : props) {
        map.put(prop, item.otherProps.get(prop));
      }
    }
  }
  private class intentDialogAdd extends intentDialog {
    public intentDialogAdd(String item) {
      super(-1, item);
    }

    @Override
    public void setMap(int position, String item) {
      map.put("date", ""); // this resolves to the current date
      map.put("item", item);
      map.put("cost", "0");

      for (String prop: props) {
        map.put(prop, ""); // default values are all empty for these non-essential items
      }
    }
  }

  // listener for ListView touch (edit item)
  private final AdapterView.OnItemClickListener listenerEdit = new AdapterView.OnItemClickListener() {
    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
      new intentDialogEdit(position);
    }
  };

  // listener for addBtn touch (add item)
  private final Button.OnClickListener listenerAdd = new View.OnClickListener() {
    @Override
    public void onClick(View view) {
      new intentDialogAdd("");
    }
  };

  // listener for scanBtn touch (scan barcode)
  private final Button.OnClickListener listenerScan = new View.OnClickListener() {
    @Override
    public void onClick(View view) {
      try {
        Intent intent = new Intent(AppConfig.ACTION_SCAN);
        intent.putExtra("SCAN_MODE", "PRODUCT_MODE");
        startActivityForResult(intent, AppConfig.SCAN_REQUEST_CODE);
      } catch (ActivityNotFoundException e) {
        Toast.makeText(
          getActivity(), "Barcode scanner app not installed!", Toast.LENGTH_LONG
        ).show();
      }
    }
  };

  /**
   * Called by edit/add dialog after data has been successfully submitted
   * @param position        : position in the list
   * @param newRowParcel    : parcel containing new data
   */
  public void setItemData(
    int position, Parcelable newRowParcel
  ) {

    boolean itemIsNew = position == -1;

    EditParcel newRow = (EditParcel)newRowParcel;

    YMD newDate     = YMD.deserialise(newRow.data.get("date"));
    String newItem  = newRow.data.get("item");
    int newCost     = Integer.valueOf(newRow.data.get("cost"));

    Map<String, String> otherProps = new HashMap<>();
    for (String prop : props) {
      otherProps.put(prop, newRow.data.get(prop));
    }

    YMD oldDate = newDate;
    int oldCost = 0;

    if (itemIsNew) {
      // add list item
      int newId = Integer.valueOf(newRow.data.get("id"));

      ListItem listItem = new ListItem(
        newId, newDate, newItem, newCost, otherProps
      );

      addListItem(listItem);

      // add item to cache
      Data.Cache.Pages.get(pageName).id.put(
        Data.Cache.Pages.get(pageName).numItems++, newId
      );

      Data.Cache.Pages.get(pageName).date.put(newId, newDate);
      Data.Cache.Pages.get(pageName).item.put(newId, newItem);
      Data.Cache.Pages.get(pageName).cost.put(newId, newCost);
      Data.Cache.Pages.get(pageName).other.put(newId, otherProps);
    }
    else {
      // update list item
      ListItem listItem = itemList.get(position);

      oldDate = listItem.date;
      oldCost = listItem.cost;

      listItem.date = newDate;
      listItem.item = newItem;
      listItem.cost = newCost;

      listItem.otherProps = otherProps;

      itemList.set(position, listItem);

      // update the cache item
      int id = listItem.id;

      Data.Cache.Pages.get(pageName).date.put(id, newDate);
      Data.Cache.Pages.get(pageName).item.put(id, newItem);
      Data.Cache.Pages.get(pageName).cost.put(id, newCost);
      Data.Cache.Pages.get(pageName).other.put(id, otherProps);
    }

    // update this page's list
    updateList();

    // update the cache data for this page
    //Data.Cache.pages.get(pageName);

    // update the overview cache data
    int oldMonthKey = Data.yearMonthDifference(
      oldDate.getYear(), oldDate.getMonth(), FragmentOverview.startYear, FragmentOverview.startMonth
    );

    int newMonthKey = Data.yearMonthDifference(
      newDate.getYear(), newDate.getMonth(), FragmentOverview.startYear, FragmentOverview.startMonth
    );

    //refreshOverviewCache();
    // refresh the overview page, if it exists
    try {
      int[] cacheItem = Data.Cache.Overview.cost.get(pageName);

      cacheItem[oldMonthKey] -= oldCost;
      cacheItem[newMonthKey] += newCost;

      Data.Cache.Overview.cost.put(pageName, cacheItem);

      try {
        FragmentOverview overviewPage = (FragmentOverview)
          MainActivity.pagerAdapter.getRegisteredFragment(0);

        overviewPage.reloadDataFromCache();
      }
      catch (Exception e) {
        // the overview page isn't loaded, do nothing
      }
    }
    catch (Exception e) {
      // serious error
      e.printStackTrace();
    }
  }

  public void reloadDataFromCache() {
    itemList.clear();

    fetchDataFromCache();
  }

  @Override
  public View onCreateView(
    LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState
  ) {
    View view = inflater.inflate(R.layout.fragment_list, container, false);

    // this is the android ListView widget
    list = (ListView) view.findViewById(R.id.main_list);

    // remove dividing lines
    list.setDividerHeight(0);
    list.setDivider(null);

    // sets the column titles according to each page
    setProps();

    LinearLayout bg = (LinearLayout) view.findViewById(R.id.list_outer);

    bg.setBackgroundColor(AppConfig.PageColor.getBg(pageName));

    // button to add a new item
    Button addBtn = (Button) view.findViewById(R.id.button_add);

    // button to scan a barcode
    Button scanBtn = (Button) view.findViewById(R.id.button_scan);

    drawList();

    if (itemList.size() == 0) {
      fetchDataFromCache();
    }

    list.setOnItemClickListener(listenerEdit);

    addBtn.setOnClickListener(listenerAdd);

    scanBtn.setOnClickListener(listenerScan);

    return view;
  }

  private void addListItem(ListItem item) {
    itemList.add(item);
  }

  /**
   * draw table of in data
   */
  private void drawList() {
    listAdapter = new ListAdapter(
      getActivity(),
      itemList
    );

    list.setAdapter(listAdapter);
  }

  private void sortList() {
    Collections.sort(itemList);
  }

  private void updateList() {
    sortList();

    listAdapter.notifyDataSetChanged();
  }

  /**
   * fetch data from the cache for this list
   */
  private void fetchDataFromCache() {
    // fetch data from the cache, which was loaded by MainActivity
    if (Data.dataPreLoaded) {
      PageCache pageCache = Data.Cache.Pages.get(pageName);

      for (int i = 0; i < pageCache.numItems; i++) {
        int id = pageCache.id.get(i);

        ListItem item = new ListItem(
          id,
          pageCache.date.get(id),
          pageCache.item.get(id),
          pageCache.cost.get(id),
          pageCache.other.get(id)
        );

        addListItem(item);
      }

      updateList();
    }
  }

  public void onActivityResult(int requestCode, int resultCode, Intent intent) {
    if (requestCode == AppConfig.SCAN_REQUEST_CODE) {
      if (resultCode == Activity.RESULT_OK) {
        String code   = intent.getStringExtra("SCAN_RESULT");
        String format = intent.getStringExtra("SCAN_RESULT_FORMAT");

        final UPCProduct product = new UPCProduct(code, getActivity()) {
          @Override
          public void productFetched(JSONObject res) {
            try {
              String productName = res.getJSONObject("attributes").getString("Brand");

              new intentDialogAdd(productName);
            }
            catch (JSONException e) {
              e.printStackTrace();

              Toast.makeText(getActivity(), "Invalid barcode response", Toast.LENGTH_LONG).show();
            }
          }
        };

        product.request();
      }
    }
  }
}

class ListItem implements Comparable<ListItem> {
  public final int id;

  public YMD date;
  public String item;
  public int cost;

  // custom properties, e.g. "society" for the Socials page
  // these are necessarily strings (TODO: support other property types)
  public Map<String, String> otherProps = new HashMap<>();

  public ListItem(
    int theId, YMD startDate,  String startItem, int startCost, Map<String, String> startOtherProps
  ) {
    id          = theId;
    date        = startDate;
    item        = startItem;
    cost        = startCost;
    otherProps  = startOtherProps;
  }

  public int compareTo(@NonNull ListItem item) {
    return item.date.isAfter(date) ? 1 : (
      date.isAfter(item.date) ? -1 : (
        item.id > id ? 1 : (item.id < id ? -1 : 0)
      )
    );
  }
}

class ListAdapter extends BaseAdapter {
  private final ArrayList<ListItem> itemList;

  private final Activity context;
  private LayoutInflater inflater;

  public ListAdapter(Activity context, ArrayList<ListItem> itemList) {
    super();

    this.context = context;

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
    TextView tvDate;
    TextView tvItem;
    TextView tvCost;
  }

  @Override
  public View getView(final int position, View convertView, ViewGroup parent) {
    ViewHolder holder;
    if (convertView == null) {
      holder = new ViewHolder();
      convertView = inflater.inflate(R.layout.row_list, parent, false);

      TextView[] tv = new TextView[3];

      int[] id = {
        R.id.rowDate,
        R.id.rowItem,
        R.id.rowCost
      };

      for (int i = 0; i < id.length; i++) {
        tv[i] = (TextView) convertView.findViewById(id[i]);
      }

      holder.tvDate = tv[0];
      holder.tvItem = tv[1];
      holder.tvCost = tv[2];

      convertView.setTag(holder);
    }
    else {
      holder = (ViewHolder) convertView.getTag();
    }

    ListItem item = itemList.get(position);

    holder.tvDate.setText(item.date.format());
    holder.tvItem.setText(item.item);
    holder.tvCost.setText(Data.formatCurrency(item.cost));

    return convertView;
  }
}