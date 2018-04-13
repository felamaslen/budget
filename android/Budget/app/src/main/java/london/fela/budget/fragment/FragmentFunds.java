package london.fela.budget.fragment;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.SparseArray;
import android.view.View;
import android.view.ViewGroup;

import java.util.ArrayList;

import london.fela.budget.R;
import london.fela.budget.activity.DialogFunds;
import london.fela.budget.app.AppConfig;

/**
 * Displays an editable table showing each fund investment
 */
public class FragmentFunds extends FragmentList {
    @Override
    public void setProps() {
        this.pageName  = "funds";

        this.loadingMsgId  = AppConfig.DIALOG_MSG_LOADING_FUNDS;
        this.loadingMsg = "Loading funds data...";

        this.props = new String[] { "value" };
    }

    @Override
    public Intent getDialogIntent() {
        return new Intent(getActivity(), DialogFunds.class);
    }

    @Override
    public void drawList() {
        listAdapter = new ListAdapterFunds(
            getActivity(),
            itemList
        );

        list.setAdapter(listAdapter);
    }

    @Override
    public int getFragmentLayout() {
        return R.layout.fragment_list_funds;
    }

    public static FragmentFunds newInstance() {
        FragmentFunds fragmentFunds = new FragmentFunds();

        Bundle args = new Bundle();
        fragmentFunds.setArguments(args);

        return fragmentFunds;
    }
}

class ListAdapterFunds extends ListAdapter {
    public ListAdapterFunds(Activity context, ArrayList<ListItem> itemList) {
        super(context, itemList);
        this.abbreviateCost = true;
    }

    @Override
    public SparseArray<String> getTextViews(ListItem item) {
        SparseArray<String> idValues = super.getTextViews(item);
        idValues.put(R.id.rowValue, item.otherProps.get("value"));
        idValues.put(R.id.rowCost, item.otherProps.get("cost"));

        return idValues;
    }

    @Override
    public View getConvertView(ViewGroup parent) {
        return inflater.inflate(R.layout.row_list_funds, parent, false);
    }
}
