package london.fela.budget.fragment;

import android.content.Intent;
import android.os.Bundle;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

import london.fela.budget.activity.DialogGeneral;
import london.fela.budget.app.AppConfig;

/**
 * Displays an editable table showing each general item
 */
public class FragmentGeneral extends FragmentList {
    @Override
    public void setProps() {
        this.pageName  = "general";

        this.loadingMsgId  = AppConfig.DIALOG_MSG_LOADING_GENERAL;
        this.loadingMsg    = "Loading general data...";

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
        return new Intent(getActivity(), DialogGeneral.class);
    }

    public static FragmentGeneral newInstance() {
        FragmentGeneral fragmentGeneral = new FragmentGeneral();

        Bundle args = new Bundle();
        fragmentGeneral.setArguments(args);

        return fragmentGeneral;
    }
}