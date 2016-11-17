package london.fela.budget.fragment;

import android.content.Intent;
import android.os.Bundle;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

import london.fela.budget.activity.DialogFood;
import london.fela.budget.app.AppConfig;

/**
 * Displays an editable table showing each food item
 */
public class FragmentFood extends FragmentList {
  @Override
  public void setProps() {
    this.pageName  = "food";

    this.loadingMsgId  = AppConfig.DIALOG_MSG_LOADING_FOOD;
    this.loadingMsg    = "Loading food data...";

    this.props = new String[] { "category", "shop" };
  }

  public HashMap<String, String> getOtherProps(JSONObject json) {
    HashMap<String, String> values = new HashMap<>();

    try {
      values.put("category", json.getString("k"));
      values.put("shop", json.getString("s"));
    }
    catch (JSONException e) {
      e.printStackTrace();
    }

    return values;
  }

  @Override
  public Intent getDialogIntent() {
    return new Intent(getActivity(), DialogFood.class);
  }

  public static FragmentFood newInstance() {
    FragmentFood fragmentFood = new FragmentFood();

    Bundle args = new Bundle();
    fragmentFood.setArguments(args);

    return fragmentFood;
  }
}