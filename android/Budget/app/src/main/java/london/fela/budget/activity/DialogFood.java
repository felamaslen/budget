package london.fela.budget.activity;

import android.os.Bundle;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import london.fela.budget.R;
import london.fela.budget.app.AppConfig;

/**
 * DialogUpdate extension for the Bills page
 * See DialogUpdate.java for implementation requirements
 */
public class DialogFood extends DialogUpdate {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        /* set up the activity dialog */
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dialog_edit_general);

        /* define api URL for this page */
        apiUrl = AppConfig.URL_FOOD;

        /* define custom columns */
        String[] cols = {"date", "item", "category", "cost", "shop"};

        /* call common onCreate methods */
        onCreateCommon(cols);

        /* field views */
        TextView inputDateTv = findViewById(R.id.display_date);
        Button inputDateBtn = findViewById(R.id.button_date);
        EditText inputItem = findViewById(R.id.input_item);
        EditText inputCategory = findViewById(R.id.input_category);
        EditText inputCost = findViewById(R.id.input_cost);
        EditText inputShop = findViewById(R.id.input_shop);

        /* field definitions */
        fields.add(new FormFieldDate(cols[0], "Date", inputDateTv, inputDateBtn, this));
        fields.add(new FormFieldText(cols[1], "Item", inputItem, FIELD_TYPE_STRING));
        fields.add(new FormFieldText(cols[2], "Category", inputCategory, FIELD_TYPE_STRING));
        fields.add(new FormFieldText(cols[3], "Cost", inputCost, FIELD_TYPE_COST));
        fields.add(new FormFieldText(cols[4], "Shop", inputShop, FIELD_TYPE_STRING));
    }
}
