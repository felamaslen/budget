package london.fela.budget.activity;

import android.os.Bundle;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import london.fela.budget.R;
import london.fela.budget.app.AppConfig;
import london.fela.budget.fragment.EditParcel;
import london.fela.budget.fragment.FragmentList;

/**
 * DialogUpdate extension for the Bills page
 * See DialogUpdate.java for implementation requirements
 */
public class DialogHoliday extends DialogUpdate {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    /** set up the activity dialog */
    this.requestWindowFeature(Window.FEATURE_NO_TITLE);
    super.onCreate(savedInstanceState);
    setContentView(R.layout.dialog_edit_holiday);

    /** define api URL for this page */
    apiUrlUpdate  = AppConfig.URL_UPDATE_HOLIDAY;
    apiUrlAdd     = AppConfig.URL_ADD_HOLIDAY;

    /** define custom columns */
    String[] cols = {"date", "item", "holiday", "cost", "shop"};

    /** call common onCreate methods */
    onCreateCommon(cols);

    /** field views */
    /* declare views */
    TextView inputDateTv = (TextView) findViewById(R.id.display_date);
    Button inputDateBtn = (Button) findViewById(R.id.button_date);
    EditText inputItem = (EditText) findViewById(R.id.input_item);
    EditText inputHoliday = (EditText) findViewById(R.id.input_holiday);
    EditText inputCost = (EditText) findViewById(R.id.input_cost);
    EditText inputShop = (EditText) findViewById(R.id.input_shop);

    /** field definitions */
    fields.add(new FormFieldDate(cols[0], "Date", inputDateTv, inputDateBtn, this));
    fields.add(new FormFieldText(cols[1], "Item", inputItem, FIELD_TYPE_STRING));
    fields.add(new FormFieldText(cols[2], "Category", inputHoliday, FIELD_TYPE_STRING));
    fields.add(new FormFieldText(cols[3], "Cost", inputCost, FIELD_TYPE_COST));
    fields.add(new FormFieldText(cols[4], "Shop", inputShop, FIELD_TYPE_STRING));
  }
}
