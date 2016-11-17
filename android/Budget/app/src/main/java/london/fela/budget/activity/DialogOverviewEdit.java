package london.fela.budget.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

import london.fela.budget.R;
import london.fela.budget.app.Api;
import london.fela.budget.app.ApiCaller;
import london.fela.budget.app.AppConfig;
import london.fela.budget.app.AppController;
import london.fela.budget.helper.Data;
import london.fela.budget.fragment.FragmentOverview;


public class DialogOverviewEdit extends Activity implements Api {
  private int balance;
  private int newBalance;
  private int year;
  private int month;

  private EditText inputBalance;

  private ProgressBar progressBar;

  private final int API_TAG_POST_EDIT = 0;

  /** api stuff */
  @Override
  public void apiResponse(int tag, String response) {
    switch (tag) {
      case API_TAG_POST_EDIT:

        break;
    }
  }
  @Override
  public void apiJSONSuccess(int tag, JSONObject res) {
    switch (tag) {
      case API_TAG_POST_EDIT:
        // successfully posted edit
        Intent intent = this.getIntent();
        intent.putExtra("balance", newBalance);
        this.setResult(RESULT_OK, intent);

        break;
    }
  }
  @Override
  public void apiJSONError(int tag, String msg) {
    AppController.alert(getApplicationContext(), "Error: " + msg);
  }
  @Override
  public void apiJSONException(int tag, JSONException e, String response) {
    AppController.alert(getApplicationContext(), "Bug: API error");
  }
  @Override
  public void apiError(int tag, VolleyError error) {
    switch (tag) {
      case API_TAG_POST_EDIT:
        AppController.alert(getApplicationContext(), "Bug: API error");

        break;
    }
  }
  @Override
  public void apiResponseEnd(int tag, String response) {
    // close the dialog whatever happened
    progressBar.setVisibility(View.INVISIBLE);

    finish();
  }

  private ApiCaller api;
  private void apiSetup() {
    api = new ApiCaller(getResources().getString(R.string.api_url));
    api.addListener(this);
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    this.requestWindowFeature(Window.FEATURE_NO_TITLE);

    super.onCreate(savedInstanceState);
    setContentView(R.layout.dialog_overview_edit);

    apiSetup();

    progressBar = (ProgressBar) findViewById(R.id.progressBar);

    TextView tvTitle = (TextView) findViewById(R.id.tvtitle);
    inputBalance = (EditText) findViewById(R.id.input_balance);
    Button btnSubmit = (Button) findViewById(R.id.btn_submit);
    Button btnCancel = (Button) findViewById(R.id.btn_cancel);

    balance   = getIntent().getExtras().getInt("balance");
    year      = getIntent().getExtras().getInt("year");
    month     = getIntent().getExtras().getInt("month");

    String titleText = getString(R.string.dialog_overview_edit) + " "
      + Data.yearMonth(year, month);

    tvTitle.setText(titleText);

    inputBalance.setText(Data.formatCurrency(balance));

    Data.setInputCurrency(inputBalance);

    // submit button click event
    btnSubmit.setOnClickListener(new View.OnClickListener() {
      public void onClick(View view) {
        String balanceString = inputBalance.getText().toString().trim()
          .replaceAll("[^0-9\\.]", "");

        // check for empty data
        if (!balanceString.isEmpty()) {
          double balanceDouble = Double.valueOf(balanceString);

          newBalance = (int)(Math.round(balanceDouble * 100.0));

          if (newBalance != balance) {
            HashMap<String, String> params = new HashMap<>();

            params.put("balance", String.valueOf(newBalance));
            params.put("year", String.valueOf(year));
            params.put("month", String.valueOf(month));

            progressBar.setVisibility(View.VISIBLE);

            api.request(
              API_TAG_POST_EDIT,
              "req_update_overview",
              "POST",
              AppConfig.URL_UPDATE_OVERVIEW,
              params
            );
          }
          else {
            finish();
          }
        }
        else {
          // prompt user to enter data
          AppController.alert(getApplicationContext(), "Please enter a balance!");
        }
      }
    });

    btnCancel.setOnClickListener(new View.OnClickListener() {
      public void onClick(View view) {
        finish();
      }
    });
  }
}
