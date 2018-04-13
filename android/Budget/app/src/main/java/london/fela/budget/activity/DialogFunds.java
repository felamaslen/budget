package london.fela.budget.activity;

import android.os.Bundle;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import london.fela.budget.R;
import london.fela.budget.app.AppConfig;

/**
 * DialogUpdate extension for the Funds page
 * See DialogUpdate.java for implementation requirements
 */
public class DialogFunds extends DialogUpdate {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        /** set up the activity dialog */
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dialog_edit_funds);

        /** define api URL for this page */
        apiUrl = AppConfig.URL_FUNDS;

        /** define custom columns */
        String[] cols = {"item"};

        /** call common onCreate methods */
        onCreateCommon(cols);

        /** field views */
        EditText inputItem = (EditText) findViewById(R.id.input_item);

        /** field definitions */
        fields.add(new FormFieldText(cols[0], "Item", inputItem, FIELD_TYPE_STRING));
    }
}

