package london.fela.budget.fragment;

import android.content.Intent;
import android.os.Bundle;

import london.fela.budget.activity.DialogBills;
import london.fela.budget.app.AppConfig;

/**
 * Displays an editable table showing each bill
 */
public class FragmentBills extends FragmentList {
  @Override
  public void setProps() {
    this.pageName  = "bills";
    this.dataUrl   = AppConfig.URL_DATA_BILLS;

    this.loadingMsgId  = AppConfig.DIALOG_MSG_LOADING_BILLS;
    this.loadingMsg    = "Loading bills data...";
  }

  @Override
  public Intent getDialogIntent() {
    return new Intent(getActivity(), DialogBills.class);
  }

  public static FragmentBills newInstance() {
    FragmentBills fragmentBills = new FragmentBills();

    Bundle args = new Bundle();
    fragmentBills.setArguments(args);

    return fragmentBills;
  }
}