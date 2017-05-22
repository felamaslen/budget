package london.fela.budget.activity;

import android.os.Bundle;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import london.fela.budget.R;
import london.fela.budget.app.AppConfig;

/**
 * DialogUpdate extension for the In page
 * See DialogUpdate.java for implementation requirements
 */
public class DialogIncome extends DialogUpdate {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    /** set up the activity dialog */
    this.requestWindowFeature(Window.FEATURE_NO_TITLE);
    super.onCreate(savedInstanceState);
    setContentView(R.layout.dialog_edit_basic);

    /** define api URL for this page */
    apiUrlUpdate  = AppConfig.URL_UPDATE_INCOME;
    apiUrlAdd     = AppConfig.URL_ADD_INCOME;

    /** define custom columns */
    String[] cols = {"date", "item", "cost"};

    /** call common onCreate methods */
    onCreateCommon(cols);

    /** field views */
    TextView inputDateTv = (TextView) findViewById(R.id.display_date);
    Button inputDateBtn = (Button) findViewById(R.id.button_date);
    EditText inputItem = (EditText) findViewById(R.id.input_item);
    EditText inputCost = (EditText) findViewById(R.id.input_cost);

    /** field definitions */
    fields.add(new FormFieldDate(cols[0], "Date", inputDateTv, inputDateBtn, this));
    fields.add(new FormFieldText(cols[1], "Item", inputItem, FIELD_TYPE_STRING));
    fields.add(new FormFieldText(cols[2], "Cost", inputCost, FIELD_TYPE_COST));
  }
}