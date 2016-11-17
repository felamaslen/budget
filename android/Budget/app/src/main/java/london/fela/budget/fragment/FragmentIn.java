package london.fela.budget.fragment;

import android.content.Intent;
import android.os.Bundle;

import london.fela.budget.activity.DialogIn;
import london.fela.budget.app.AppConfig;

/**
 * Displays an editable table showing each source of income
 */
public class FragmentIn extends FragmentList {
  @Override
  public void setProps() {
    this.pageName  = "in";
    this.dataUrl   = AppConfig.URL_DATA_IN;

    this.loadingMsgId  = AppConfig.DIALOG_MSG_LOADING_IN;
    this.loadingMsg    = "Loading in data...";
  }

  @Override
  public Intent getDialogIntent() {
    return new Intent(getActivity(), DialogIn.class);
  }

  public static FragmentIn newInstance() {
    FragmentIn fragmentIn = new FragmentIn();

    Bundle args = new Bundle();
    fragmentIn.setArguments(args);

    return fragmentIn;
  }
}