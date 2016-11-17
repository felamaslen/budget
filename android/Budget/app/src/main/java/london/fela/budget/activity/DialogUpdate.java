package london.fela.budget.activity;

import android.app.Activity;
import android.app.DatePickerDialog;
import android.content.Context;
import android.view.View;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;

import london.fela.budget.R;
import london.fela.budget.app.Api;
import london.fela.budget.app.ApiCaller;
import london.fela.budget.app.AppController;
import london.fela.budget.helper.Data;
import london.fela.budget.app.YMD;
import london.fela.budget.fragment.EditParcel;

/**
 * General edit form which can be extended to different pages
 *
 * Classes which extend this class must do the following:
 * - define any inputs except for the date, e.g:
 *   EditText inputMyText
 *
 * - override onCreate method:
 */
public class DialogUpdate extends Activity {
  public static final String TAG = DialogFunds.class.getSimpleName();

  private int dataIndex;
  private String id;

  private EditParcel newItem;

  private final HashMap<String, String> oldValues = new HashMap<>();

  private ProgressBar progressBar;

  private String apiUrl;

  String apiUrlAdd = null;
  String apiUrlUpdate = null;

  private final int API_TAG_POST_EDIT  = 163;
  private final int API_TAG_POST_ADD   = 187;

  private int API_TAG;

  @SuppressWarnings("UnusedParameters")
  void updateFragment(int index, EditParcel item) { }

  /** api stuff */
  private final Api apiObject = new Api() {
    @Override
    public void apiResponse(int tag, String response) {
    }

    @Override
    public void apiJSONSuccess(int tag, JSONObject res) {
      switch (tag) {
        case API_TAG_POST_ADD:
          // if we're adding an item, we want to get the ID which was inserted
          int newId = 0;
          try {
            newId = res.getInt("id");
          }
          catch (JSONException e) {
            e.printStackTrace();
          }

          newItem.data.put("id", String.valueOf(newId));

          // don't break, because we want to continue as if we're editing an item

        case API_TAG_POST_EDIT:
          // successfully posted edit/add
          updateFragment(dataIndex, newItem);

          progressBar.setVisibility(View.INVISIBLE);
          finish();

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
      AppController.alert(getApplicationContext(), "Bug: API error");

      switch (tag) {
        // close the dialog whatever happened
        case API_TAG_POST_EDIT:
        case API_TAG_POST_ADD:
          progressBar.setVisibility(View.INVISIBLE);
          finish();

          break;
      }
    }

    @Override
    public void apiResponseEnd(int tag, String response) {
      switch (tag) {
        // close the dialog whatever happened
        case API_TAG_POST_EDIT:
        case API_TAG_POST_ADD:
          progressBar.setVisibility(View.INVISIBLE);
          finish();

          break;
      }
    }
  };

  private ApiCaller api;
  private void apiSetup() {
    api = new ApiCaller(getResources().getString(R.string.api_url));
    api.addListener(apiObject);
  }

  final class SubmitForm {
    private final HashMap<String, String> params = new HashMap<>();

    private boolean noneChanged = true;
    private boolean invalid = false;

    /**
     * validate form values and add them to the request parameters
     */
    private void validateFields() {
      for (FormField field : fields) {
        boolean checkEmpty = true;

        String formValue = null;

        switch (field.type) {
          case FIELD_TYPE_DATE:
            checkEmpty = false;

            // the date dialog changes these values itself, so no need to update newItem here

            YMD newDate = YMD.deserialise(newItem.data.get(field.name));

            params.put(field.name, newDate.serialise());

            // see if the value has been changed
            if (noneChanged && !newDate.isEqual(YMD.deserialise(oldValues.get(field.name)))) {
              noneChanged = false;
            }

            break;

          case FIELD_TYPE_STRING:
            formValue = field.getFormValue();

            newItem.data.put(field.name, formValue);

            params.put(field.name, formValue);

            // see if the value has been changed
            if (noneChanged && !formValue.equals(oldValues.get(field.name))) {
              noneChanged = false;
            }

            break;

          case FIELD_TYPE_COST:
            formValue = field.getFormValue().trim()
              .replaceAll("[^0-9\\.]", "");

            double costDouble = Double.valueOf(formValue);

            int costInt = (int)Math.round(costDouble * 100.0);

            String costString = String.valueOf(costInt);

            newItem.data.put(field.name, costString);

            params.put(field.name, costString);

            // see if the value has been changed
            if (noneChanged && !costString.equals(oldValues.get(field.name))) {
              noneChanged = false;
            }

            break;
        }

        if (checkEmpty && formValue != null && formValue.isEmpty()) {
          AppController.alert(getApplicationContext(), "Please enter data!");

          invalid = true;

          break;
        }
      }
    }

    private void submit() {
      if (!invalid) {
        if (!noneChanged) {
          if (id != null) {
            // add the ID parameter
            params.put("id", id);
          }

          progressBar.setVisibility(View.VISIBLE);

          api.request(
            API_TAG,
            "req_update_item",
            "POST",
            apiUrl,
            params
          );
        } else {
          // nothing changed - no point making an API request
          finish();
        }
      }
    }

    public SubmitForm() {
      validateFields();

      submit();
    }
  }

  private final View.OnClickListener btnSubmitListener = new View.OnClickListener() {
    public void onClick(View view) { new SubmitForm(); }
  };

  //public final int FIELD_TYPE_INT = 0; // TODO
  final int FIELD_TYPE_STRING = 1;
  final int FIELD_TYPE_COST = 2;
  private final int FIELD_TYPE_DATE = 3;

  public class FormField {
    public final String name;
    public final String title;

    public int type;

    // this should be modified for each field
    public String getFormValue() {
      return "";
    }

    public FormField(String theName, String theTitle) {
      name = theName;
      title = theTitle;
    }
  }
  public class FormFieldText extends FormField {
    public final EditText input;

    public String getFormValue() {
      return input.getText().toString();
    }

    public FormFieldText(
      String theName, String theTitle, EditText theInput, int theType
    ) {
      super(theName, theTitle);

      input = theInput;
      type = theType;

      String value = oldValues.get(name);

      if (type == FIELD_TYPE_COST) {
        value = Data.formatCurrency(Integer.valueOf(value));
        input.setText(value);

        Data.setInputCurrency(input);
      }
      else {
        input.setText(value);
      }
    }
  }
  @SuppressWarnings("SameParameterValue")
  public class FormFieldDate extends FormField {
    public final TextView display;
    public final Button btnChange;

    final DatePickerDialog datePicker;

    public final DatePickerDialog.OnDateSetListener datePickerListener = new DatePickerDialog.OnDateSetListener() {
      @Override
      public void onDateSet(DatePicker view, int year, int month, int date) {
        YMD newDate = new YMD(year, ++month, date);

        newItem.data.put(name, newDate.serialise());

        display.setText(newDate.format());
      }
    };

    public FormFieldDate(
      String theName, String theTitle, TextView theDisplay, Button theButton, Context context
    ) {
      super(theName, theTitle);

      display = theDisplay;
      btnChange = theButton;

      type = FIELD_TYPE_DATE;

      YMD oldDate = YMD.deserialise(oldValues.get(name));

      display.setText(oldDate.format());

      datePicker = new DatePickerDialog(
        context, R.style.dialogTheme, datePickerListener,
        oldDate.getYear(), oldDate.getMonth()-1, oldDate.getDate()
      );
      datePicker.setCancelable(false);
      datePicker.setTitle("Select a date");
      btnChange.setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          datePicker.show();
        }
      });
    }
  }

  final ArrayList<FormField> fields = new ArrayList<>();

  void onCreateCommon(String[] cols) {
    // get values parcel from page activity
    EditParcel values = getIntent().getParcelableExtra("values");

    // set original values, for comparison on submit
    for (String col : cols) {
      oldValues.put(col, values.data.get(col));
    }

    // create parcel for transfer back to the page activity on submit
    newItem = new EditParcel(values.data);

    String titleText;

    // determine if this is a edit or add form, and set title accordingly
    dataIndex = getIntent().getExtras().getInt("dataIndex");

    if (dataIndex == -1) {
      // this is an add form
      titleText = getString(R.string.dialog_title_add);

      API_TAG = API_TAG_POST_ADD;
      apiUrl = apiUrlAdd;
    }
    else {
      id = values.data.get("id");
      titleText = getString(R.string.dialog_title) + " id#" + id;

      API_TAG = API_TAG_POST_EDIT;
      apiUrl  = apiUrlUpdate;
    }

    // set up the API caller
    apiSetup();

    // views common to all pages
    Button btnSubmit = (Button) findViewById(R.id.btn_submit);
    Button btnCancel = (Button) findViewById(R.id.btn_cancel);
    progressBar = (ProgressBar) findViewById(R.id.progressBar);
    TextView tvTitle = (TextView) findViewById(R.id.tvtitle);

    tvTitle.setText(titleText);

    // submit button click event
    btnSubmit.setOnClickListener(btnSubmitListener);

    // cancel button click event
    btnCancel.setOnClickListener(new View.OnClickListener() {
      public void onClick(View view) {
        finish();
      }
    });
  }
}