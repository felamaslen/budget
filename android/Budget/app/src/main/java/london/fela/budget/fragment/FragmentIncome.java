package london.fela.budget.fragment;

import android.content.Intent;
import android.os.Bundle;

import london.fela.budget.activity.DialogIncome;
import london.fela.budget.app.AppConfig;

/**
 * Displays an editable table showing each source of income
 */
public class FragmentIncome extends FragmentList {
    @Override
    public void setProps() {
        this.pageName  = "income";

        this.loadingMsgId  = AppConfig.DIALOG_MSG_LOADING_INCOME;
        this.loadingMsg    = "Loading income data...";
    }

    @Override
    public Intent getDialogIntent() {
        return new Intent(getActivity(), DialogIncome.class);
    }

    public static FragmentIncome newInstance() {
        FragmentIncome fragmentIncome = new FragmentIncome();

        Bundle args = new Bundle();
        fragmentIncome.setArguments(args);

        return fragmentIncome;
    }
}