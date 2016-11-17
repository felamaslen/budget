package london.fela.budget.fragment;

import android.content.Intent;
import android.os.Bundle;

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
    this.loadingMsg    = "Loading funds data...";
  }

  @Override
  public Intent getDialogIntent() {
    return new Intent(getActivity(), DialogFunds.class);
  }

  public static FragmentFunds newInstance() {
    FragmentFunds fragmentFunds = new FragmentFunds();

    Bundle args = new Bundle();
    fragmentFunds.setArguments(args);

    return fragmentFunds;
  }
}