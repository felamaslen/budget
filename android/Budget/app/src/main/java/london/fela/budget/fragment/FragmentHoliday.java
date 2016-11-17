package london.fela.budget.fragment;

import android.content.Intent;
import android.os.Bundle;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

import london.fela.budget.activity.DialogHoliday;
import london.fela.budget.app.AppConfig;

/**
 * Displays an editable table showing each holiday item
 */
public class FragmentHoliday extends FragmentList {
  @Override
  public void setProps() {
    this.pageName  = "holiday";
    this.dataUrl   = AppConfig.URL_DATA_HOLIDAY;

    this.loadingMsgId  = AppConfig.DIALOG_MSG_LOADING_HOLIDAY;
    this.loadingMsg    = "Loading holiday data...";

    this.props = new String[] { "holiday", "shop" };
  }

  public HashMap<String, String> getOtherProps(JSONObject json) {
    HashMap<String, String> values = new HashMap<>();

    try {
      values.put("holiday", json.getString("h"));
      values.put("shop", json.getString("s"));
    }
    catch (JSONException e) {
      e.printStackTrace();
    }

    return values;
  }

  @Override
  public Intent getDialogIntent() {
    return new Intent(getActivity(), DialogHoliday.class);
  }

  public static FragmentHoliday newInstance() {
    FragmentHoliday fragmentHoliday = new FragmentHoliday();

    Bundle args = new Bundle();
    fragmentHoliday.setArguments(args);

    return fragmentHoliday;
  }
}