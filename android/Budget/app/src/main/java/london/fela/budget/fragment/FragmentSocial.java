package london.fela.budget.fragment;

import android.content.Intent;
import android.os.Bundle;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

import london.fela.budget.activity.DialogSocial;
import london.fela.budget.app.AppConfig;

/**
 * Displays an editable table showing each social item
 */
public class FragmentSocial extends FragmentList {
    @Override
    public void setProps() {
        this.pageName  = "social";

        this.loadingMsgId  = AppConfig.DIALOG_MSG_LOADING_SOCIAL;
        this.loadingMsg    = "Loading social data...";

        this.props = new String[] { "society", "shop" };
    }

    public HashMap<String, String> getOtherProps(JSONObject json) {
        HashMap<String, String> values = new HashMap<>();

        try {
            values.put("society", json.getString("y"));
            values.put("shop", json.getString("s"));
        }
        catch (JSONException e) {
            e.printStackTrace();
        }

        return values;
    }

    @Override
    public Intent getDialogIntent() {
        return new Intent(getActivity(), DialogSocial.class);
    }

    public static FragmentSocial newInstance() {
        FragmentSocial fragmentSocial = new FragmentSocial();

        Bundle args = new Bundle();
        fragmentSocial.setArguments(args);

        return fragmentSocial;
    }
}